'use client'
import { useState } from 'react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText('This tool literally saved my GPA 😭 thestudyweapon.com')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="shrink-0 apple-btn-blue text-xs px-4 py-2 rounded-full"
    >
      {copied ? '✓ Copied!' : 'Share'}
    </button>
  )
}
