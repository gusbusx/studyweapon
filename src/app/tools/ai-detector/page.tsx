'use client'

const DETECTORS = [
  { name: 'GPTZero',     desc: 'Most widely used AI detector. Checks perplexity & burstiness.',    url: 'https://gptzero.me',                        color: '#1a73e8', bg: '#e8f0fe', logo: 'https://gptzero.me/favicon.ico' },
  { name: 'ZeroGPT',     desc: 'Fast detection supporting ChatGPT, GPT-4 and more models.',        url: 'https://zerogpt.com',                       color: '#16a34a', bg: '#dcfce7', logo: 'https://zerogpt.com/favicon.ico' },
  { name: 'Copyleaks',   desc: 'Enterprise-grade AI and plagiarism detection platform.',            url: 'https://copyleaks.com/ai-content-detector', color: '#7c3aed', bg: '#f3e8ff', logo: 'https://copyleaks.com/favicon.ico' },
  { name: 'Turnitin',    desc: 'The standard for academic integrity used by most universities.',    url: 'https://turnitin.com',                      color: '#dc2626', bg: '#fee2e2', logo: 'https://turnitin.com/favicon.ico' },
  { name: 'Quillbot',    desc: 'AI content detector with high accuracy and fast results.',          url: 'https://quillbot.com/ai-content-detector',  color: '#d97706', bg: '#fef3c7', logo: 'https://quillbot.com/favicon.ico' },
  { name: 'Writer',      desc: 'Clean and fast AI content checker built for teams.',               url: 'https://writer.com/ai-content-detector',    color: '#0d9488', bg: '#ccfbf1', logo: 'https://writer.com/favicon.ico' },
  { name: 'Sapling',     desc: 'Sentence-level AI detection with detailed breakdowns.',            url: 'https://sapling.ai/ai-content-detector',    color: '#0891b2', bg: '#e0f2fe', logo: 'https://sapling.ai/favicon.ico' },
  { name: 'Originality', desc: 'Built for content teams, publishers and marketers.',               url: 'https://originality.ai',                    color: '#9333ea', bg: '#fae8ff', logo: 'https://originality.ai/favicon.ico' },
]

export default function AIDetectorPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 pt-12 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#86868b] mb-8">
        <a href="/" className="hover:text-[#0071e3] transition-colors">Home</a>
        <span>/</span>
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">AI Detectors</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#0071e3]/20 text-[#0071e3] rounded-full px-3.5 py-1.5 text-xs font-bold mb-4 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse"/>
          8 Detectors · All Free
        </div>
        <h1 className="font-extrabold text-4xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.02em] mb-3">
          AI Content Detectors
        </h1>
        <p className="text-[#6e6e73] max-w-lg leading-relaxed">
          The top AI detectors in one place. Click any card to check your text — opens directly in a new tab.
        </p>
      </div>

      <div className="ad-slot w-full mb-10">Advertisement</div>

      {/* How to use */}
      <div className="bg-gradient-to-br from-[#e8f0fe] to-[#f3e8ff] dark:from-[#0071e3]/10 dark:to-[#7c3aed]/10 rounded-3xl p-6 mb-10 flex flex-col sm:flex-row items-center gap-5 border border-[#0071e3]/10">
        <div className="flex-1">
          <h2 className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Recommended workflow</h2>
          <ol className="text-sm text-[#6e6e73] space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span> Humanize your text first</li>
            <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span> Copy the result</li>
            <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span> Click a detector below and paste</li>
          </ol>
        </div>
        <a href="/tools/humanizer" className="apple-btn-blue rounded-full px-6 py-3 text-sm shrink-0 shadow-blue-glow">
          AI Humanizer →
        </a>
      </div>

      {/* Detector grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {DETECTORS.map((d, i) => (
          <a
            key={d.name}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 flex items-center gap-5 shadow-apple-sm hover:shadow-apple hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: d.bg }}>
              <img
                src={d.logo}
                alt={d.name}
                className="w-8 h-8 object-contain"
                onError={e => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `<span style="font-size:22px;font-weight:800;color:${d.color}">${d.name[0]}</span>`
                  }
                }}
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors duration-200">
                  {d.name}
                </h3>
                <span className="text-[#86868b] group-hover:text-[#0071e3] transition-all duration-200 group-hover:translate-x-0.5 shrink-0 text-lg">↗</span>
              </div>
              <p className="text-sm text-[#6e6e73] leading-snug line-clamp-2">{d.desc}</p>
            </div>

            {/* Hover accent line */}
            <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ backgroundColor: d.color }}/>
          </a>
        ))}
      </div>

      <div className="ad-slot w-full mb-8">Advertisement</div>

      <section className="pt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
        <h2 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">About AI Detectors</h2>
        <p className="text-sm text-[#6e6e73] leading-relaxed max-w-3xl">
          AI detectors analyze writing patterns, perplexity, and burstiness to estimate whether text was written by a human or AI. No detector is 100% accurate — results vary across tools. Use them as a guide when reviewing your work.
        </p>
      </section>
    </div>
  )
}
