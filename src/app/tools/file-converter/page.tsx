'use client'
import { useState } from 'react'

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
}

function DoneCard({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-[#34c759]/30 bg-[#e6f9ec]/30 dark:bg-[#34c759]/5 p-5 flex items-center justify-between">
      <div className="flex items-center gap-3"><span className="text-2xl">✅</span>
        <div><p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">{label}</p>
          <p className="text-xs text-[#86868b]">Download started</p></div>
      </div>
      <button onClick={onReset} className="text-sm text-[#0071e3] font-medium hover:underline">Do another</button>
    </div>
  )
}

function useTextFile(onLoad: (text: string, name: string) => void) {
  const read = (file: File) => {
    const r = new FileReader(); r.onload = e => onLoad(e.target?.result as string, file.name); r.readAsText(file)
  }
  return read
}

function FileDropZone({ onFile, accept, label }: { onFile: (f: File) => void; accept: string; label: string }) {
  const ref = useState<HTMLInputElement | null>(null)
  return (
    <div onClick={() => document.getElementById('fdi')?.click()}
      className="cursor-pointer rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 flex flex-col items-center gap-3 hover:border-[#0071e3]/40 transition-all text-center">
      <div className="text-3xl">📂</div>
      <p className="text-sm text-[#6e6e73]">{label}</p>
      <span className="apple-btn-blue rounded-full px-6 py-2 text-sm pointer-events-none">Choose File</span>
      <input id="fdi" type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }} />
    </div>
  )
}

// ── CSV ↔ JSON ─────────────────────────────────────────────────────────────
function CsvToJson() {
  const [done, setDone] = useState(false)
  const read = useTextFile((text, name) => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
    })
    download(JSON.stringify(rows, null, 2), name.replace('.csv', '.json'), 'application/json')
    setDone(true)
  })
  if (done) return <DoneCard label="CSV converted to JSON!" onReset={() => setDone(false)} />
  return <FileDropZone onFile={read} accept=".csv" label="Upload CSV to convert to JSON" />
}

function JsonToCsv() {
  const [done, setDone] = useState(false)
  const read = useTextFile((text, name) => {
    try {
      const data = JSON.parse(text)
      const rows = Array.isArray(data) ? data : [data]
      const headers = Object.keys(rows[0])
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n')
      download(csv, name.replace('.json', '.csv'), 'text/csv')
      setDone(true)
    } catch { alert('Invalid JSON file.') }
  })
  if (done) return <DoneCard label="JSON converted to CSV!" onReset={() => setDone(false)} />
  return <FileDropZone onFile={read} accept=".json" label="Upload JSON to convert to CSV" />
}

// ── CSV ↔ XML ──────────────────────────────────────────────────────────────
function CsvToXml() {
  const [done, setDone] = useState(false)
  const read = useTextFile((text, name) => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return `  <row>\n${headers.map((h, i) => `    <${h}>${vals[i] ?? ''}</${h}>`).join('\n')}\n  </row>`
    })
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${rows.join('\n')}\n</data>`
    download(xml, name.replace('.csv', '.xml'), 'application/xml')
    setDone(true)
  })
  if (done) return <DoneCard label="CSV converted to XML!" onReset={() => setDone(false)} />
  return <FileDropZone onFile={read} accept=".csv" label="Upload CSV to convert to XML" />
}

function XmlToCsv() {
  const [done, setDone] = useState(false)
  const read = useTextFile((text, name) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'application/xml')
      const rows = Array.from(doc.querySelectorAll('row'))
      if (!rows.length) { alert('No <row> elements found in XML.'); return }
      const headers = Array.from(rows[0].children).map(c => c.tagName)
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r.querySelector(h)?.textContent ?? ''}"`).join(','))].join('\n')
      download(csv, name.replace('.xml', '.csv'), 'text/csv')
      setDone(true)
    } catch { alert('Invalid XML file.') }
  })
  if (done) return <DoneCard label="XML converted to CSV!" onReset={() => setDone(false)} />
  return <FileDropZone onFile={read} accept=".xml" label="Upload XML to convert to CSV" />
}

