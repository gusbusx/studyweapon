'use client'
import { useState, useRef, useCallback } from 'react'

// ── Helpers ────────────────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality = 0.92): Promise<Blob> {
  return new Promise((res, rej) => {
    canvas.toBlob(b => b ? res(b) : rej(new Error('Conversion failed')), type, quality)
  })
}

function download(url: string, name: string) {
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
}

function useFileInput(accept: string, onFile: (f: File) => void) {
  const ref = useRef<HTMLInputElement>(null)
  const trigger = () => ref.current?.click()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) onFile(f)
    if (ref.current) ref.current.value = ''
  }
  return { ref, trigger, onChange }
}

// ── Drop Zone ──────────────────────────────────────────────────────────────
function DropZone({ onFile, accept = 'image/*', label = 'Drop image here or click to upload' }:
  { onFile: (f: File) => void; accept?: string; label?: string }) {
  const [drag, setDrag] = useState(false)
  const { ref, trigger, onChange } = useFileInput(accept, onFile)
  return (
    <div onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f) }}
      onClick={trigger}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-all
        ${drag ? 'border-[#0071e3] bg-[#e8f0fe]/30 dark:bg-[#0071e3]/10' : 'border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-[#1c1c1e] hover:border-[#0071e3]/40'}`}>
      <div className="text-3xl">📁</div>
      <p className="text-sm text-[#6e6e73] text-center">{label}</p>
      <span className="apple-btn-blue rounded-full px-6 py-2 text-sm pointer-events-none">Choose File</span>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={onChange} />
    </div>
  )
}

// ── Result Card ────────────────────────────────────────────────────────────
function ResultCard({ url, filename, onReset }: { url: string; filename: string; onReset: () => void }) {
  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#34c759]/30 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="chip bg-[#e6f9ec] text-[#34c759] text-xs font-bold">✓ Done</span>
        <button onClick={onReset} className="text-xs text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white">Convert another</button>
      </div>
      <img src={url} alt="result" className="rounded-xl max-h-48 object-contain w-full"
        style={{ background: 'repeating-conic-gradient(#e5e5e5 0% 25%,white 0% 50%) 0 0/16px 16px' }} />
      <a href={url} download={filename} className="apple-btn-blue rounded-xl py-2.5 text-sm text-center">⬇ Download {filename}</a>
    </div>
  )
}

// ── Individual converters ──────────────────────────────────────────────────
function SimpleConverter({ from, to, mimeOut }: { from: string; to: string; mimeOut: string }) {
  const [result, setResult] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handle = useCallback(async (file: File) => {
    setBusy(true); setResult(null)
    try {
      const url = URL.createObjectURL(file)
      const img = await loadImage(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.width; canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      if (mimeOut === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, img.width, img.height) }
      ctx.drawImage(img, 0, 0)
      const blob = await canvasToBlob(canvas, mimeOut)
      setResult(URL.createObjectURL(blob))
    } catch { alert('Conversion failed. Try another image.') }
    setBusy(false)
  }, [mimeOut])

  if (result) return <ResultCard url={result} filename={`converted.${to.toLowerCase()}`} onReset={() => setResult(null)} />
  return busy
    ? <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#1c1c1e] p-10 flex items-center justify-center gap-3 text-sm text-[#6e6e73]"><Spinner/> Converting…</div>
    : <DropZone onFile={handle} label={`Upload ${from} image to convert to ${to}`} />
}

function CropTool() {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [x, setX] = useState(0); const [y, setY] = useState(0)
  const [w, setW] = useState(400); const [h, setH] = useState(300)

  const handle = (file: File) => {
    const r = new FileReader(); r.onload = e => setImgSrc(e.target?.result as string); r.readAsDataURL(file)
  }

  const crop = async () => {
    if (!imgSrc) return
    const img = await loadImage(imgSrc)
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.getContext('2d')!.drawImage(img, x, y, w, h, 0, 0, w, h)
    setResult(canvas.toDataURL('image/png'))
  }

  if (result) return <ResultCard url={result} filename="cropped.png" onReset={() => { setResult(null); setImgSrc(null) }} />
  if (!imgSrc) return <DropZone onFile={handle} label="Upload image to crop" />
  return (
    <div className="space-y-4">
      <img src={imgSrc} alt="preview" className="rounded-xl max-h-48 w-full object-contain bg-[#f5f5f7] dark:bg-[#2c2c2e]" />
      <div className="grid grid-cols-2 gap-3">
        {[['X offset', x, setX], ['Y offset', y, setY], ['Width', w, setW], ['Height', h, setH]].map(([label, val, set]) => (
          <div key={label as string}>
            <label className="text-xs text-[#86868b] font-medium block mb-1">{label as string}</label>
            <input type="number" className="apple-input text-sm" value={val as number}
              onChange={e => (set as (v: number) => void)(+e.target.value)} />
          </div>
        ))}
      </div>
      <button onClick={crop} className="apple-btn-blue w-full rounded-xl py-3 text-sm">Crop Image</button>
    </div>
  )
}

function ResizeTool() {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [w, setW] = useState(800); const [h, setH] = useState(600)

  const handle = (file: File) => {
    const r = new FileReader(); r.onload = e => setImgSrc(e.target?.result as string); r.readAsDataURL(file)
  }

  const resize = async () => {
    if (!imgSrc) return
    const img = await loadImage(imgSrc)
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
    setResult(canvas.toDataURL('image/png'))
  }

  if (result) return <ResultCard url={result} filename="resized.png" onReset={() => { setResult(null); setImgSrc(null) }} />
  if (!imgSrc) return <DropZone onFile={handle} label="Upload image to resize" />
  return (
    <div className="space-y-4">
      <img src={imgSrc} alt="preview" className="rounded-xl max-h-48 w-full object-contain bg-[#f5f5f7] dark:bg-[#2c2c2e]" />
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-[#86868b] font-medium block mb-1">Width (px)</label>
          <input type="number" className="apple-input text-sm" value={w} onChange={e => setW(+e.target.value)} /></div>
        <div><label className="text-xs text-[#86868b] font-medium block mb-1">Height (px)</label>
          <input type="number" className="apple-input text-sm" value={h} onChange={e => setH(+e.target.value)} /></div>
      </div>
      <button onClick={resize} className="apple-btn-blue w-full rounded-xl py-3 text-sm">Resize Image</button>
    </div>
  )
}

function FlipTool() {
  const [result, setResult] = useState<string | null>(null)
  const [direction, setDirection] = useState<'h' | 'v'>('h')

  const handle = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.width; canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    if (direction === 'h') { ctx.translate(img.width, 0); ctx.scale(-1, 1) }
    else { ctx.translate(0, img.height); ctx.scale(1, -1) }
    ctx.drawImage(img, 0, 0)
    setResult(canvas.toDataURL('image/png'))
  }, [direction])

  if (result) return <ResultCard url={result} filename="flipped.png" onReset={() => setResult(null)} />
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['h', 'v'] as const).map(d => (
          <button key={d} onClick={() => setDirection(d)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all
              ${direction === d ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] border-transparent' : 'border-black/10 dark:border-white/10 text-[#6e6e73]'}`}>
            {d === 'h' ? '↔ Horizontal' : '↕ Vertical'}
          </button>
        ))}
      </div>
      <DropZone onFile={handle} label="Upload image to flip" />
    </div>
  )
}

