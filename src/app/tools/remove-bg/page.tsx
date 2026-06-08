'use client'
import { useState, useRef, useEffect } from 'react'

declare global {
  interface Window {
    ImglyBackgroundRemoval: {
      removeBackground: (img: HTMLImageElement | string, config?: object) => Promise<Blob>
    }
  }
}

type Phase = 'idle' | 'loading' | 'processing' | 'done' | 'error'

export default function RemoveBgPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [original, setOriginal] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState('')
  const [sdkReady, setSdkReady] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load the SDK via script tag — avoids webpack bundling issues entirely
  useEffect(() => {
    if (window.ImglyBackgroundRemoval) { setSdkReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/browser/es/index.umd.js'
    script.onload = () => setSdkReady(true)
    script.onerror = () => setError('Failed to load background removal SDK.')
    document.head.appendChild(script)
  }, [])

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); setPhase('error'); return }
    if (file.size > 20 * 1024 * 1024) { setError('Image must be under 20MB.'); setPhase('error'); return }

    const reader = new FileReader()
    reader.onload = e => setOriginal(e.target?.result as string)
    reader.readAsDataURL(file)

    setPhase('loading')
    setProgress('Loading AI model (first time may take 10–20 seconds)…')
    setError(''); setResult(null)

    try {
      // Wait for SDK if still loading
      let attempts = 0
      while (!window.ImglyBackgroundRemoval && attempts < 30) {
        await new Promise(r => setTimeout(r, 500))
        attempts++
      }
      if (!window.ImglyBackgroundRemoval) throw new Error('SDK failed to load. Please refresh and try again.')

      setPhase('processing')
      setProgress('Removing background…')

      const blob = await window.ImglyBackgroundRemoval.removeBackground(file as unknown as string)
      setResult(URL.createObjectURL(blob))
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
      setPhase('error')
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]; if (file) processFile(file)
  }

  const reset = () => {
    setPhase('idle'); setOriginal(null); setResult(null); setError(''); setProgress('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-5xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3]">Home</a><span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Background Remover</span>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse"/>
          100% Browser-based · Unlimited · Free Forever
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-2">Background Remover</h1>
        <p className="text-[#6e6e73] max-w-lg leading-relaxed">Remove any image background instantly using AI — runs in your browser. No uploads, no limits, no account needed.</p>
      </div>

      <div className="ad-slot w-full mb-10">Advertisement</div>

      {(phase === 'idle' || phase === 'error') && (
        <>
          <div onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)} onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-3xl border-2 border-dashed p-16 flex flex-col items-center gap-4 text-center transition-all
              ${dragging ? 'border-[#0071e3] bg-[#e8f0fe]/40' : 'border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:border-[#0071e3]/40'}`}>
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#2c2c2e] shadow-apple flex items-center justify-center text-3xl">🖼️</div>
            <div>
              <p className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-lg mb-1">Drop your image here</p>
              <p className="text-sm text-[#6e6e73]">or click to browse · JPG, PNG, WEBP · Max 20MB</p>
            </div>
            <span className="apple-btn-blue rounded-full px-8 py-3 text-sm pointer-events-none">Choose Image</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
          </div>
          {phase === 'error' && <p className="mt-4 text-sm text-[#ff3b30] bg-[#fff0f0] dark:bg-[#ff3b30]/10 rounded-xl px-4 py-3">⚠ {error}</p>}
        </>
      )}

      {(phase === 'loading' || phase === 'processing') && (
        <div className="rounded-3xl bg-[#f5f5f7] dark:bg-[#1c1c1e] p-16 flex flex-col items-center gap-5">
          {original && <img src={original} alt="preview" className="max-h-40 rounded-2xl object-contain opacity-60" />}
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#2c2c2e] shadow-apple flex items-center justify-center">
            <svg className="animate-spin w-7 h-7 text-[#0071e3]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">{progress}</p>
            <p className="text-xs text-[#86868b]">Running AI in your browser — nothing leaves your device</p>
          </div>
        </div>
      )}

      {phase === 'done' && result && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-5">
              <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">Original</p>
              {original && <img src={original} alt="Original" className="w-full rounded-2xl object-contain max-h-72" />}
            </div>
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-[#34c759]/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Background Removed</p>
                <span className="chip bg-[#e6f9ec] text-[#34c759] text-[10px] font-bold">✓ Done</span>
              </div>
              <div className="rounded-2xl overflow-hidden max-h-72 flex items-center justify-center"
                style={{ background: 'repeating-conic-gradient(#e5e5e5 0% 25%, white 0% 50%) 0 0 / 20px 20px' }}>
                <img src={result} alt="No background" className="w-full object-contain max-h-72" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={result} download="background-removed.png" className="apple-btn-blue rounded-full px-8 py-3 text-sm">⬇ Download PNG</a>
            <button onClick={reset} className="apple-btn-outline rounded-full px-8 py-3 text-sm">Remove another</button>
          </div>
        </div>
      )}

      <div className="ad-slot w-full mt-10 mb-8">Advertisement</div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '🔒', title: '100% Private', desc: 'Your image never leaves your device. All processing happens in your browser.' },
          { icon: '♾️', title: 'Unlimited', desc: 'No credits, no limits, no account. Remove as many backgrounds as you want.' },
          { icon: '⚡', title: 'AI-Powered', desc: 'Same AI technology as paid tools, running locally on your device.' },
        ].map(c => (
          <div key={c.title} className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">{c.title}</p>
            <p className="text-xs text-[#6e6e73] leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
