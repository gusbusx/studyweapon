'use client'
import { useState, useCallback } from 'react'

interface Assignment { id: number; name: string; score: string; possible: string }
interface Group { id: number; name: string; weight: string; assignments: Assignment[] }

let uid = 1
const newA = (): Assignment => ({ id: uid++, name: '', score: '', possible: '' })
const newG = (name = '', weight = ''): Group => ({ id: uid++, name, weight, assignments: [newA()] })

const DEFAULT_GROUPS: Group[] = [
  newG('Assignments', '20'),
  newG('Quizzes', '20'),
  newG('Exams', '60'),
]

function getLetter(p: number) {
  if (p >= 93) return 'A'; if (p >= 90) return 'A-'; if (p >= 87) return 'B+'
  if (p >= 83) return 'B'; if (p >= 80) return 'B-'; if (p >= 77) return 'C+'
  if (p >= 73) return 'C'; if (p >= 70) return 'C-'; if (p >= 67) return 'D+'
  if (p >= 63) return 'D'; if (p >= 60) return 'D-'; return 'F'
}

export default function CanvasCalculatorPage() {
  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS)
  const [useWeights, setUseWeights] = useState(true)

  // Calculate points section
  const [newPts, setNewPts] = useState('')
  const [targetPct, setTargetPct] = useState('')
  const [targetCat, setTargetCat] = useState(0)
  const [pointsNeeded, setPointsNeeded] = useState<{ pts: number; pct: number } | null>(null)

  const updG = (id: number, f: keyof Group, v: string) =>
    setGroups(gs => gs.map(g => g.id === id ? { ...g, [f]: v } : g))
  const updA = (gid: number, aid: number, f: keyof Assignment, v: string) =>
    setGroups(gs => gs.map(g => g.id === gid
      ? { ...g, assignments: g.assignments.map(a => a.id === aid ? { ...a, [f]: v } : a) }
      : g))
  const addA = (gid: number) => setGroups(gs => gs.map(g => g.id === gid ? { ...g, assignments: [...g.assignments, newA()] } : g))
  const delA = (gid: number, aid: number) => setGroups(gs => gs.map(g => g.id === gid
    ? { ...g, assignments: g.assignments.filter(a => a.id !== aid) }
    : g))

  // Compute grade per group
  const groupGrades = groups.map(g => {
    const valid = g.assignments.filter(a => a.score !== '' && a.possible !== '' && +a.possible > 0)
    if (!valid.length) return null
    const got = valid.reduce((s, a) => s + +a.score, 0)
    const total = valid.reduce((s, a) => s + +a.possible, 0)
    return { got, total, pct: got / total * 100 }
  })

  const totalGrade = useCallback(() => {
    let wSum = 0, wTotal = 0
    groups.forEach((g, i) => {
      const gr = groupGrades[i]
      if (!gr) return
      const w = useWeights ? (+g.weight || 0) : 1
      wSum += gr.pct * w; wTotal += w
    })
    return wTotal > 0 ? wSum / wTotal : 0
  }, [groups, groupGrades, useWeights])

  const grade = totalGrade()
  const hasAnyGrade = groupGrades.some(g => g !== null)
  const totalWeight = groups.reduce((s, g) => s + (+g.weight || 0), 0)

  const calcPoints = () => {
    const g = groups[targetCat]
    if (!g || !newPts || !targetPct) return
    const possible = +newPts
    const target = +targetPct / 100
    const w = useWeights ? (+g.weight || 0) / 100 : 1 / groups.length

    // Current weighted sum excluding target group
    let currentSum = 0, currentWeight = 0
    groups.forEach((gr, i) => {
      if (i === targetCat) return
      const grd = groupGrades[i]
      const gw = useWeights ? (+gr.weight || 0) / 100 : 1 / groups.length
      if (grd) { currentSum += grd.pct / 100 * gw; currentWeight += gw }
    })

    // Need: (currentSum + pct_in_group * w) / totalWeight >= target
    const totalW = currentWeight + w
    const neededInGroup = (target * totalW - currentSum) / w
    const ptsNeeded = neededInGroup * possible
    setPointsNeeded({ pts: Math.max(0, ptsNeeded), pct: Math.max(0, neededInGroup * 100) })
  }

  const letterColor = (pct: number) => {
    if (pct >= 90) return '#34c759'
    if (pct >= 80) return '#0071e3'
    if (pct >= 70) return '#ff9500'
    return '#ff3b30'
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3]">Home</a><span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Canvas Grade Calculator</span>
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse"/>
          Canvas LMS · Free · Instant
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-2">Canvas Grade Calculator</h1>
        <p className="text-[#6e6e73] max-w-xl">Enter your assignments and scores. Your grade and totals calculate automatically.</p>
      </div>

      <div className="ad-slot w-full mb-8">Advertisement</div>

      {/* Instructions */}
      <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-2xl p-4 mb-6 text-sm text-[#6e6e73] leading-relaxed">
        Your assignments and scores for each assignment group are shown below. Change assignment scores and add assignments as you wish. The grade and totals will be calculated automatically.
        <span className="block mt-1">To create assignments, click <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">"Add Assignment"</strong> below each group. To remove, click the <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">✕</strong> icon.</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT — Assignment groups */}
        <div className="flex-1 space-y-4">
          {groups.map((group, gi) => {
            const gr = groupGrades[gi]
            return (
              <div key={group.id} className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm overflow-hidden">
                {/* Group header */}
                <div className="flex items-center gap-3 px-5 py-3.5 bg-[#f9f9fb] dark:bg-[#2c2c2e] border-b border-black/[0.06] dark:border-white/[0.06]">
                  <input
                    className="flex-1 bg-transparent text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] outline-none placeholder-[#86868b]"
                    placeholder="Group name"
                    value={group.name}
                    onChange={e => updG(group.id, 'name', e.target.value)}
                  />
                  {gr && (
                    <span className="text-xs font-bold shrink-0" style={{ color: letterColor(gr.pct) }}>
                      {gr.got.toFixed(0)}/{gr.total.toFixed(0)} ({gr.pct.toFixed(1)}%)
                    </span>
                  )}
                  {groups.length > 1 && (
                    <button onClick={() => setGroups(gs => gs.filter(g => g.id !== group.id))}
                      className="text-[#86868b] hover:text-[#ff3b30] text-sm transition-colors shrink-0">✕</button>
                  )}
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 px-5 pt-3 pb-1 text-[10px] font-bold text-[#86868b] uppercase tracking-wider">
                  <div className="col-span-6">Assignment</div>
                  <div className="col-span-2 text-center">Score</div>
                  <div className="col-span-1 text-center">/</div>
                  <div className="col-span-2 text-center">Points</div>
                  <div className="col-span-1"/>
                </div>

                <div className="px-5 pb-4 space-y-2">
                  {group.assignments.map(a => (
                    <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
                      <input className="col-span-6 apple-input text-sm py-2" placeholder="Assignment name"
                        value={a.name} onChange={e => updA(group.id, a.id, 'name', e.target.value)} />
                      <input type="number" className="col-span-2 apple-input text-sm py-2 text-center" placeholder="—"
                        value={a.score} onChange={e => updA(group.id, a.id, 'score', e.target.value)} />
                      <span className="col-span-1 text-center text-[#86868b] text-sm">/</span>
                      <input type="number" className="col-span-2 apple-input text-sm py-2 text-center" placeholder="100"
                        value={a.possible} onChange={e => updA(group.id, a.id, 'possible', e.target.value)} />
                      <button onClick={() => group.assignments.length > 1 && delA(group.id, a.id)}
                        disabled={group.assignments.length === 1}
                        className="col-span-1 text-[#86868b] hover:text-[#ff3b30] disabled:opacity-20 transition-colors text-sm text-center">✕</button>
                    </div>
                  ))}
                  <button onClick={() => addA(group.id)}
                    className="text-xs font-semibold text-[#0071e3] hover:underline mt-1 flex items-center gap-1">
                    + Add Assignment
                  </button>
                </div>
              </div>
            )
          })}

          <button onClick={() => setGroups(gs => [...gs, newG()])}
            className="w-full rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 py-3 text-sm font-semibold text-[#6e6e73] hover:border-[#0071e3]/40 hover:text-[#0071e3] transition-all">
            + Add Assignment Group
          </button>
        </div>

        {/* RIGHT — Grade panel */}
        <div className="lg:w-72 shrink-0 space-y-4">

          {/* Total Grade */}
          <div className="bg-[#e8f0fe] dark:bg-[#0071e3]/10 rounded-3xl border border-[#b8d0f5] dark:border-[#0071e3]/30 p-5">
            <p className="font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Total Grade:</p>
            <p className="font-extrabold text-4xl tracking-tight" style={{ color: hasAnyGrade ? letterColor(grade) : '#86868b' }}>
              {hasAnyGrade ? `${grade.toFixed(2)}%` : 'NaN%'}
            </p>
            {hasAnyGrade && (
              <p className="text-sm font-bold mt-1" style={{ color: letterColor(grade) }}>{getLetter(grade)}</p>
            )}
          </div>

          {/* Weighting */}
          <div className="bg-[#e8f0fe] dark:bg-[#0071e3]/10 rounded-3xl border border-[#b8d0f5] dark:border-[#0071e3]/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">Weighting:</p>
              <span className="text-xs text-[#86868b]">(Total: {totalWeight}%)</span>
            </div>

            <div className="space-y-2 mb-3">
              {groups.map(g => (
                <div key={g.id} className="flex items-center gap-2">
                  <span className="text-xs text-[#6e6e73] flex-1 truncate">{g.name || 'Unnamed'}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <input type="number" min="0" max="100"
                      className="w-14 text-center text-xs font-bold bg-white dark:bg-[#1c1c1e] border border-[#b8d0f5] dark:border-[#0071e3]/40 rounded-lg py-1 px-2 outline-none focus:border-[#0071e3]"
                      placeholder="0"
                      value={g.weight}
                      onChange={e => updG(g.id, 'weight', e.target.value)} />
                    <span className="text-xs text-[#86868b]">%</span>
                  </div>
                </div>
              ))}
            </div>

            {useWeights && totalWeight !== 100 && totalWeight > 0 && (
              <p className="text-[10px] text-[#ff3b30] font-medium">⚠ Weights should add up to 100%</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#b8d0f5] dark:border-[#0071e3]/20">
              <span className="text-xs text-[#6e6e73]">Use weighting</span>
              <button onClick={() => setUseWeights(!useWeights)}
                className={`w-10 h-5 rounded-full transition-all duration-300 relative ${useWeights ? 'bg-[#0071e3]' : 'bg-[#d1d1d6]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${useWeights ? 'left-5' : 'left-0.5'}`}/>
              </button>
            </div>

            <button onClick={() => setGroups(gs => [...gs, newG()])}
              className="w-full mt-3 text-xs font-semibold text-[#0071e3] hover:underline text-center">
              Add new category
            </button>
          </div>

          {/* Calculate Points */}
          <div className="bg-[#e8f0fe] dark:bg-[#0071e3]/10 rounded-3xl border border-[#b8d0f5] dark:border-[#0071e3]/30 p-5 overflow-hidden">
            <p className="font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">Calculate points:</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#6e6e73] block mb-1">New Assignment Points:</label>
                <input type="number"
                  className="w-full bg-white dark:bg-[#1c1c1e] border border-[#b8d0f5] dark:border-[#0071e3]/40 rounded-xl px-3 py-2 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  placeholder="100" value={newPts} onChange={e => setNewPts(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-[#6e6e73] block mb-1">Target Grade %:</label>
                <div className="flex items-center gap-1.5">
                  <input type="number"
                    className="flex-1 bg-white dark:bg-[#1c1c1e] border border-[#b8d0f5] dark:border-[#0071e3]/40 rounded-xl px-3 py-2 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                    placeholder="90" value={targetPct} onChange={e => setTargetPct(e.target.value)} />
                  <span className="text-sm text-[#6e6e73] shrink-0">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#6e6e73] block mb-1">Category:</label>
                <select
                  className="w-full bg-white dark:bg-[#1c1c1e] border border-[#b8d0f5] dark:border-[#0071e3]/40 rounded-xl px-3 py-2 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                  value={targetCat} onChange={e => setTargetCat(+e.target.value)}>
                  {groups.map((g, i) => <option key={g.id} value={i}>{g.name || `Group ${i + 1}`}</option>)}
                </select>
              </div>

              {pointsNeeded && (
                <div className="bg-white/60 dark:bg-black/20 rounded-xl px-3 py-2 text-sm">
                  <span className="text-[#6e6e73]">Points needed: </span>
                  <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{pointsNeeded.pts.toFixed(1)} pts ({pointsNeeded.pct.toFixed(1)}%)</span>
                </div>
              )}

              <button onClick={calcPoints}
                className="apple-btn-blue w-full rounded-xl py-2.5 text-sm font-bold">
                Calculate
              </button>
            </div>
          </div>

          <button onClick={() => { setGroups(DEFAULT_GROUPS.map(g => ({ ...g, id: uid++, assignments: [newA()] }))); setPointsNeeded(null) }}
            className="w-full text-xs text-[#86868b] hover:text-[#ff3b30] transition-colors py-2">
            Reset all
          </button>
        </div>
      </div>

      <div className="ad-slot w-full mt-10">Advertisement</div>
    </div>
  )
}
