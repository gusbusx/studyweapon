'use client'
import { useState, useMemo } from 'react'

export default function WordCounterPage() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const words     = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars     = text.length
    const charsNoSp = text.replace(/\s/g, '').length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length
    const readTime  = Math.max(1, Math.ceil(words / 238))
    return { words, chars, charsNoSp, sentences, paragraphs, readTime }
  }, [text])

  const stats_display = [
    { label: 'Words',           value: stats.words.toLocaleString() },
    { label: 'Characters',      value: stats.chars.toLocaleString() },
    { label: 'No spaces',       value: stats.charsNoSp.toLocaleString() },
    { label: 'Sentences',       value: stats.sentences.toLocaleString() },
    { label: 'Paragraphs',      value: stats.paragraphs.toLocaleString() },
    { label: 'Read time',       value: `~${stats.readTime} min` },
  ]

  return (
    <div className="max-w-4xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3] transition-colors">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] font-medium">Word Counter</span>
      </div>
      <h1 className="font-extrabold text-4xl text-[#1d1d1f] tracking-[-0.02em] mb-3">Word Counter</h1>
      <p className="text-[#6e6e73] mb-10">Paste or type your text to get an instant word and character count.</p>

      <div className="ad-slot w-full mb-10">Advertisement</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats_display.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-black/[0.06] shadow-apple-sm p-4 text-center">
            <div className="font-extrabold text-xl text-[#0071e3] tracking-tight">{s.value}</div>
            <div className="text-xs text-[#86868b] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-5">
        <textarea
          className="apple-textarea w-full min-h-72 text-sm"
          placeholder="Start typing or paste your essay, paper, or text here…"
          value={text}
          onChange={e => setText(e.target.value)}
          spellCheck
        />
        {text && (
          <button onClick={() => setText('')}
            className="mt-3 text-xs text-[#86868b] hover:text-[#ff3b30] font-medium transition-colors">
            Clear text
          </button>
        )}
      </div>

      <div className="ad-slot w-full mt-8">Advertisement</div>
    </div>
  )
}
