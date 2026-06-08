'use client'
import { useState } from 'react'

const SECTIONS = [
  {
    id: 'ai', eyebrow: 'AI Tools', title: 'AI-powered writing', subtitle: 'Let AI do the heavy lifting.',
    tools: [
      { id: 'humanizer',   href: '/tools/humanizer',    icon: '✦',  color: 'blue',   label: 'AI Humanizer',  tag: 'AI',   desc: 'Make AI-written text sound natural and human.', popular: true },
      { id: 'ai-detector', href: '/tools/ai-detector',  icon: '🔍', color: 'purple', label: 'AI Detectors',  tag: 'Free', desc: 'Check writing with GPTZero, Copyleaks & more.' },
      { id: 'wordcount',   href: '/tools/word-counter', icon: '#',  color: 'blue',   label: 'Word Counter',  tag: 'Free', desc: 'Words, characters, sentences, read time.' },
    ],
  },
  {
    id: 'study', eyebrow: 'Study', title: 'Ace every class', subtitle: 'GPA, flashcards, timers — all in one place.',
    tools: [
      { id: 'gpa',     href: '/tools/gpa-predictor',    icon: '◎',  color: 'orange', label: 'GPA Predictor',         tag: 'Free', desc: 'Drag sliders to see exactly what grade you need.', hot: true },
      { id: 'canvas', href: '/tools/canvas-calculator', icon: '🎓', color: 'blue',   label: 'Canvas Grade Calc',     tag: 'Free', desc: 'Calculate your exact Canvas course grade by group.' },
      { id: 'flash',  href: '/tools/flashcard-parser',  icon: '▦',  color: 'green',  label: 'Flashcard Maker',       tag: 'Free', desc: 'Paste notes → instant Anki CSV download.' },
      { id: 'grade',     href: '/tools/grade-curve',      icon: '∿', color: 'teal',   label: 'Grade Curve Calc', tag: 'Free', desc: 'Bell-curve your raw score using class stats.' },
      { id: 'pomodoro',  href: '/tools/pomodoro',         icon: '◷', color: 'red',    label: 'Pomodoro Timer',   tag: 'Free', desc: 'Built-in focus timer with session tracking.' },
    ],
  },
  {
    id: 'converters', eyebrow: 'Converters', title: 'Convert anything', subtitle: 'Images, PDFs, files — all browser-based, nothing uploaded.',
    tools: [
      { id: 'image-converter', href: '/tools/image-converter', icon: '🖼️', color: 'blue',   label: 'Photo Converter',      tag: 'Free', desc: 'PNG, JPG, WEBP, crop, resize, flip, compress & more.' },
      { id: 'pdf-tools',       href: '/tools/pdf-tools',       icon: '📄', color: 'orange', label: 'PDF Tools',            tag: 'Free', desc: 'Merge, split, rotate, protect & edit PDFs.', hot: false },
      { id: 'file-converter',  href: '/tools/file-converter',  icon: '⇄',  color: 'teal',   label: 'File Converter',       tag: 'Free', desc: 'CSV, JSON, XML and Excel conversions.' },
      { id: 'remove-bg',       href: '/tools/remove-bg',       icon: '✂️', color: 'purple', label: 'Background Remover',   tag: 'Free', desc: 'Remove any image background instantly with AI.' },
    ],
  },
  {
    id: 'writing', eyebrow: 'Writing', title: 'Write better, faster', subtitle: 'Citations and writing tools done right.',
    tools: [
      { id: 'citation', href: '/tools/citation-builder', icon: '❝', color: 'purple', label: 'Citation Builder', tag: 'Free', desc: 'Perfect APA, MLA & Chicago citations in one click.' },
    ],
  },
]

const COLOR_MAP: Record<string, { bg: string; darkBg: string; text: string; chip: string }> = {
  blue:   { bg: 'bg-[#e8f0fe]', darkBg: 'dark:bg-[#0071e3]/20', text: 'text-[#0071e3]', chip: 'bg-[#0071e3]/10 text-[#0071e3]' },
  green:  { bg: 'bg-[#e6f9ec]', darkBg: 'dark:bg-[#34c759]/20', text: 'text-[#34c759]', chip: 'bg-[#34c759]/10 text-[#34c759]' },
  orange: { bg: 'bg-[#fff3e0]', darkBg: 'dark:bg-[#ff9500]/20', text: 'text-[#ff9500]', chip: 'bg-[#ff9500]/10 text-[#ff9500]' },
  purple: { bg: 'bg-[#f3e8ff]', darkBg: 'dark:bg-[#7c3aed]/20', text: 'text-[#7c3aed]', chip: 'bg-[#7c3aed]/10 text-[#7c3aed]' },
  teal:   { bg: 'bg-[#e0f7f7]', darkBg: 'dark:bg-[#0d9488]/20', text: 'text-[#0d9488]', chip: 'bg-[#0d9488]/10 text-[#0d9488]' },
  red:    { bg: 'bg-[#fff0f0]', darkBg: 'dark:bg-[#ff3b30]/20', text: 'text-[#ff3b30]', chip: 'bg-[#ff3b30]/10 text-[#ff3b30]' },
}

