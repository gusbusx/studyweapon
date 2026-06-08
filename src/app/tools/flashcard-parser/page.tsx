'use client'

import { useState, useRef, useCallback } from 'react'

interface Card { front: string; back: string }
type ParseMode = 'auto' | 'colon' | 'dash' | 'tab' | 'blank-line' | 'q-a'
type DeckFormat = 'anki' | 'quizlet' | 'csv'

function parseCards(raw: string, mode: ParseMode): Card[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const cards: Card[] = []
  if (mode === 'auto') {
    const colonCount = lines.filter(l => /^.+[:：].+/.test(l)).length
    const qaCount    = lines.filter(l => /^[Qq][:.]\s/.test(l)).length
    const dashCount  = lines.filter(l => /^.+\s-\s.+/.test(l)).length
    if (qaCount > 2) return parseCards(raw, 'q-a')
    if (colonCount >= lines.length * 0.5) return parseCards(raw, 'colon')
    if (dashCount  >= lines.length * 0.5) return parseCards(raw, 'dash')
    return parseCards(raw, 'blank-line')
  }
  if (mode === 'colon') {
    for (const line of lines) {
      const idx = line.indexOf(':')
      if (idx > 0 && idx < line.length - 1)
        cards.push({ front: line.slice(0, idx).trim(), back: line.slice(idx + 1).trim() })
    }
  } else if (mode === 'dash') {
    for (const line of lines) {
      const m = line.match(/^(.+?)\s-\s(.+)$/)
      if (m) cards.push({ front: m[1].trim(), back: m[2].trim() })
    }
  } else if (mode === 'tab') {
    for (const line of lines) {
      const parts = line.split('\t')
      if (parts.length >= 2) cards.push({ front: parts[0].trim(), back: parts.slice(1).join('\t').trim() })
    }
  } else if (mode === 'blank-line') {
    const chunks = raw.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean)
    for (const chunk of chunks) {
      const parts = chunk.split('\n').map(l => l.trim()).filter(Boolean)
      if (parts.length >= 2) cards.push({ front: parts[0], back: parts.slice(1).join(' ') })
    }
  } else if (mode === 'q-a') {
    let i = 0
    while (i < lines.length) {
      const qm = lines[i].match(/^[Qq][:.]\s*(.+)/)
      if (qm && i + 1 < lines.length) {
        const am = lines[i + 1].match(/^[Aa][:.]\s*(.+)/)
        if (am) { cards.push({ front: qm[1].trim(), back: am[1].trim() }); i += 2; continue }
      }
      i++
    }
  }
  return cards
}

