'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

/** TZ-20: прелоадер при первом входе — логотип, градиент, loader, 0.8–1.2 сек */
const DURATION_MS = 1000

export function AppPreloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const key = 'locus_preloader_seen'
    const seen = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key) === '1'
    if (seen) {
      setVisible(false)
      return
    }
    const t = setTimeout(() => {
      setVisible(false)
      try { sessionStorage.setItem(key, '1') } catch {}
    }, DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex flex-col items-center justify-center bg-gradient-to-br from-[var(--accent)]/90 via-[var(--accent)] to-indigo-600"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/logo.png"
          alt=""
          width={140}
          height={40}
          className="h-10 w-auto object-contain opacity-95"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/favicon.svg'
          }}
        />
        <div
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"
          aria-hidden
        />
      </div>
    </div>
  )
}
