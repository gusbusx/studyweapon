'use client'
import { useState, useEffect, useRef } from 'react'

type CitationStyle = 'apa' | 'mla' | 'chicago'
type SourceType = 'book' | 'website' | 'journal'

interface CitationData {
  title: string; authors: string[]; year: string; publisher: string
  url: string; doi: string; journal: string; volume: string
  issue: string; pages: string; isbn: string; accessed: string
}
interface Suggestion {
  title: string; authors: string[]; year: string
  publisher: string; isbn: string; cover?: string; key: string
}
interface SavedCitation {
  id: number; text: string; style: CitationStyle
}

const EMPTY: CitationData = {
  title: '', authors: [], year: '', publisher: '', url: '', doi: '',
  journal: '', volume: '', issue: '', pages: '', isbn: '',
  accessed: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

let cid = 1

function fmtAPA(name: string) {
  const p = name.trim().split(' ')
  if (p.length === 1) return p[0]
  return `${p[p.length - 1]}, ${p.slice(0, -1).map(x => x[0] + '.').join(' ')}`
}
function fmtMLA(name: string) {
  const p = name.trim().split(' ')
  if (p.length === 1) return p[0]
  return `${p[p.length - 1]}, ${p.slice(0, -1).join(' ')}`
}
function buildCitation(d: CitationData, style: CitationStyle, type: SourceType): string {
  const aAPA = d.authors.length ? d.authors.map(fmtAPA).join(', ') : 'Unknown Author'
  const aMLA = d.authors.length ? (d.authors.length === 1 ? fmtMLA(d.authors[0]) : `${fmtMLA(d.authors[0])}, and ${d.authors.slice(1).join(', ')}`) : 'Unknown Author'
  const aChi = d.authors.join(', ') || 'Unknown Author'
  const yr = d.year || 'n.d.'
  if (style === 'apa') {
    if (type === 'website') return `${aAPA}. (${yr}). ${d.title}. ${d.publisher ? d.publisher + '. ' : ''}${d.url}`
    if (type === 'journal') return `${aAPA}. (${yr}). ${d.title}. ${d.journal}, ${d.volume}${d.issue ? `(${d.issue})` : ''}, ${d.pages}.${d.doi ? ` https://doi.org/${d.doi}` : ''}`
    return `${aAPA}. (${yr}). ${d.title}. ${d.publisher}.`
  }
  if (style === 'mla') {
    if (type === 'website') return `${aMLA}. "${d.title}." ${d.publisher || 'Web'}, ${yr}, ${d.url}. Accessed ${d.accessed}.`
    if (type === 'journal') return `${aMLA}. "${d.title}." ${d.journal}, vol. ${d.volume}, no. ${d.issue}, ${yr}, pp. ${d.pages}.`
    return `${aMLA}. ${d.title}. ${d.publisher}, ${yr}.`
  }
  if (type === 'website') return `${aChi}. "${d.title}." ${d.publisher ? d.publisher + '. ' : ''}${yr}. ${d.url}.`
  if (type === 'journal') return `${aChi}. "${d.title}." ${d.journal} ${d.volume}, no. ${d.issue} (${yr}): ${d.pages}.`
  return `${aChi}. ${d.title}. ${d.publisher}, ${yr}.`
}

async function searchOpenLibrary(query: string): Promise<Suggestion[]> {
  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,first_publish_year,publisher,isbn,cover_i&limit=7`)
  if (!res.ok) return []
  const json = await res.json()
  return (json.docs || []).map((d: { key?: string; title?: string; author_name?: string[]; first_publish_year?: number; publisher?: string[]; isbn?: string[]; cover_i?: number }) => ({
    key: d.key || '', title: d.title || '', authors: d.author_name || [],
    year: d.first_publish_year?.toString() || '', publisher: d.publisher?.[0] || '',
    isbn: d.isbn?.[0] || '', cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-S.jpg` : '',
  }))
}

