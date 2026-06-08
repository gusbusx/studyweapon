'use client'
import { useState } from 'react'

export default function HumanizerPage() {
  const [iframeBlocked, setIframeBlocked] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-6">
        <a href="/" className="hover:text-[#0071e3]">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">AI Humanizer</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse"/>
          Powered by aihumanize.io · Free
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-2">
          AI Writing Humanizer
        </h1>
        <p className="text-[#6e6e73] max-w-xl leading-relaxed">
          Make AI-generated text sound natural and human. Powered by{' '}
          <a href="https://aihumanize.io" target="_blank" rel="noopener noreferrer"
            className="text-[#0071e3] hover:underline font-medium">aihumanize.io</a>.
        </p>
      </div>

      <div className="ad-slot w-full mb-6">Advertisement</div>

      {/* Iframe or fallback */}
      {!iframeBlocked ? (
        <div className="rounded-3xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-apple bg-white dark:bg-[#1c1c1e]">
          <iframe
            src="https://aihumanize.io"
            title="AI Humanizer by aihumanize.io"
            className="w-full"
            style={{ height: '750px', border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setIframeBlocked(true)}
          />
        </div>
      ) : (
        /* Fallback card if blocked */
        <div className="rounded-3xl bg-[#f5f5f7] dark:bg-[#1c1c1e] p-12 flex flex-col items-center text-center gap-5">
          <div className="text-4xl">✦</div>
          <div>
            <h2 className="font-bold text-xl text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">AI Humanizer</h2>
            <p className="text-[#6e6e73] text-sm max-w-md leading-relaxed">
              This tool is powered by aihumanize.io. Click below to open it — paste your text and humanize it instantly.
            </p>
          </div>
          <a href="https://aihumanize.io" target="_blank" rel="noopener noreferrer"
            className="apple-btn-blue rounded-full px-8 py-3.5 text-sm font-bold">
            Open aihumanize.io →
          </a>
        </div>
      )}

      <p className="text-xs text-[#86868b] mt-3 text-center">
        AI Humanizer tool provided by{' '}
        <a href="https://aihumanize.io" target="_blank" rel="noopener noreferrer" className="hover:underline">aihumanize.io</a>
      </p>

      <div className="ad-slot w-full mt-8 mb-8">Advertisement</div>
    </div>
  )
}
