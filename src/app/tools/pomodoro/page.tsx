'use client'
import { useState, useEffect, useRef } from 'react'

type Mode = 'focus' | 'short' | 'long'
const DURATIONS: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }
const LABELS: Record<Mode, string> = { focus: 'Focus', short: 'Short Break', long: 'Long Break' }

export default function PomodoroPage() {
  const [mode, setMode]         = useState<Mode>('focus')
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus)
  const [running, setRunning]   = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTimeLeft(DURATIONS[mode])
    setRunning(false)
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false)
            if (mode === 'focus') setSessions(s => s + 1)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / DURATIONS[mode]
  const circumference = 2 * Math.PI * 90
  const colors: Record<Mode, string> = { focus: '#0071e3', short: '#34c759', long: '#ff9500' }
  const color = colors[mode]

  return (
    <div className="max-w-2xl mx-auto px-5 pt-12 pb-24 text-center">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8 justify-start">
        <a href="/" className="hover:text-[#0071e3] transition-colors">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] font-medium">Pomodoro Timer</span>
      </div>
      <h1 className="font-extrabold text-4xl text-[#1d1d1f] tracking-[-0.02em] mb-2">Pomodoro Timer</h1>
      <p className="text-[#6e6e73] mb-10">Stay focused. 25 minutes work, 5 minutes rest.</p>

      <div className="ad-slot w-full mb-10">Advertisement</div>

      {/* Mode tabs */}
      <div className="inline-flex items-center gap-1.5 bg-[#f5f5f7] rounded-full p-1 mb-10">
        {(Object.keys(DURATIONS) as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${mode === m ? 'bg-white shadow-apple-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#6e6e73]'}`}>
            {LABELS[m]}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="90" fill="none" stroke="#f5f5f7" strokeWidth="10"/>
            <circle cx="110" cy="110" r="90" fill="none" stroke={color} strokeWidth="10"
              strokeLinecap="round" strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transform="rotate(-90 110 110)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-extrabold text-5xl text-[#1d1d1f] tracking-[-0.03em] tabular-nums">
              {mins}:{secs}
            </div>
            <div className="text-xs font-semibold text-[#86868b] mt-1 uppercase tracking-wider">{LABELS[mode]}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button onClick={() => { setTimeLeft(DURATIONS[mode]); setRunning(false) }}
          className="apple-btn-outline rounded-full px-5 py-3 text-sm">
          Reset
        </button>
        <button onClick={() => setRunning(r => !r)}
          className="apple-btn-blue rounded-full px-10 py-3 text-sm font-bold shadow-blue-glow"
          style={{ backgroundColor: color }}>
          {running ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Start'}
        </button>
      </div>

      {/* Session counter */}
      <div className="inline-flex items-center gap-2 bg-[#f5f5f7] rounded-2xl px-5 py-3">
        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          ))}
          {sessions === 0 && <div className="w-3 h-3 rounded-full bg-[#d2d2d7]" />}
        </div>
        <span className="text-sm font-semibold text-[#1d1d1f]">{sessions} session{sessions !== 1 ? 's' : ''} today</span>
      </div>

      <div className="ad-slot w-full mt-10">Advertisement</div>
    </div>
  )
}
