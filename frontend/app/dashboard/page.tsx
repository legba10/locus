'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** TZ-27: /dashboard удалён. Единственный кабинет — /profile. */
export default function DashboardPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/profile')
  }, [router])
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Перенаправление в профиль…</p>
    </div>
  )
}
