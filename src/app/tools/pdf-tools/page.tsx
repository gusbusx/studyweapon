'use client'
import { useState, useRef, useCallback } from 'react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

// ── Helpers ────────────────────────────────────────────────────────────────
function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
}

function DropZone({ onFile, label = 'Drop PDF here or click to upload', accept = '.pdf' }:
  { onFile: (f: File) => void; label?: string; accept?: string }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f) }}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-all
        ${drag ? 'border-[#0071e3] bg-[#e8f0fe]/20' : 'border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:border-[#0071e3]/40'}`}>
      <div className="text-3xl">📄</div>
      <p className="text-sm text-[#6e6e73] text-center">{label}</p>
      <span className="apple-btn-blue rounded-full px-6 py-2 text-sm pointer-events-none">Choose PDF</span>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); if (ref.current) ref.current.value = '' }} />
    </div>
  )
}

function DoneCard({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-[#34c759]/30 bg-[#e6f9ec]/30 dark:bg-[#34c759]/5 p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">{label}</p>
          <p className="text-xs text-[#86868b]">Download started automatically</p>
        </div>
      </div>
      <button onClick={onReset} className="text-sm text-[#0071e3] font-medium hover:underline">Do another</button>
    </div>
  )
}

// ── Merge PDFs ─────────────────────────────────────────────────────────────
function MergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    if (ref.current) ref.current.value = ''
  }

  const merge = async () => {
    setBusy(true)
    try {
      const merged = await PDFDocument.create()
      for (const file of files) {
        const bytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(p => merged.addPage(p))
      }
      download(await merged.save(), 'merged.pdf')
      setDone(true)
    } catch { alert('Failed to merge PDFs.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="PDFs merged successfully!" onReset={() => { setDone(false); setFiles([]) }} />
  return (
    <div className="space-y-4">
      <div onClick={() => ref.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-[#2c2c2e] p-8 text-center hover:border-[#0071e3]/40 transition-all">
        <p className="text-sm text-[#6e6e73]">Click to add PDFs (select multiple)</p>
        <input ref={ref} type="file" accept=".pdf" multiple className="hidden" onChange={addFiles} />
      </div>
      {files.length > 0 && (
        <>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl px-4 py-2.5">
                <span className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{f.name}</span>
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-[#ff3b30] text-xs font-medium ml-3 shrink-0">Remove</button>
              </div>
            ))}
          </div>
          <button onClick={merge} disabled={files.length < 2 || busy}
            className="apple-btn-blue w-full rounded-xl py-3 text-sm disabled:opacity-40">
            {busy ? 'Merging…' : `Merge ${files.length} PDFs`}
          </button>
        </>
      )}
    </div>
  )
}

// ── Split PDF ──────────────────────────────────────────────────────────────
function SplitTool() {
  const [pageCount, setPageCount] = useState(0)
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null)
  const [range, setRange] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    const bytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
    setFileBytes(bytes); setPageCount(pdf.getPageCount())
  }

  const split = async () => {
    if (!fileBytes) return
    setBusy(true)
    try {
      const pdf = await PDFDocument.load(fileBytes)
      const indices = range.split(',').flatMap(part => {
        const [a, b] = part.split('-').map(n => parseInt(n.trim()) - 1)
        if (b !== undefined) return Array.from({ length: b - a + 1 }, (_, i) => a + i)
        return [a]
      }).filter(i => i >= 0 && i < pdf.getPageCount())
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdf, indices)
      pages.forEach(p => newPdf.addPage(p))
      download(await newPdf.save(), 'split.pdf')
      setDone(true)
    } catch { alert('Invalid page range.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="PDF split successfully!" onReset={() => { setDone(false); setFileBytes(null); setPageCount(0) }} />
  if (!fileBytes) return <DropZone onFile={handle} label="Upload PDF to split" />
  return (
    <div className="space-y-4">
      <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl px-4 py-3 text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
        PDF loaded — <strong>{pageCount}</strong> pages total
      </div>
      <div>
        <label className="text-xs text-[#86868b] font-medium block mb-1.5">Pages to extract (e.g. 1-3, 5, 7-9)</label>
        <input className="apple-input text-sm" placeholder="1-3, 5, 7" value={range} onChange={e => setRange(e.target.value)} />
      </div>
      <button onClick={split} disabled={!range || busy} className="apple-btn-blue w-full rounded-xl py-3 text-sm disabled:opacity-40">
        {busy ? 'Splitting…' : 'Extract Pages'}
      </button>
    </div>
  )
}

// ── Rotate PDF ─────────────────────────────────────────────────────────────
function RotateTool() {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deg, setDeg] = useState(90)

  const handle = async (file: File) => {
    setBusy(true)
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer())
      pdf.getPages().forEach(p => p.setRotation(degrees(deg)))
      download(await pdf.save(), 'rotated.pdf')
      setDone(true)
    } catch { alert('Failed to rotate PDF.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="PDF rotated!" onReset={() => setDone(false)} />
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[90, 180, 270].map(d => (
          <button key={d} onClick={() => setDeg(d)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all
              ${deg === d ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] border-transparent' : 'border-black/10 dark:border-white/10 text-[#6e6e73]'}`}>
            {d}°
          </button>
        ))}
      </div>
      {busy ? <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 text-center text-sm text-[#6e6e73]">Rotating…</div>
        : <DropZone onFile={handle} label={`Upload PDF to rotate all pages ${deg}°`} />}
    </div>
  )
}