function buildCSV(cards: Card[], format: DeckFormat): string {
  if (format === 'anki') {
    return '#separator:Semicolon\n#html:false\n#notetype:Basic\n#deck:My Deck\n' +
      cards.map(c => `${c.front.replace(/"/g,'""')};${c.back.replace(/"/g,'""')}`).join('\n')
  }
  if (format === 'quizlet') return cards.map(c => `${c.front}\t${c.back}`).join('\n')
  return '"Front","Back"\n' + cards.map(c => `"${c.front.replace(/"/g,'""')}","${c.back.replace(/"/g,'""')}"`).join('\n')
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const MODES: { value: ParseMode; label: string; example: string }[] = [
  { value: 'auto',       label: 'Auto-detect',      example: 'Detects your format' },
  { value: 'colon',      label: 'Term: Definition',  example: 'Mitosis: Cell division' },
  { value: 'dash',       label: 'Term — Definition', example: 'Osmosis — Water movement' },
  { value: 'q-a',        label: 'Q: / A: pairs',     example: 'Q: What is ATP?\nA: Energy' },
  { value: 'blank-line', label: 'Blank line pairs',  example: 'Front\nBack\n\nFront\nBack' },
  { value: 'tab',        label: 'Tab-separated',     example: 'Term[tab]Definition' },
]

const SAMPLE = `Mitosis: A type of cell division resulting in two identical daughter cells
Meiosis: Cell division producing four genetically unique gametes
ATP: Adenosine triphosphate — the primary energy currency of cells
Osmosis: The movement of water across a semipermeable membrane
DNA replication: The process of copying DNA before cell division
Transcription: Synthesis of mRNA from a DNA template
Translation: Building a protein from an mRNA sequence`

function CardPreview({ cards }: { cards: Card[] }) {
  const [flipped, setFlipped] = useState<Record<number,boolean>>({})
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
      {cards.slice(0, 20).map((card, i) => (
        <button key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
          className={`text-left rounded-2xl border p-4 text-sm transition-all min-h-[70px]
            ${flipped[i]
              ? 'bg-[#e6f9ec] border-[#34c759]/30 text-[#1d1d1f]'
              : 'bg-white border-black/[0.06] hover:border-black/10 text-[#1d1d1f]'}`}>
          <div className="text-[10px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-wider">
            {flipped[i] ? 'Back' : 'Front'} · {i + 1}
          </div>
          <div className="leading-snug line-clamp-2 text-sm">
            {flipped[i] ? card.back : card.front}
          </div>
        </button>
      ))}
      {cards.length > 20 && (
        <div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-4 flex items-center justify-center text-sm text-[#86868b]">
          +{cards.length - 20} more cards
        </div>
      )}
    </div>
  )
}

export default function FlashcardParserPage() {
  const [input, setInput]       = useState('')
  const [cards, setCards]       = useState<Card[]>([])
  const [mode, setMode]         = useState<ParseMode>('auto')
  const [format, setFormat]     = useState<DeckFormat>('anki')
  const [deckName, setDeckName] = useState('My Deck')
  const [parsed, setParsed]     = useState(false)
  const [error, setError]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleParse = useCallback(() => {
    if (!input.trim()) { setError('Paste some notes first.'); return }
    const result = parseCards(input, mode)
    if (result.length === 0) {
      setError(`No cards found with "${MODES.find(m => m.value === mode)?.label}" mode. Try a different mode.`)
      setCards([]); setParsed(false); return
    }
    setError(''); setCards(result); setParsed(true)
  }, [input, mode])

  const handleDownload = () => {
    if (!cards.length) return
    const ext = format === 'csv' ? 'csv' : 'txt'
    downloadBlob(buildCSV(cards, format), `${deckName.replace(/\s+/g,'_') || 'flashcards'}.${ext}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3] transition-colors">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] font-medium">Flashcard Maker</span>
      </div>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-[#e6f9ec] text-[#34c759] rounded-full px-3.5 py-1.5 text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
          100% Free · Works in browser
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] tracking-[-0.02em] mb-3">
          Anki Flashcard Maker
        </h1>
        <p className="text-[#6e6e73] max-w-lg leading-relaxed">
          Paste your lecture notes or vocabulary list and download an Anki-ready file instantly. No account needed.
        </p>
      </div>

      <div className="ad-slot w-full mb-10">Advertisement</div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">
        {/* Left */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Your Notes</span>
              <div className="flex gap-2">
                <button onClick={() => { setInput(SAMPLE); setMode('colon'); setParsed(false); setCards([]) }}
                  className="text-xs text-[#0071e3] font-medium hover:underline">Load sample</button>
                <button onClick={() => fileRef.current?.click()}
                  className="text-xs text-[#0071e3] font-medium hover:underline">Upload .txt</button>
                <input ref={fileRef} type="file" accept=".txt,.md,.csv" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setInput(ev.target?.result as string ?? ''); r.readAsText(f) }} />
              </div>
            </div>
            <textarea className="apple-textarea min-h-52 text-sm font-mono"
              placeholder={'Paste notes here. Examples:\n\nTerm: Definition\nTerm - Definition\nQ: Question\nA: Answer'}
              value={input} onChange={e => { setInput(e.target.value); setParsed(false) }} spellCheck={false} />
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>{input.trim() ? input.trim().split('\n').filter(Boolean).length : 0} lines</span>
              {parsed && <span className="text-[#34c759] font-semibold animate-fade-in">✓ {cards.length} cards detected</span>}
            </div>
            {error && <p className="text-sm text-[#ff3b30] bg-[#fff0f0] rounded-xl px-4 py-2.5">{error}</p>}
            <button onClick={handleParse} disabled={!input.trim()}
              className="apple-btn rounded-2xl py-3 text-sm disabled:opacity-40">
              ▦ Parse into Flashcards
            </button>
          </div>

          <div className="ad-slot h-20">Advertisement</div>

          {parsed && cards.length > 0 && (
            <div className="animate-fade-up">
              <h3 className="font-bold text-sm text-[#1d1d1f] mb-3">Preview — tap to flip</h3>
              <CardPreview cards={cards} />
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-5">
            <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">Parse Mode</h3>
            <div className="flex flex-col gap-2">
              {MODES.map(m => (
                <button key={m.value} onClick={() => { setMode(m.value); setParsed(false) }}
                  className={`text-left rounded-2xl border px-4 py-3 transition-all
                    ${mode === m.value ? 'border-[#0071e3]/30 bg-[#e8f0fe]' : 'border-black/[0.06] hover:border-black/10 bg-white'}`}>
                  <div className={`text-sm font-semibold ${mode === m.value ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>{m.label}</div>
                  <div className="text-[11px] text-[#86868b] mt-0.5 font-mono">{m.example}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={`bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-5 transition-opacity ${parsed && cards.length > 0 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">Export</h3>
            <div className="flex gap-2 mb-4">
              {(['anki','quizlet','csv'] as DeckFormat[]).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all
                    ${format === f ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#ebebed]'}`}>
                  {f}
                </button>
              ))}
            </div>
            <input type="text" value={deckName} onChange={e => setDeckName(e.target.value)}
              className="apple-input text-sm mb-4" placeholder="Deck name" />
            {parsed && cards.length > 0 && (
              <div className="bg-[#e6f9ec] rounded-2xl px-4 py-3 mb-3 animate-fade-in">
                <div className="font-semibold text-sm text-[#1d1d1f]">{cards.length} cards ready</div>
                <div className="text-xs text-[#86868b] mt-0.5">{deckName || 'flashcards'}.{format === 'csv' ? 'csv' : 'txt'}</div>
              </div>
            )}
            <button onClick={handleDownload} disabled={!parsed || !cards.length}
              className="apple-btn-blue w-full rounded-2xl py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              ↓ Download File
            </button>
            <p className="text-[10px] text-[#86868b] text-center mt-3 leading-relaxed">
              Anki: File → Import → select .txt<br/>
              Quizlet: Create → Import → paste
            </p>
          </div>

          <div className="ad-slot h-40 rounded-3xl">Advertisement</div>
        </div>
      </div>

      <div className="mt-10 rounded-3xl bg-[#f5f5f7] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-[#1d1d1f] text-sm mb-0.5">Share with your study group</p>
          <p className="text-xs text-[#6e6e73]">"Paste your notes → instant Anki cards 📚 theacademicweapon.com"</p>
        </div>
        <ShareBtn />
      </div>

      <section className="mt-12 pt-8 border-t border-black/[0.06]">
        <h2 className="font-bold text-sm text-[#1d1d1f] mb-2">About This Tool</h2>
        <p className="text-sm text-[#6e6e73] leading-relaxed max-w-3xl">
          Free Anki flashcard generator that converts lecture notes and vocabulary lists into downloadable CSV files. Supports colon-separated terms, dash-separated pairs, Q&A format, and tab-separated data. Entirely client-side — your notes never leave your browser. No signup, no limits.
        </p>
      </section>
    </div>
  )
}

function ShareBtn() {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText('Paste your notes → instant Anki cards 📚 theacademicweapon.com/tools/flashcard-parser'); setCopied(true); setTimeout(() => setCopied(false), 2500) }}
      className="shrink-0 apple-btn rounded-full px-6 py-2.5 text-sm">
      {copied ? '✓ Copied!' : 'Copy link'}
    </button>
  )
}