function BlackWhiteTool() {
  const [result, setResult] = useState<string | null>(null)
  const handle = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.width; canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, img.width, img.height)
    for (let i = 0; i < d.data.length; i += 4) {
      const g = d.data[i] * 0.299 + d.data[i+1] * 0.587 + d.data[i+2] * 0.114
      d.data[i] = d.data[i+1] = d.data[i+2] = g
    }
    ctx.putImageData(d, 0, 0)
    setResult(canvas.toDataURL('image/png'))
  }, [])
  if (result) return <ResultCard url={result} filename="bw.png" onReset={() => setResult(null)} />
  return <DropZone onFile={handle} label="Upload image to convert to black & white" />
}

function CompressTool() {
  const [result, setResult] = useState<string | null>(null)
  const [quality, setQuality] = useState(60)
  const handle = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.width; canvas.height = img.height
    canvas.getContext('2d')!.drawImage(img, 0, 0)
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality / 100)
    setResult(URL.createObjectURL(blob))
  }, [quality])
  if (result) return <ResultCard url={result} filename="compressed.jpg" onReset={() => setResult(null)} />
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#86868b] font-medium block mb-1.5">Quality: {quality}%</label>
        <input type="range" min={10} max={95} value={quality} onChange={e => setQuality(+e.target.value)} className="w-full accent-[#0071e3]" />
      </div>
      <DropZone onFile={handle} label="Upload image to compress" />
    </div>
  )
}