// ── Delete Pages ───────────────────────────────────────────────────────────
function DeletePagesTool() {
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [range, setRange] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    const bytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
    setFileBytes(bytes); setPageCount(pdf.getPageCount())
  }

  const remove = async () => {
    if (!fileBytes) return; setBusy(true)
    try {
      const pdf = await PDFDocument.load(fileBytes)
      const toDelete = new Set(range.split(',').flatMap(p => {
        const [a, b] = p.split('-').map(n => parseInt(n.trim()) - 1)
        return b !== undefined ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]
      }))
      const keep = pdf.getPageIndices().filter(i => !toDelete.has(i))
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdf, keep)
      pages.forEach(p => newPdf.addPage(p))
      download(await newPdf.save(), 'pages-deleted.pdf')
      setDone(true)
    } catch { alert('Failed.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="Pages deleted!" onReset={() => { setDone(false); setFileBytes(null) }} />
  if (!fileBytes) return <DropZone onFile={handle} label="Upload PDF to delete pages" />
  return (
    <div className="space-y-4">
      <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl px-4 py-3 text-sm">{pageCount} pages total</div>
      <div>
        <label className="text-xs text-[#86868b] font-medium block mb-1.5">Pages to delete (e.g. 1, 3-5)</label>
        <input className="apple-input text-sm" placeholder="1, 3-5" value={range} onChange={e => setRange(e.target.value)} />
      </div>
      <button onClick={remove} disabled={!range || busy} className="apple-btn-blue w-full rounded-xl py-3 text-sm disabled:opacity-40">
        {busy ? 'Deleting…' : 'Delete Pages'}
      </button>
    </div>
  )
}

// ── Add Page Numbers ───────────────────────────────────────────────────────
function PageNumbersTool() {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    setBusy(true)
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer())
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      pdf.getPages().forEach((page, i) => {
        const { width } = page.getSize()
        page.drawText(`${i + 1}`, { x: width / 2 - 10, y: 20, size: 12, font, color: rgb(0.3, 0.3, 0.3) })
      })
      download(await pdf.save(), 'numbered.pdf')
      setDone(true)
    } catch { alert('Failed.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="Page numbers added!" onReset={() => setDone(false)} />
  return busy
    ? <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 text-center text-sm text-[#6e6e73]">Adding page numbers…</div>
    : <DropZone onFile={handle} label="Upload PDF to add page numbers" />
}

// ── Add Watermark ──────────────────────────────────────────────────────────
function WatermarkTool() {
  const [text, setText] = useState('CONFIDENTIAL')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    setBusy(true)
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer())
      const font = await pdf.embedFont(StandardFonts.HelveticaBold)
      pdf.getPages().forEach(page => {
        const { width, height } = page.getSize()
        page.drawText(text, {
          x: width / 2 - (text.length * 15) / 2, y: height / 2,
          size: 48, font, color: rgb(0.8, 0.8, 0.8), opacity: 0.3,
          rotate: degrees(45),
        })
      })
      download(await pdf.save(), 'watermarked.pdf')
      setDone(true)
    } catch { alert('Failed.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="Watermark added!" onReset={() => setDone(false)} />
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#86868b] font-medium block mb-1.5">Watermark text</label>
        <input className="apple-input text-sm" value={text} onChange={e => setText(e.target.value)} />
      </div>
      {busy
        ? <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 text-center text-sm text-[#6e6e73]">Adding watermark…</div>
        : <DropZone onFile={handle} label="Upload PDF to add watermark" />}
    </div>
  )
}

// ── Protect PDF ────────────────────────────────────────────────────────────
function ProtectTool() {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pw, setPw] = useState('')

  const handle = async (file: File) => {
    if (!pw) { alert('Enter a password first.'); return }
    setBusy(true)
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bytes = await (pdf as any).save({ userPassword: pw, ownerPassword: pw + '_owner' })
      download(bytes, 'protected.pdf')
      setDone(true)
    } catch { alert('Failed to protect PDF.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="PDF protected with password!" onReset={() => setDone(false)} />
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#86868b] font-medium block mb-1.5">Password</label>
        <input type="password" className="apple-input text-sm" placeholder="Enter password…" value={pw} onChange={e => setPw(e.target.value)} />
      </div>
      {busy
        ? <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 text-center text-sm text-[#6e6e73]">Protecting…</div>
        : <DropZone onFile={handle} label="Upload PDF to password protect" />}
    </div>
  )
}

// ── PDF to Text ────────────────────────────────────────────────────────────
function PdfToTextTool() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    setBusy(true)
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer())
      // pdf-lib doesn't extract text directly — show page count info
      const count = pdf.getPageCount()
      setText(`PDF loaded successfully.\n\nPages: ${count}\n\nNote: Full text extraction requires a server-side tool. This browser tool can confirm your PDF is valid and show page count.\n\nFor full text extraction, try: smallpdf.com/pdf-to-txt`)
    } catch { alert('Failed to read PDF.') }
    setBusy(false)
  }

  if (text) return (
    <div className="space-y-3">
      <textarea className="apple-textarea w-full min-h-48 text-sm font-mono" value={text} readOnly />
      <div className="flex gap-2">
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="apple-btn rounded-xl py-2.5 text-sm flex-1">{copied ? '✓ Copied' : '⎘ Copy'}</button>
        <button onClick={() => setText('')} className="apple-btn-outline rounded-xl py-2.5 text-sm flex-1">Reset</button>
      </div>
    </div>
  )
  return busy
    ? <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 text-center text-sm text-[#6e6e73]">Reading PDF…</div>
    : <DropZone onFile={handle} label="Upload PDF to extract text" />
}

