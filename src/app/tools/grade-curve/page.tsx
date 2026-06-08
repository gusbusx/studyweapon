'use client'
import { useState } from 'react'

function getLetterGrade(score: number): { letter: string; color: string } {
  if (score >= 93) return { letter: 'A',  color: '#34c759' }
  if (score >= 90) return { letter: 'A-', color: '#34c759' }
  if (score >= 87) return { letter: 'B+', color: '#0071e3' }
  if (score >= 83) return { letter: 'B',  color: '#0071e3' }
  if (score >= 80) return { letter: 'B-', color: '#0071e3' }
  if (score >= 77) return { letter: 'C+', color: '#ff9500' }
  if (score >= 73) return { letter: 'C',  color: '#ff9500' }
  if (score >= 70) return { letter: 'C-', color: '#ff9500' }
  if (score >= 60) return { letter: 'D',  color: '#ff3b30' }
  return { letter: 'F', color: '#ff3b30' }
}

export default function GradeCurvePage() {
  const [rawScore, setRawScore]   = useState(72)
  const [classAvg, setClassAvg]   = useState(65)
  const [stdDev, setStdDev]       = useState(10)
  const [targetAvg, setTargetAvg] = useState(75)

  // Z-score curve: normalize then re-center around targetAvg
  const zScore     = stdDev > 0 ? (rawScore - classAvg) / stdDev : 0
  const curvedScore = Math.min(100, Math.max(0, Math.round(targetAvg + zScore * stdDev)))
  const improvement = curvedScore - rawScore
  const { letter, color } = getLetterGrade(curvedScore)
  const rawGrade = getLetterGrade(rawScore)

  return (
    <div className="max-w-4xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3] transition-colors">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] font-medium">Grade Curve Calculator</span>
      </div>
      <h1 className="font-extrabold text-4xl text-[#1d1d1f] tracking-[-0.02em] mb-3">Grade Curve Calculator</h1>
      <p className="text-[#6e6e73] mb-10">Enter your raw score and class statistics to see your curved grade.</p>

      <div className="ad-slot w-full mb-10">Advertisement</div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-6">
          <h2 className="font-bold text-sm text-[#1d1d1f] mb-6">Input Values</h2>
          <div className="flex flex-col gap-6">
            {[
              { label: 'Your Raw Score', value: rawScore, set: setRawScore, min: 0, max: 100, step: 1 },
              { label: 'Class Average',  value: classAvg, set: setClassAvg, min: 0, max: 100, step: 1 },
              { label: 'Standard Deviation', value: stdDev, set: setStdDev, min: 1, max: 30, step: 0.5 },
              { label: 'Target Average (Curve to)', value: targetAvg, set: setTargetAvg, min: 50, max: 95, step: 1 },
            ].map(({ label, value, set, min, max, step }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6e6e73] font-medium">{label}</span>
                  <span className="font-bold text-[#1d1d1f]">{value}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={value}
                  onChange={e => set(parseFloat(e.target.value))}
                  className="w-full accent-[#0071e3]" />
                <div className="flex justify-between text-[10px] text-[#86868b] mt-1">
                  <span>{min}</span><span>{max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-6 text-center">
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">Curved Grade</p>
            <div className="font-extrabold text-6xl tracking-tight mb-1" style={{ color }}>
              {letter}
            </div>
            <div className="text-2xl font-bold text-[#1d1d1f] mb-3">{curvedScore}%</div>
            {improvement !== 0 && (
              <span className={`chip text-sm font-semibold ${improvement > 0 ? 'bg-[#e6f9ec] text-[#34c759]' : 'bg-[#fff0f0] text-[#ff3b30]'}`}>
                {improvement > 0 ? '+' : ''}{improvement} points
              </span>
            )}
            <div className="mt-5 pt-5 border-t border-black/[0.06] text-left space-y-2.5">
              {[
                ['Raw score',     `${rawScore}% (${rawGrade.letter})`],
                ['Class average', `${classAvg}%`],
                ['Std deviation', stdDev.toString()],
                ['Z-score',       zScore.toFixed(2)],
                ['Curved to',     `${curvedScore}%`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-[#86868b]">{l}</span>
                  <span className="font-semibold text-[#1d1d1f]">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ad-slot h-44 rounded-3xl">Advertisement</div>
        </div>
      </div>
    </div>
  )
}
