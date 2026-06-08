'use client'
import { useState } from 'react'

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0.0,
}

function pointsToLetter(p: number) {
  if (p >= 3.85) return 'A'; if (p >= 3.5) return 'A-'
  if (p >= 3.15) return 'B+'; if (p >= 2.85) return 'B'; if (p >= 2.5) return 'B-'
  if (p >= 2.15) return 'C+'; if (p >= 1.85) return 'C'; if (p >= 1.5) return 'C-'
  if (p >= 1.15) return 'D+'; if (p >= 0.85) return 'D'; return 'F'
}

export default function GPAPage() {
  const [currentGPA, setCurrentGPA]     = useState(3.2)
  const [currentCredits, setCurrentCredits] = useState(60)
  const [classes, setClasses] = useState([
    { name: 'Class 1', credits: 3, gradePoints: 3.0 },
    { name: 'Class 2', credits: 3, gradePoints: 3.0 },
  ])

  const totalNewCredits = classes.reduce((s, c) => s + c.credits, 0)
  const totalNewPoints  = classes.reduce((s, c) => s + c.credits * c.gradePoints, 0)
  const newGPA = totalNewCredits > 0
    ? ((currentGPA * currentCredits) + totalNewPoints) / (currentCredits + totalNewCredits)
    : currentGPA
  const delta = newGPA - currentGPA
  const gpaColor = newGPA >= 3.5 ? '#34c759' : newGPA >= 3.0 ? '#0071e3' : newGPA >= 2.0 ? '#ff9500' : '#ff3b30'

  return (
    <div className="max-w-4xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3] transition-colors">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] font-medium">GPA Predictor</span>
      </div>
      <h1 className="font-extrabold text-4xl text-[#1d1d1f] tracking-[-0.02em] mb-3">GPA What-If Predictor</h1>
      <p className="text-[#6e6e73] mb-10">Drag sliders to see exactly how upcoming classes will affect your GPA.</p>

      <div className="ad-slot w-full mb-10">Advertisement</div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="flex flex-col gap-5">
          {/* Current GPA inputs */}
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-6">
            <h2 className="font-bold text-sm text-[#1d1d1f] mb-5">Current Standing</h2>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Current GPA', value: currentGPA, set: setCurrentGPA, min: 0, max: 4, step: 0.1, display: currentGPA.toFixed(2) },
                { label: 'Credits Completed', value: currentCredits, set: setCurrentCredits, min: 0, max: 200, step: 1, display: String(currentCredits) },
              ].map(({ label, value, set, min, max, step, display }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#86868b] font-medium">{label}</span>
                    <span className="font-bold text-[#1d1d1f]">{display}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => set(parseFloat(e.target.value))}
                    className="w-full accent-[#0071e3]" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming classes */}
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-sm text-[#1d1d1f]">Upcoming Classes</h2>
              <button onClick={() => setClasses(c => [...c, { name: `Class ${c.length + 1}`, credits: 3, gradePoints: 3.0 }])}
                className="text-xs text-[#0071e3] font-semibold hover:underline">+ Add class</button>
            </div>
            <div className="flex flex-col gap-5">
              {classes.map((cls, i) => (
                <div key={i} className="rounded-2xl bg-[#f5f5f7] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input value={cls.name} onChange={e => setClasses(c => c.map((x,j) => j===i ? {...x, name: e.target.value} : x))}
                      className="bg-transparent font-semibold text-sm text-[#1d1d1f] outline-none w-full" />
                    {classes.length > 1 && (
                      <button onClick={() => setClasses(c => c.filter((_,j) => j !== i))}
                        className="text-[#86868b] hover:text-[#ff3b30] text-xs ml-2 transition-colors">✕</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-[#86868b]">Credits</span>
                        <span className="font-bold text-[#1d1d1f]">{cls.credits}</span>
                      </div>
                      <input type="range" min={1} max={6} step={1} value={cls.credits}
                        onChange={e => setClasses(c => c.map((x,j) => j===i ? {...x, credits: +e.target.value} : x))}
                        className="w-full accent-[#0071e3]" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-[#86868b]">Expected Grade</span>
                        <span className="font-bold text-[#1d1d1f]">{pointsToLetter(cls.gradePoints)}</span>
                      </div>
                      <input type="range" min={0} max={4} step={0.1} value={cls.gradePoints}
                        onChange={e => setClasses(c => c.map((x,j) => j===i ? {...x, gradePoints: +e.target.value} : x))}
                        className="w-full accent-[#0071e3]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result card */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-sm p-6 text-center sticky top-20">
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">Predicted GPA</p>
            <div className="font-extrabold text-6xl tracking-tight mb-1" style={{ color: gpaColor }}>
              {newGPA.toFixed(2)}
            </div>
            <div className="text-sm font-semibold text-[#1d1d1f] mb-4">{pointsToLetter(newGPA)} average</div>
            <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${delta >= 0 ? 'bg-[#e6f9ec] text-[#34c759]' : 'bg-[#fff0f0] text-[#ff3b30]'}`}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(2)} from current
            </div>
            <div className="mt-5 pt-5 border-t border-black/[0.06] text-left space-y-2">
              {[['Current GPA', currentGPA.toFixed(2)], ['Credits now', String(currentCredits)], ['New credits', String(totalNewCredits)], ['Total credits', String(currentCredits + totalNewCredits)]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-[#86868b]">{l}</span>
                  <span className="font-semibold text-[#1d1d1f]">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ad-slot h-48 rounded-3xl">Advertisement</div>
        </div>
      </div>
    </div>
  )
}
