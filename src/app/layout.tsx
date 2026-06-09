import type { Metadata } from 'next'
// @ts-ignore
import '../styles/globals.css'
import SiteNav from '../components/SiteNav'

export const metadata: Metadata = {
  title: 'StudyWeapon — Free Study Tools for Students',
  description: 'Free AI writing tools, flashcard generators, GPA calculators, citation builders, and more. No signup, no paywall.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6546658394129460"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] antialiased">
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-24 bg-[#f5f5f7] dark:bg-[#1c1c1e] border-t border-black/[0.06] dark:border-white/[0.06] py-12 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-extrabold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Study<span className="text-[#0071e3]">Weapon</span>
            </div>
            <p className="text-xs text-[#86868b]">Free forever. No signup. No paywall.</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#86868b]">
            <a href="/privacy" className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors">Terms of Use</a>
            <a href="/terms" className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] text-xs text-[#86868b]">
          © 2026 StudyWeapon. All rights reserved. studyweapon.com
        </div>
      </div>
    </footer>
  )
}
