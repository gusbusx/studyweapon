'use client'
import { useState, useEffect, useRef } from 'react'

const NAV_ITEMS = [
  {
    label: 'AI Tools',
    items: [
      { href: '/tools/humanizer',    label: 'AI Humanizer',   desc: 'Make AI text sound human',    icon: '✦' },
      { href: '/tools/ai-detector',  label: 'AI Detectors',   desc: 'GPTZero, Copyleaks & more',   icon: '🔍' },
      { href: '/tools/word-counter', label: 'Word Counter',   desc: 'Words, chars & read time',    icon: '#' },
    ],
  },
  {
    label: 'Study',
    items: [
      { href: '/tools/gpa-predictor',      label: 'GPA Predictor',          desc: 'See what grade you need',     icon: '◎', hot: true },
      { href: '/tools/canvas-calculator', label: 'Canvas Grade Calc',      desc: 'Calculate your Canvas grade', icon: '🎓' },
      { href: '/tools/flashcard-parser',  label: 'Flashcard Maker',        desc: 'Paste notes → Anki CSV',      icon: '▦' },
      { href: '/tools/grade-curve',       label: 'Grade Curve',            desc: 'Bell-curve your score',       icon: '∿' },
      { href: '/tools/pomodoro',          label: 'Pomodoro Timer',         desc: 'Focus timer + tracking',      icon: '◷' },
    ],
  },
  {
    label: 'Converters',
    items: [
      { href: '/tools/image-converter', label: 'Photo Converter', desc: 'PNG, JPG, WEBP, crop & more', icon: '🖼️' },
      { href: '/tools/pdf-tools',       label: 'PDF Tools',       desc: 'Merge, split, rotate & more', icon: '📄' },
      { href: '/tools/file-converter',  label: 'File Converter',  desc: 'CSV, JSON, XML, Excel',       icon: '⇄' },
      { href: '/tools/remove-bg',       label: 'Remove BG',       desc: 'Remove image background',     icon: '✂️' },
    ],
  },
  {
    label: 'Writing',
    items: [
      { href: '/tools/citation-builder', label: 'Citation Builder', desc: 'APA, MLA & Chicago',       icon: '❝' },
      { href: '/tools/word-counter',     label: 'Word Counter',     desc: 'Words, chars & read time',  icon: '#' },
    ],
  },
]

function SunIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M11.89 4.11l1.06-1.06M3.05 12.95l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
}

function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 9.5A6 6 0 016.5 2.5a6.5 6.5 0 100 11 6 6 0 007-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
}

function ChevronDown() {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}

export default function SiteNav() {
  const [darkMode, setDarkMode] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const enter = (label: string) => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setOpenMenu(label) }
  const leave = () => { timeoutRef.current = setTimeout(() => setOpenMenu(null), 150) }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#0071e3] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L13 4.5V11.5L8 14.5L3 11.5V4.5L8 1.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Study<span className="text-[#0071e3]">Weapon</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(nav => (
            <div key={nav.label} className="relative" onMouseEnter={() => enter(nav.label)} onMouseLeave={leave}>
              <button className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all
                ${openMenu === nav.label ? 'text-[#1d1d1f] dark:text-white bg-[#f5f5f7] dark:bg-white/10' : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-white/10'}`}>
                {nav.label}
                <span className={`transition-transform duration-200 ${openMenu === nav.label ? 'rotate-180' : ''}`}><ChevronDown /></span>
              </button>
              {openMenu === nav.label && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl py-2"
                  onMouseEnter={() => enter(nav.label)} onMouseLeave={leave}>
                  {nav.items.map(item => (
                    <a key={item.href + item.label} href={item.href}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] transition-colors group">
                      <span className="w-7 h-7 rounded-lg bg-[#e8f0fe] dark:bg-[#0071e3]/20 flex items-center justify-center text-[#0071e3] text-xs font-bold shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors">{item.label}</span>
                          {'hot' in item && item.hot && <span className="text-[9px] font-bold bg-[#0071e3] text-white px-1.5 py-0.5 rounded-full">HOT</span>}
                        </div>
                        <span className="text-xs text-[#86868b]">{item.desc}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleDark} className="w-8 h-8 rounded-full flex items-center justify-center text-[#6e6e73] dark:text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-all" aria-label="Toggle dark mode">
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={() => { navigator.clipboard.writeText('This tool saved my GPA 😭 thestudyweapon.com'); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="hidden sm:flex apple-btn-blue text-xs px-4 py-2 rounded-full">
            {copied ? '✓ Copied!' : 'Share'}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {mobileOpen ? <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/> : <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-black px-5 py-4 space-y-4">
          {NAV_ITEMS.map(nav => (
            <div key={nav.label}>
              <p className="text-xs font-bold text-[#86868b] uppercase tracking-wider mb-2">{nav.label}</p>
              <div className="space-y-1">
                {nav.items.map(item => (
                  <a key={item.href + item.label} href={item.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-colors">
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
