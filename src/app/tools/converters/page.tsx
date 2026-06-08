'use client'
import { useState, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
type Tab = 'image' | 'text' | 'units' | 'number' | 'color'

// ── Image Converter ────────────────────────────────────────────────────────
function ImageConverter() {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png')
  const [quality, setQuality] = useState(92)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const FORMATS = [
    { value: 'image/png', label: 'PNG', ext: 'png' },
    { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
    { value: 'image/webp', label: 'WEBP', ext: 'webp' },
  ]

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResultUrl(null)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const convert = () => {
    if (!preview) return
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, img.width, img.height) }
      ctx.drawImage(img, 0, 0)
      setResultUrl(canvas.toDataURL(format, quality / 100))
    }
    img.src = preview
  }

  const ext = FORMATS.find(f => f.value === format)?.ext ?? 'png'

  return (
    <div className="space-y-5">
      <div
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-[#1c1c1e] p-10 flex flex-col items-center gap-3 hover:border-[#0071e3]/40 transition-all"
      >
        {preview
          ? <img src={preview} alt="preview" className="max-h-40 rounded-xl object-contain" />
          : <><div className="text-3xl">🖼️</div><p className="text-sm text-[#6e6e73]">Click to upload image</p></>
        }
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>

      {preview && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map(f => (
              <button key={f.value} onClick={() => { setFormat(f.value as typeof format); setResultUrl(null) }}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all border
                  ${format === f.value ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] border-transparent' : 'border-black/10 dark:border-white/10 text-[#6e6e73]'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {format !== 'image/png' && (
            <div>
              <label className="text-xs text-[#86868b] font-medium mb-1.5 block">Quality: {quality}%</label>
              <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(+e.target.value)}
                className="w-full accent-[#0071e3]" />
            </div>
          )}

          <button onClick={convert} className="apple-btn-blue w-full rounded-2xl py-3">
            Convert to {ext.toUpperCase()}
          </button>

          {resultUrl && (
            <a href={resultUrl} download={`converted.${ext}`}
              className="apple-btn w-full rounded-2xl py-3 text-center text-sm">
              ⬇ Download {ext.toUpperCase()}
            </a>
          )}
        </>
      )}
    </div>
  )
}