async function lookupDOI(doi: string): Promise<Partial<CitationData>> {
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
  if (!res.ok) throw new Error('DOI not found')
  const json = await res.json(); const w = json.message
  const authors = (w.author || []).map((a: { given?: string; family?: string }) => [a.given, a.family].filter(Boolean).join(' '))
  const issued = w.issued?.['date-parts']?.[0]
  return { title: (w.title || [''])[0], authors, year: issued?.[0]?.toString() || '', journal: (w['container-title'] || [''])[0], volume: w.volume || '', issue: w.issue || '', pages: w.page || '', doi, publisher: w.publisher || '' }
}

function Field({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider block mb-1.5">{label}</label>
      <input className="apple-input text-sm" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

// ── Works Cited Page Component ─────────────────────────────────────────────
function WorksCitedPage({ citations, style, onRemove }: { citations: SavedCitation[]; style: CitationStyle; onRemove: (id: number) => void }) {
  const [copied, setCopied] = useState(false)
  const pageTitle = style === 'mla' ? 'Works Cited' : style === 'apa' ? 'References' : 'Bibliography'
  const sorted = [...citations].sort((a, b) => a.text.localeCompare(b.text))

  const copyAll = () => {
    const text = `${pageTitle}\n\n${sorted.map(c => c.text).join('\n\n')}`
    navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (citations.length === 0) return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm p-10 text-center">
      <div className="text-4xl mb-3">📄</div>
      <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Your Works Cited page is empty</p>
      <p className="text-sm text-[#86868b]">Generate a citation below and click "Add to Works Cited" to build your list.</p>
    </div>
  )

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-black/[0.04] dark:border-white/[0.04] bg-[#f9f9fb] dark:bg-[#2c2c2e]">
        <span className="text-xs font-bold text-[#86868b] uppercase tracking-wider">{citations.length} citation{citations.length !== 1 ? 's' : ''}</span>
        <button onClick={copyAll} className="text-xs font-semibold text-[#0071e3] hover:underline flex items-center gap-1.5">
          {copied ? '✓ Copied!' : '⎘ Copy All'}
        </button>
      </div>

      {/* Simulated page */}
      <div className="p-8 bg-white dark:bg-[#1c1c1e]">
        {/* Page title — centered, same font as a real works cited page */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-wide" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {pageTitle}
          </h2>
        </div>

        {/* Citations — hanging indent style */}
        <div className="space-y-4">
          {sorted.map(c => (
            <div key={c.id} className="group flex items-start gap-3">
              {/* Citation text with hanging indent */}
              <p
                className="flex-1 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  textIndent: '-2em',
                  paddingLeft: '2em',
                  lineHeight: '2',
                }}
              >
                {c.text}
              </p>
              <button
                onClick={() => onRemove(c.id)}
                className="shrink-0 text-[#86868b] hover:text-[#ff3b30] opacity-0 group-hover:opacity-100 transition-all text-sm mt-1"
                title="Remove"
              >✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CitationPage() {
  const [style, setStyle] = useState<CitationStyle>('mla')
  const [type, setType] = useState<SourceType>('book')
  const [data, setData] = useState<CitationData>(EMPTY)
  const [citation, setCitation] = useState('')
  const [copiedOne, setCopiedOne] = useState(false)
  const [autofilled, setAutofilled] = useState(false)
  const [savedCitations, setSavedCitations] = useState<SavedCitation[]>([])
  const [addedFlash, setAddedFlash] = useState(false)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.length < 2 || /^10\.\d{4,}\//.test(query) || /^https?:\/\//.test(query)) {
      setSuggestions([]); setShowDropdown(false); return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try { const r = await searchOpenLibrary(query); setSuggestions(r); setShowDropdown(r.length > 0) }
      catch { setSuggestions([]) }
      setSearching(false)
    }, 350)
  }, [query])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowDropdown(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const select = (s: Suggestion) => {
    setData(prev => ({ ...prev, title: s.title, authors: s.authors, year: s.year, publisher: s.publisher, isbn: s.isbn }))
    setQuery(s.title); setShowDropdown(false); setAutofilled(true); setType('book'); setCitation(''); setSearchError('')
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true); setSearchError('')
    try {
      if (/^10\.\d{4,}\//.test(query.trim())) { const r = await lookupDOI(query.trim()); setData(prev => ({ ...prev, ...r })); setType('journal'); setAutofilled(true) }
      else if (/^https?:\/\//.test(query.trim())) { setData(prev => ({ ...prev, url: query.trim() })); setType('website'); setAutofilled(true) }
      else { const r = await searchOpenLibrary(query.trim()); if (r.length > 0) select(r[0]); else setSearchError('No results found. Try different wording.') }
    } catch { setSearchError('Something went wrong. Try again.') }
    setLoading(false)
  }

  const update = (key: keyof CitationData, val: string) => {
    setData(prev => ({ ...prev, [key]: key === 'authors' ? val.split(',').map(s => s.trim()).filter(Boolean) : val }))
    setCitation('')
  }

  const generate = () => setCitation(buildCitation(data, style, type))

  const addToList = () => {
    if (!citation) return
    setSavedCitations(prev => [...prev, { id: cid++, text: citation, style }])
    setAddedFlash(true); setTimeout(() => setAddedFlash(false), 2000)
  }

  const removeFromList = (id: number) => setSavedCitations(prev => prev.filter(c => c.id !== id))

  const STYLES: { id: CitationStyle; label: string }[] = [{ id: 'mla', label: 'MLA 9th' }, { id: 'apa', label: 'APA 7th' }, { id: 'chicago', label: 'Chicago' }]
  const TYPES: { id: SourceType; label: string; icon: string }[] = [{ id: 'book', label: 'Book', icon: '📚' }, { id: 'website', label: 'Website', icon: '🌐' }, { id: 'journal', label: 'Journal', icon: '📄' }]
  const pageTitle = style === 'mla' ? 'Works Cited' : style === 'apa' ? 'References' : 'Bibliography'

  return (
    <div className="max-w-4xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3]">Home</a><span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Citation Builder</span>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse"/>
          MLA · APA · Chicago · Auto-fill · Free
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-2">Citation Generator</h1>
        <p className="text-[#6e6e73] max-w-lg">Search by title, ISBN, DOI, or URL — builds your Works Cited page automatically.</p>
      </div>

      <div className="ad-slot w-full mb-8">Advertisement</div>

      {/* Works Cited Page — always visible at top */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7]">📄 {pageTitle}</h2>
          {savedCitations.length > 0 && (
            <button onClick={() => setSavedCitations([])} className="text-xs text-[#ff3b30] font-medium hover:underline">Clear all</button>
          )}
        </div>
        <WorksCitedPage citations={savedCitations} style={style} onRemove={removeFromList} />
      </div>

      <div className="ad-slot w-full mb-8">Advertisement</div>

      {/* Style + Type */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-[#f5f5f7] dark:bg-[#1c1c1e] p-1 rounded-2xl">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => { setStyle(s.id); setCitation('') }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${style === s.id ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-apple-sm' : 'text-[#6e6e73]'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[#f5f5f7] dark:bg-[#1c1c1e] p-1 rounded-2xl">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => { setType(t.id); setCitation('') }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${type === t.id ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-apple-sm' : 'text-[#6e6e73]'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm p-6 mb-5">
        <h2 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">🔍 Search & Auto-fill</h2>
        <div className="relative" ref={wrapperRef}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input className="apple-input text-sm w-full"
                placeholder='Try "The Fault in Our Stars" or "Diary of a Wimpy Kid"…'
                value={query}
                onChange={e => { setQuery(e.target.value); setSearchError('') }}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                autoComplete="off" />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin w-4 h-4 text-[#86868b]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
            <button onClick={handleSearch} disabled={!query.trim() || loading}
              className="apple-btn-blue rounded-xl px-5 text-sm disabled:opacity-40 shrink-0">
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-24 mt-1.5 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl overflow-hidden">
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => select(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] transition-colors text-left border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                  {s.cover
                    ? <img src={s.cover} alt="" className="w-8 h-11 object-cover rounded shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
                    : <div className="w-8 h-11 rounded bg-[#e8f0fe] dark:bg-[#0071e3]/20 flex items-center justify-center shrink-0 text-base">📚</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{s.title}</p>
                    <p className="text-xs text-[#86868b] truncate">{s.authors.slice(0, 2).join(', ')}{s.year ? ` · ${s.year}` : ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {[['Book title', '"Diary of a Wimpy Kid"'], ['ISBN', '9780525478812'], ['DOI', '10.1000/xyz123'], ['URL', 'https://example.com']].map(([label, ex]) => (
            <span key={label} className="text-[10px] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] rounded-full px-2.5 py-1 font-medium">
              {label} <span className="opacity-60">{ex}</span>
            </span>
          ))}
        </div>
        {searchError && <p className="text-sm text-[#ff3b30] bg-[#fff0f0] dark:bg-[#ff3b30]/10 rounded-xl px-4 py-2.5 mt-3">⚠ {searchError}</p>}
      </div>

      {/* Fields */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">✏️ {autofilled ? 'Review & Edit Details' : 'Enter Details Manually'}</h2>
          {autofilled && <span className="chip bg-[#e6f9ec] text-[#34c759] text-[10px] font-bold">✓ Auto-filled</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Field label="Title" value={data.title} onChange={v => update('title', v)} placeholder="Title of work" /></div>
          <div className="sm:col-span-2"><Field label="Authors (comma separated)" value={data.authors.join(', ')} onChange={v => update('authors', v)} placeholder="John Smith, Jane Doe" /></div>
          <Field label="Year" value={data.year} onChange={v => update('year', v)} placeholder="2024" />
          <Field label="Publisher" value={data.publisher} onChange={v => update('publisher', v)} placeholder="Publisher name" />
          {type === 'website' && <div className="sm:col-span-2"><Field label="URL" value={data.url} onChange={v => update('url', v)} placeholder="https://example.com" /></div>}
          {type === 'journal' && <>
            <Field label="Journal Name" value={data.journal} onChange={v => update('journal', v)} placeholder="Journal of Science" />
            <Field label="DOI" value={data.doi} onChange={v => update('doi', v)} placeholder="10.1000/xyz123" />
            <Field label="Volume" value={data.volume} onChange={v => update('volume', v)} placeholder="12" />
            <Field label="Issue" value={data.issue} onChange={v => update('issue', v)} placeholder="3" />
            <Field label="Pages" value={data.pages} onChange={v => update('pages', v)} placeholder="45-67" />
          </>}
          {type === 'book' && <Field label="ISBN" value={data.isbn} onChange={v => update('isbn', v)} placeholder="9780743273565" />}
        </div>
      </div>

      <button onClick={generate} disabled={!data.title}
        className="apple-btn-blue w-full rounded-2xl py-4 text-sm font-bold mb-4 disabled:opacity-40 shadow-blue-glow">
        Generate {style.toUpperCase()} Citation
      </button>

      {/* Generated citation + Add button */}
      {citation && (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-[#34c759]/30 shadow-apple-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="chip bg-[#e6f9ec] text-[#34c759] text-xs font-bold">✓ {style.toUpperCase()} Ready</span>
            <button onClick={() => { navigator.clipboard.writeText(citation); setCopiedOne(true); setTimeout(() => setCopiedOne(false), 2000) }}
              className="text-sm font-semibold text-[#0071e3] hover:underline">{copiedOne ? '✓ Copied!' : '⎘ Copy'}</button>
          </div>
          <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl p-4 mb-4"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '2' }}>
            {citation}
          </p>
          <button onClick={addToList}
            className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${addedFlash ? 'bg-[#34c759] text-white' : 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] hover:bg-[#3a3a3c] dark:hover:bg-[#f0f0f0]'}`}>
            {addedFlash ? '✓ Added to Works Cited!' : `+ Add to ${pageTitle}`}
          </button>
          <p className="text-xs text-[#86868b] mt-3 text-center">Always double-check against your style guide before submitting.</p>
        </div>
      )}

      <div className="ad-slot w-full mt-4">Advertisement</div>
    </div>
  )
}