function RoundImageTool() {
  const [result, setResult] = useState<string | null>(null)
  const handle = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    const size = Math.min(img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.clip()
    ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, size, size)
    setResult(canvas.toDataURL('image/png'))
  }, [])
  if (result) return <ResultCard url={result} filename="round.png" onReset={() => setResult(null)} />
  return <DropZone onFile={handle} label="Upload image to make it round" />
}

function AddTextTool() {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [text, setText] = useState('Your text here')
  const [size, setSize] = useState(48)
  const [color, setColor] = useState('#ffffff')
  const [posY, setPosY] = useState(90)

  const handle = (file: File) => {
    const r = new FileReader(); r.onload = e => setImgSrc(e.target?.result as string); r.readAsDataURL(file)
  }

  const apply = async () => {
    if (!imgSrc) return
    const img = await loadImage(imgSrc)
    const canvas = document.createElement('canvas')
    canvas.width = img.width; canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    ctx.font = `bold ${size}px sans-serif`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.fillText(text, img.width/2, (img.height * posY) / 100)
    setResult(canvas.toDataURL('image/png'))
  }

  if (result) return <ResultCard url={result} filename="text-added.png" onReset={() => { setResult(null); setImgSrc(null) }} />
  if (!imgSrc) return <DropZone onFile={handle} label="Upload image to add text" />
  return (
    <div className="space-y-4">
      <img src={imgSrc} alt="preview" className="rounded-xl max-h-40 w-full object-contain bg-[#f5f5f7] dark:bg-[#2c2c2e]" />
      <input className="apple-input text-sm" placeholder="Enter text…" value={text} onChange={e => setText(e.target.value)} />
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs text-[#86868b] font-medium block mb-1">Font size</label>
          <input type="number" className="apple-input text-sm" value={size} onChange={e => setSize(+e.target.value)} /></div>
        <div><label className="text-xs text-[#86868b] font-medium block mb-1">Color</label>
          <input type="color" className="w-full h-10 rounded-xl border border-black/10 cursor-pointer" value={color} onChange={e => setColor(e.target.value)} /></div>
        <div><label className="text-xs text-[#86868b] font-medium block mb-1">Y position %</label>
          <input type="number" className="apple-input text-sm" value={posY} onChange={e => setPosY(+e.target.value)} /></div>
      </div>
      <button onClick={apply} className="apple-btn-blue w-full rounded-xl py-3 text-sm">Add Text</button>
    </div>
  )
}

function PixelateTool() {
  const [result, setResult] = useState<string | null>(null)
  const [block, setBlock] = useState(10)
  const handle = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.width; canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, 0, 0, img.width/block, img.height/block)
    ctx.drawImage(canvas, 0, 0, img.width/block, img.height/block, 0, 0, img.width, img.height)
    setResult(canvas.toDataURL('image/png'))
  }, [block])
  if (result) return <ResultCard url={result} filename="pixelated.png" onReset={() => setResult(null)} />
  return (
    <div className="space-y-4">
      <div><label className="text-xs text-[#86868b] font-medium block mb-1.5">Pixel block size: {block}px</label>
        <input type="range" min={2} max={40} value={block} onChange={e => setBlock(+e.target.value)} className="w-full accent-[#0071e3]" /></div>
      <DropZone onFile={handle} label="Upload image to pixelate" />
    </div>
  )
}

function AddBorderTool() {
  const [result, setResult] = useState<string | null>(null)
  const [size, setSize] = useState(20)
  const [color, setColor] = useState('#000000')
  const handle = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.width + size*2; canvas.height = img.height + size*2
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, size, size)
    setResult(canvas.toDataURL('image/png'))
  }, [size, color])
  if (result) return <ResultCard url={result} filename="bordered.png" onReset={() => setResult(null)} />
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-[#86868b] font-medium block mb-1">Border size (px)</label>
          <input type="number" className="apple-input text-sm" value={size} onChange={e => setSize(+e.target.value)} /></div>
        <div><label className="text-xs text-[#86868b] font-medium block mb-1">Border color</label>
          <input type="color" className="w-full h-10 rounded-xl border border-black/10 cursor-pointer" value={color} onChange={e => setColor(e.target.value)} /></div>
      </div>
      <DropZone onFile={handle} label="Upload image to add border" />
    </div>
  )
}