// ── Text Converter ─────────────────────────────────────────────────────────
function TextConverter() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('upper')
  const [copied, setCopied] = useState(false)

  const MODES = [
    { id: 'upper', label: 'UPPERCASE', fn: (t: string) => t.toUpperCase() },
    { id: 'lower', label: 'lowercase', fn: (t: string) => t.toLowerCase() },
    { id: 'title', label: 'Title Case', fn: (t: string) => t.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
    { id: 'sentence', label: 'Sentence case', fn: (t: string) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() },
    { id: 'camel', label: 'camelCase', fn: (t: string) => t.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
    { id: 'snake', label: 'snake_case', fn: (t: string) => t.toLowerCase().replace(/\s+/g, '_') },
    { id: 'kebab', label: 'kebab-case', fn: (t: string) => t.toLowerCase().replace(/\s+/g, '-') },
    { id: 'reverse', label: 'esreveR', fn: (t: string) => t.split('').reverse().join('') },
    { id: 'b64enc', label: 'Base64 Enc', fn: (t: string) => btoa(unescape(encodeURIComponent(t))) },
    { id: 'b64dec', label: 'Base64 Dec', fn: (t: string) => { try { return decodeURIComponent(escape(atob(t))) } catch { return '⚠ Invalid Base64' } } },
    { id: 'urlenc', label: 'URL Encode', fn: (t: string) => encodeURIComponent(t) },
    { id: 'urldec', label: 'URL Decode', fn: (t: string) => { try { return decodeURIComponent(t) } catch { return '⚠ Invalid URL encoding' } } },
  ]

  const result = input ? (MODES.find(m => m.id === mode)?.fn(input) ?? input) : ''

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
              ${mode === m.id ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f]' : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#6e6e73] hover:bg-[#ebebed] dark:hover:bg-[#3a3a3c]'}`}>
            {m.label}
          </button>
        ))}
      </div>
      <textarea className="apple-textarea w-full min-h-32 text-sm" placeholder="Type or paste text here…" value={input} onChange={e => setInput(e.target.value)} />
      {result && (
        <>
          <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-4 text-sm font-mono text-[#1d1d1f] dark:text-[#f5f5f7] break-all min-h-16 whitespace-pre-wrap">{result}</div>
          <button onClick={copy} className="apple-btn rounded-2xl py-2.5 text-sm w-full">
            {copied ? '✓ Copied!' : '⎘ Copy Result'}
          </button>
        </>
      )}
    </div>
  )
}

// ── Unit Converter ─────────────────────────────────────────────────────────
const UNIT_CATEGORIES = {
  Length: {
    units: ['Millimeters', 'Centimeters', 'Meters', 'Kilometers', 'Inches', 'Feet', 'Yards', 'Miles'],
    toBase: [0.001, 0.01, 1, 1000, 0.0254, 0.3048, 0.9144, 1609.344],
  },
  Weight: {
    units: ['Milligrams', 'Grams', 'Kilograms', 'Metric Tons', 'Ounces', 'Pounds', 'Stone'],
    toBase: [0.000001, 0.001, 1, 1000, 0.028349, 0.453592, 6.35029],
  },
  Temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    toBase: [1, 1, 1],
    convert: (val: number, from: string, to: string) => {
      let c = from === 'Celsius' ? val : from === 'Fahrenheit' ? (val - 32) * 5 / 9 : val - 273.15
      if (to === 'Celsius') return c
      if (to === 'Fahrenheit') return c * 9 / 5 + 32
      return c + 273.15
    }
  },
  Area: {
    units: ['sq mm', 'sq cm', 'sq m', 'Hectares', 'sq km', 'sq inches', 'sq feet', 'sq yards', 'Acres', 'sq miles'],
    toBase: [0.000001, 0.0001, 1, 10000, 1000000, 0.00064516, 0.092903, 0.836127, 4046.86, 2589988],
  },
  Volume: {
    units: ['Milliliters', 'Liters', 'Cubic meters', 'Teaspoons', 'Tablespoons', 'Cups', 'Pints', 'Quarts', 'Gallons'],
    toBase: [0.001, 1, 1000, 0.00492892, 0.0147868, 0.236588, 0.473176, 0.946353, 3.78541],
  },
  Speed: {
    units: ['m/s', 'km/h', 'mph', 'Knots', 'ft/s'],
    toBase: [1, 0.277778, 0.44704, 0.514444, 0.3048],
  },
}

function UnitConverter() {
  const [cat, setCat] = useState('Length')
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(1)
  const [val, setVal] = useState('')

  const category = UNIT_CATEGORIES[cat as keyof typeof UNIT_CATEGORIES]

  const convert = () => {
    const n = parseFloat(val)
    if (isNaN(n)) return '—'
    if ('convert' in category && category.convert) {
      return category.convert(n, category.units[from], category.units[to]).toFixed(6).replace(/\.?0+$/, '')
    }
    const base = n * category.toBase[from]
    return (base / category.toBase[to]).toFixed(8).replace(/\.?0+$/, '')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(UNIT_CATEGORIES).map(c => (
          <button key={c} onClick={() => { setCat(c); setFrom(0); setTo(1); setVal('') }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
              ${cat === c ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f]' : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#6e6e73]'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#86868b] font-medium block mb-1.5">From</label>
          <select value={from} onChange={e => setFrom(+e.target.value)}
            className="apple-input text-sm">
            {category.units.map((u, i) => <option key={u} value={i}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[#86868b] font-medium block mb-1.5">To</label>
          <select value={to} onChange={e => setTo(+e.target.value)}
            className="apple-input text-sm">
            {category.units.map((u, i) => <option key={u} value={i}>{u}</option>)}
          </select>
        </div>
      </div>
      <input type="number" className="apple-input text-sm" placeholder="Enter value…" value={val} onChange={e => setVal(e.target.value)} />
      {val && (
        <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-5 text-center">
          <p className="text-xs text-[#86868b] mb-1">{val} {category.units[from]} =</p>
          <p className="font-extrabold text-3xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">{convert()}</p>
          <p className="text-sm text-[#86868b] mt-1">{category.units[to]}</p>
        </div>
      )}
    </div>
  )
}

// ── Number Base Converter ──────────────────────────────────────────────────
function NumberConverter() {
  const [val, setVal] = useState('')
  const [base, setBase] = useState(10)
  const BASES = [{ b: 2, label: 'Binary' }, { b: 8, label: 'Octal' }, { b: 10, label: 'Decimal' }, { b: 16, label: 'Hex' }]

  const dec = parseInt(val, base)
  const valid = val !== '' && !isNaN(dec)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {BASES.map(b => (
          <button key={b.b} onClick={() => { setBase(b.b); setVal('') }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${base === b.b ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f]' : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#6e6e73]'}`}>
            {b.label} (base {b.b})
          </button>
        ))}
      </div>
      <input className="apple-input font-mono text-sm" placeholder={`Enter ${BASES.find(b => b.b === base)?.label} number…`} value={val} onChange={e => setVal(e.target.value)} />
      {valid && (
        <div className="grid grid-cols-2 gap-3">
          {BASES.map(b => (
            <div key={b.b} className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-4">
              <p className="text-xs text-[#86868b] font-medium mb-1">{b.label}</p>
              <p className="font-bold text-lg font-mono text-[#1d1d1f] dark:text-[#f5f5f7] break-all">{dec.toString(b.b).toUpperCase()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Color Converter ────────────────────────────────────────────────────────
function ColorConverter() {
  const [hex, setHex] = useState('#0071e3')
  const [copied, setCopied] = useState('')

  const hexToRgb = (h: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h)
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const rgb = hexToRgb(hex)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(() => setCopied(''), 2000)
  }

  const OUTPUTS = rgb && hsl ? [
    { label: 'HEX', value: hex.toUpperCase(), key: 'hex' },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, key: 'rgb' },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, key: 'hsl' },
    { label: 'CSS Variable', value: `--color: ${hex};`, key: 'css' },
  ] : []

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <input type="color" value={hex} onChange={e => setHex(e.target.value)}
          className="w-16 h-16 rounded-2xl border-2 border-black/10 cursor-pointer" />
        <div className="flex-1">
          <label className="text-xs text-[#86868b] font-medium block mb-1.5">HEX Code</label>
          <input className="apple-input font-mono text-sm" value={hex}
            onChange={e => { if (/^#[0-9a-f]{0,6}$/i.test(e.target.value)) setHex(e.target.value) }} />
        </div>
      </div>

      {OUTPUTS.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OUTPUTS.map(o => (
            <div key={o.key} className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-[#86868b] font-medium mb-0.5">{o.label}</p>
                <p className="font-mono text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">{o.value}</p>
              </div>
              <button onClick={() => copy(o.value, o.key)}
                className="shrink-0 text-xs font-semibold text-[#0071e3] hover:underline">
                {copied === o.key ? '✓' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}

      {rgb && (
        <div className="rounded-2xl overflow-hidden h-20" style={{ backgroundColor: hex }} />
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'image',  label: 'Image',       icon: '🖼️',  desc: 'Convert image formats' },
  { id: 'text',   label: 'Text',        icon: '🔤',  desc: 'Case & encoding tools' },
  { id: 'units',  label: 'Units',       icon: '📏',  desc: 'Length, weight, temp…' },
  { id: 'number', label: 'Number Base', icon: '🔢',  desc: 'Binary, hex, octal' },
  { id: 'color',  label: 'Color',       icon: '🎨',  desc: 'HEX, RGB, HSL' },
]

export default function ConvertersPage() {
  const [tab, setTab] = useState<Tab>('image')

  return (
    <div className="max-w-4xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3] transition-colors">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Converters</span>
      </div>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
          5 Converters · All Free · Browser-based
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-3">
          File & Unit Converters
        </h1>
        <p className="text-[#6e6e73] max-w-lg leading-relaxed">
          Convert images, text cases, units, number bases, and colors — all instant, all in your browser. Nothing uploaded to a server.
        </p>
      </div>

      <div className="ad-slot w-full mb-8">Advertisement</div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all border
              ${tab === t.id
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] border-transparent shadow-apple-sm'
                : 'bg-white dark:bg-[#1c1c1e] text-[#6e6e73] border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/30'
              }`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-apple-sm p-6 mb-8">
        <div className="mb-5">
          <h2 className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7]">
            {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label} Converter
          </h2>
          <p className="text-xs text-[#86868b]">{TABS.find(t => t.id === tab)?.desc}</p>
        </div>
        {tab === 'image'  && <ImageConverter />}
        {tab === 'text'   && <TextConverter />}
        {tab === 'units'  && <UnitConverter />}
        {tab === 'number' && <NumberConverter />}
        {tab === 'color'  && <ColorConverter />}
      </div>

      <div className="ad-slot w-full mb-8">Advertisement</div>

      <section className="pt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
        <h2 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">About These Tools</h2>
        <p className="text-sm text-[#6e6e73] leading-relaxed max-w-3xl">
          All converters run entirely in your browser — no files are uploaded to any server. Image conversion uses the Canvas API, unit conversions use precise multipliers, and color tools support HEX, RGB, and HSL. Free, instant, no account needed.
        </p>
      </section>
    </div>
  )
}