// ── JSON ↔ XML ─────────────────────────────────────────────────────────────
function JsonToXml() {
  const [done, setDone] = useState(false)
  const objToXml = (obj: Record<string, unknown>, indent = ''): string =>
    Object.entries(obj).map(([k, v]) =>
      typeof v === 'object' && v !== null
        ? `${indent}<${k}>\n${objToXml(v as Record<string, unknown>, indent + '  ')}${indent}</${k}>`
        : `${indent}<${k}>${v}</${k}>`
    ).join('\n')

  const read = useTextFile((text, name) => {
    try {
      const data = JSON.parse(text)
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${objToXml(Array.isArray(data) ? { items: data } : data, '  ')}\n</root>`
      download(xml, name.replace('.json', '.xml'), 'application/xml')
      setDone(true)
    } catch { alert('Invalid JSON.') }
  })
  if (done) return <DoneCard label="JSON converted to XML!" onReset={() => setDone(false)} />
  return <FileDropZone onFile={read} accept=".json" label="Upload JSON to convert to XML" />
}

function XmlToJson() {
  const [done, setDone] = useState(false)
  const xmlToObj = (node: Element): unknown => {
    if (!node.children.length) return node.textContent
    const obj: Record<string, unknown> = {}
    Array.from(node.children).forEach(child => {
      const val = xmlToObj(child)
      if (obj[child.tagName]) {
        if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]]
        ;(obj[child.tagName] as unknown[]).push(val)
      } else obj[child.tagName] = val
    })
    return obj
  }
  const read = useTextFile((text, name) => {
    try {
      const doc = new DOMParser().parseFromString(text, 'application/xml')
      const json = JSON.stringify(xmlToObj(doc.documentElement), null, 2)
      download(json, name.replace('.xml', '.json'), 'application/json')
      setDone(true)
    } catch { alert('Invalid XML.') }
  })
  if (done) return <DoneCard label="XML converted to JSON!" onReset={() => setDone(false)} />
  return <FileDropZone onFile={read} accept=".xml" label="Upload XML to convert to JSON" />
}

// ── Excel ↔ CSV (via SheetJS loaded from CDN) ──────────────────────────────
function ExcelToCsv() {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    setBusy(true)
    try {
      const XLSX = await import('xlsx')
      const ab = await file.arrayBuffer()
      const wb = XLSX.read(ab)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const csv = XLSX.utils.sheet_to_csv(ws)
      download(csv, file.name.replace(/\.(xlsx|xls)$/, '.csv'), 'text/csv')
      setDone(true)
    } catch { alert('Failed to read Excel file.') }
    setBusy(false)
  }
  if (done) return <DoneCard label="Excel converted to CSV!" onReset={() => setDone(false)} />
  if (busy) return <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 text-center text-sm text-[#6e6e73]">Converting…</div>
  return <FileDropZone onFile={handle} accept=".xlsx,.xls" label="Upload Excel file to convert to CSV" />
}

function CsvToExcel() {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async (file: File) => {
    setBusy(true)
    try {
      const XLSX = await import('xlsx')
      const text = await file.text()
      const ws = XLSX.utils.aoa_to_sheet(text.trim().split('\n').map(r => r.split(',')))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      XLSX.writeFile(wb, file.name.replace('.csv', '.xlsx'))
      setDone(true)
    } catch { alert('Failed to convert.') }
    setBusy(false)
  }
  if (done) return <DoneCard label="CSV converted to Excel!" onReset={() => setDone(false)} />
  if (busy) return <div className="rounded-2xl bg-[#f5f5f7] dark:bg-[#2c2c2e] p-10 text-center text-sm text-[#6e6e73]">Converting…</div>
  return <FileDropZone onFile={handle} accept=".csv" label="Upload CSV to convert to Excel" />
}

// ── Split CSV ──────────────────────────────────────────────────────────────
function SplitCsv() {
  const [done, setDone] = useState(false)
  const [rows, setRows] = useState(100)

  const read = useTextFile((text, name) => {
    const lines = text.trim().split('\n')
    const header = lines[0]
    const data = lines.slice(1)
    let part = 1
    for (let i = 0; i < data.length; i += rows) {
      const chunk = [header, ...data.slice(i, i + rows)].join('\n')
      download(chunk, `${name.replace('.csv', '')}_part${part}.csv`, 'text/csv')
      part++
    }
    setDone(true)
  })

  if (done) return <DoneCard label="CSV split into parts!" onReset={() => setDone(false)} />
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#86868b] font-medium block mb-1.5">Rows per file</label>
        <input type="number" className="apple-input text-sm" value={rows} onChange={e => setRows(+e.target.value)} />
      </div>
      <FileDropZone onFile={read} accept=".csv" label="Upload CSV to split" />
    </div>
  )
}

// ── Tool registry ──────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'csv-json',   label: 'CSV → JSON',   icon: '🔄', component: CsvToJson },
  { id: 'json-csv',   label: 'JSON → CSV',   icon: '🔄', component: JsonToCsv },
  { id: 'csv-xml',    label: 'CSV → XML',    icon: '🔄', component: CsvToXml },
  { id: 'xml-csv',    label: 'XML → CSV',    icon: '🔄', component: XmlToCsv },
  { id: 'json-xml',   label: 'JSON → XML',   icon: '🔄', component: JsonToXml },
  { id: 'xml-json',   label: 'XML → JSON',   icon: '🔄', component: XmlToJson },
  { id: 'excel-csv',  label: 'Excel → CSV',  icon: '📊', component: ExcelToCsv },
  { id: 'csv-excel',  label: 'CSV → Excel',  icon: '📊', component: CsvToExcel },
  { id: 'split-csv',  label: 'Split CSV',    icon: '✂️', component: SplitCsv },
]

export default function FileConverterPage() {
  const [active, setActive] = useState(TOOLS[0].id)
  const tool = TOOLS.find(t => t.id === active)!

  return (
    <div className="max-w-5xl mx-auto px-5 pt-12 pb-24">
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3]">Home</a><span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">File Converter</span>
      </div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"/>
          {TOOLS.length} Converters · All Free · Browser-based
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-2">File Converter</h1>
        <p className="text-[#6e6e73] max-w-lg">Convert CSV, JSON, XML and Excel files instantly. Nothing uploaded to a server.</p>
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
