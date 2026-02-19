'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import Link from 'next/link'

/** ТЗ-4: Финансы — редирект в кабинет арендодателя (контент там). Сохраняем URL /profile/finance в сайдбаре. */
export default function ProfileFinancePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const isLandlord = (user as any)?.role === 'landlord' || (user as any)?.listingUsed > 0

  useEffect(() => {
    if (!isAuthenticated()) return
    if (isLandlord) router.replace('/owner/dashboard?tab=finances')
  }, [isAuthenticated(), isLandlord, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-[var(--accent)] text-[14px]">Войти в аккаунт</Link>
        </div>
      </div>
    )
  }

  if (!isLandlord) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Финансы</h1>
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 text-center">
          <p className="text-[var(--text-secondary)] mb-4">Финансы доступны для арендодателей.</p>
          <Link href="/dashboard/listings/create" className="text-[var(--accent)] font-medium hover:underline">
            Разместить объявление
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-[var(--text-muted)] text-[14px]">Переход в раздел «Финансы»…</p>
    </div>
  )
}