type Tool = { id: string; href: string; icon: string; color: string; label: string; tag: string; desc: string; popular?: boolean; hot?: boolean }

function ToolCard({ tool }: { tool: Tool }) {
  const c = COLOR_MAP[tool.color]
  return (
    <a href={tool.href} className="relative group bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 flex flex-col gap-4 shadow-apple-sm hover:shadow-apple transition-all duration-300 hover:-translate-y-1">
      {tool.popular && <div className="absolute -top-3 left-5"><span className="bg-[#0071e3] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-blue-glow tracking-wide">MOST POPULAR</span></div>}
      {tool.hot && !tool.popular && <div className="absolute -top-3 left-5"><span className="bg-[#ff9500] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">#1 TOOL</span></div>}
      <div className="flex items-start justify-between pt-1">
        <div className={`w-11 h-11 rounded-2xl ${c.bg} ${c.darkBg} flex items-center justify-center text-xl ${c.text} font-bold`}>{tool.icon}</div>
        <span className={`chip ${c.chip} text-[10px] font-bold tracking-wide`}>{tool.tag}</span>
      </div>
      <div>
        <h3 className="font-bold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-1 group-hover:text-[#0071e3] transition-colors">{tool.label}</h3>
        <p className="text-sm text-[#6e6e73] leading-relaxed">{tool.desc}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0071e3] mt-auto">
        Open tool
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 transition-transform">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </a>
  )
}

export default function HomePage() {
  const [copied, setCopied] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-5 pt-16 pb-24">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse"/>
          FREE · NO SIGNUP · WORKS INSTANTLY
        </div>
        <h1 className="font-extrabold text-5xl sm:text-6xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.03em] leading-[1.05] mb-5">
          Every tool your<br/><span className="text-[#0071e3]">semester needs.</span>
        </h1>
        <p className="text-lg text-[#6e6e73] leading-relaxed max-w-xl mx-auto">Free AI writing tools, study helpers, and converters built for students. No paywalls. No limits.</p>
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <a href="/tools/humanizer" className="apple-btn-blue rounded-full px-7 py-3.5 text-sm font-bold shadow-blue-glow">Try AI Humanizer →</a>
          <a href="/tools/gpa-predictor" className="apple-btn-outline rounded-full px-7 py-3.5 text-sm font-bold">GPA Predictor</a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
        {[{ val: '15+', label: 'free tools' }, { val: '0', label: 'signups needed' }, { val: '$0', label: 'cost, forever' }, { val: '100%', label: 'browser-safe' }].map(s => (
          <div key={s.label} className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-2xl px-5 py-4 text-center">
            <div className="font-extrabold text-2xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">{s.val}</div>
            <div className="text-xs text-[#86868b] mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ad-slot w-full mb-14">Advertisement</div>

      {/* Sections */}
      {SECTIONS.map((section, i) => (
        <div key={section.id} className={i > 0 ? 'mt-16' : ''}>
          <div className="mb-6">
            <div className="section-eyebrow mb-1">{section.eyebrow}</div>
            <h2 className="font-extrabold text-2xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">{section.title}</h2>
            <p className="text-[#6e6e73] text-sm mt-0.5">{section.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {section.tools.map(t => <ToolCard key={t.id} tool={t} />)}
          </div>
          {i === 1 && <div className="ad-slot w-full mt-14">Advertisement</div>}
        </div>
      ))}

      {/* Share */}
      <div className="mt-16 rounded-3xl bg-[#f5f5f7] dark:bg-[#1c1c1e] p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <p className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Tell your group chat.</p>
          <p className="text-sm text-[#6e6e73]">"This tool literally saved my GPA 😭 thestudyweapon.com"</p>
        </div>
        <button onClick={() => { navigator.clipboard.writeText('This tool literally saved my GPA 😭 thestudyweapon.com'); setCopied(true); setTimeout(() => setCopied(false), 2500) }}
          className="shrink-0 apple-btn-blue text-sm rounded-full px-6 py-3">
          {copied ? '✓ Copied!' : 'Copy & Share'}
        </button>
      </div>

      <section className="mt-16 pt-10 border-t border-black/[0.06] dark:border-white/[0.06] grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Free AI Writing Tools for Students</h2>
          <p className="text-sm text-[#6e6e73] leading-relaxed">StudyWeapon provides a free AI humanizer, AI detectors hub, word counter, citation builder and more. No data stored or sold.</p>
        </div>
        <div>
          <h2 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Free Calculators, Converters & Study Tools</h2>
          <p className="text-sm text-[#6e6e73] leading-relaxed">GPA predictor, flashcard maker, grade curve calculator, pomodoro timer, photo converter, PDF tools, file converter and background remover. All free, all in your browser.</p>
        </div>
      </section>
    </div>
  )
}