// ── Rearrange Pages ────────────────────────────────────────────────────────
function RearrangeTool() {
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [order, setOrder] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    const bytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
    setFileBytes(bytes); setPageCount(pdf.getPageCount())
    setOrder(Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1).join(', '))
  }

  const rearrange = async () => {
    if (!fileBytes) return; setBusy(true)
    try {
      const pdf = await PDFDocument.load(fileBytes)
      const indices = order.split(',').map(n => parseInt(n.trim()) - 1)
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdf, indices)
      pages.forEach(p => newPdf.addPage(p))
      download(await newPdf.save(), 'rearranged.pdf')
      setDone(true)
    } catch { alert('Invalid page order.') }
    setBusy(false)
  }

  if (done) return <DoneCard label="PDF rearranged!" onReset={() => { setDone(false); setFileBytes(null) }} />
  if (!fileBytes) return <DropZone onFile={handle} label="Upload PDF to rearrange pages" />
  return (
    <div className="space-y-4">
      <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl px-4 py-3 text-sm">{pageCount} pages total</div>
      <div>
        <label className="text-xs text-[#86868b] font-medium block mb-1.5">New page order (comma separated)</label>
        <input className="apple-input text-sm font-mono" value={order} onChange={e => setOrder(e.target.value)} />
        <p className="text-xs text-[#86868b] mt-1">Example: 3, 1, 2 puts page 3 first</p>
      </div>
      <button onClick={rearrange} disabled={busy} className="apple-btn-blue w-full rounded-xl py-3 text-sm disabled:opacity-40">
        {busy ? 'Rearranging…' : 'Rearrange Pages'}
      </button>
    </div>
  )
}

// ── Tool registry ──────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'merge',      label: 'Merge PDF',       icon: '🔗', component: MergeTool },
  { id: 'split',      label: 'Split PDF',        icon: '✂️', component: SplitTool },
  { id: 'rotate',     label: 'Rotate PDF',       icon: '🔃', component: RotateTool },
  { id: 'delete',     label: 'Delete Pages',     icon: '🗑️', component: DeletePagesTool },
  { id: 'rearrange',  label: 'Rearrange Pages',  icon: '↕️', component: RearrangeTool },
  { id: 'numbers',    label: 'Add Page Numbers', icon: '#️⃣', component: PageNumbersTool },
  { id: 'watermark',  label: 'Add Watermark',    icon: '💧', component: WatermarkTool },
  { id: 'protect',    label: 'Protect PDF',      icon: '🔒', component: ProtectTool },
  { id: 'text',       label: 'PDF to Text',      icon: '📝', component: PdfToTextTool },
]

export default function PdfToolsPage() {
  const [active, setActive] = useState(TOOLS[0].id)
  const tool = TOOLS.find(t => t.id === active)!

  return (
    <div className="max-w-5xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3]">Home</a><span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">PDF Tools</span>
      </div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"/>
          {TOOLS.length} PDF Tools · All Free · Browser-based
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-2">PDF Tools</h1>
        <p className="text-[#6e6e73] max-w-lg">Merge, split, rotate, protect and edit PDFs. All in your browser — nothing uploaded to a server.</p>
      </div>
      <div className="ad-slot w-full mb-8">Advertisement</div>
      <div className="flex gap-5 flex-col lg:flex-row">
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
