'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminModerationPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin?tab=moderation')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[14px] text-[#6B7280]">Перенаправление в модерацию…</p>
    </div>
  )
}