// ── Tool registry ──────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'png-jpg',   label: 'PNG → JPG',   icon: '🔄', component: () => <SimpleConverter from="PNG" to="JPG" mimeOut="image/jpeg" /> },
  { id: 'jpg-png',   label: 'JPG → PNG',   icon: '🔄', component: () => <SimpleConverter from="JPG" to="PNG" mimeOut="image/png" /> },
  { id: 'png-webp',  label: 'PNG → WEBP',  icon: '🔄', component: () => <SimpleConverter from="PNG" to="WEBP" mimeOut="image/webp" /> },
  { id: 'webp-png',  label: 'WEBP → PNG',  icon: '🔄', component: () => <SimpleConverter from="WEBP" to="PNG" mimeOut="image/png" /> },
  { id: 'jpg-webp',  label: 'JPG → WEBP',  icon: '🔄', component: () => <SimpleConverter from="JPG" to="WEBP" mimeOut="image/webp" /> },
  { id: 'webp-jpg',  label: 'WEBP → JPG',  icon: '🔄', component: () => <SimpleConverter from="WEBP" to="JPG" mimeOut="image/jpeg" /> },
  { id: 'jpg-gif',   label: 'JPG → GIF',   icon: '🔄', component: () => <SimpleConverter from="JPG" to="GIF" mimeOut="image/gif" /> },
  { id: 'png-gif',   label: 'PNG → GIF',   icon: '🔄', component: () => <SimpleConverter from="PNG" to="GIF" mimeOut="image/gif" /> },
  { id: 'crop',      label: 'Crop Image',  icon: '✂️', component: () => <CropTool /> },
  { id: 'resize',    label: 'Resize',      icon: '↔️', component: () => <ResizeTool /> },
  { id: 'flip',      label: 'Flip Image',  icon: '🔃', component: () => <FlipTool /> },
  { id: 'bw',        label: 'Black & White', icon: '⬛', component: () => <BlackWhiteTool /> },
  { id: 'compress',  label: 'Compress',    icon: '🗜️', component: () => <CompressTool /> },
  { id: 'round',     label: 'Round Image', icon: '⭕', component: () => <RoundImageTool /> },
  { id: 'addtext',   label: 'Add Text',    icon: '✍️', component: () => <AddTextTool /> },
  { id: 'pixelate',  label: 'Pixelate',    icon: '🟫', component: () => <PixelateTool /> },
  { id: 'border',    label: 'Add Border',  icon: '🖼️', component: () => <AddBorderTool /> },
  { id: 'remove-bg', label: 'Remove BG',   icon: '🔳', component: () => (
    <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#1c1c1e] p-6 text-center space-y-3">
      <div className="text-3xl">✂️</div>
      <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Background Remover</p>
      <p className="text-sm text-[#6e6e73]">This tool is available as its own dedicated page.</p>
      <a href="/tools/remove-bg" className="apple-btn-blue rounded-full px-6 py-2.5 text-sm inline-block">Open Background Remover →</a>
    </div>
  )},
]

export default function ImageConverterPage() {
  const [active, setActive] = useState(TOOLS[0].id)
  const tool = TOOLS.find(t => t.id === active)!

  return (
    <div className="max-w-5xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3]">Home</a><span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Image Converter</span>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"/>
          {TOOLS.length} Tools · All Browser-based · Free
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-2">Image Converter</h1>
        <p className="text-[#6e6e73] max-w-lg">Convert, crop, resize, flip and edit images. Nothing uploaded to a server.</p>
      </div>

      <div className="ad-slot w-full mb-8">Advertisement</div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-52 shrink-0">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors border-b border-black/[0.04] dark:border-white/[0.04] last:border-0
                  ${active === t.id ? 'bg-[#0071e3] text-white' : 'text-[#6e6e73] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm p-6">
            <h2 className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] mb-5">{tool.icon} {tool.label}</h2>
            <tool.component />
          </div>
        </div>
      </div>

      <div className="ad-slot w-full mt-10">Advertisement</div>
    </div>
  )
}

function Spinner() {
  return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
}
