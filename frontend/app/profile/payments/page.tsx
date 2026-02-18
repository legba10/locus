'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { PaymentsBlock } from '@/components/profile'

export default function ProfilePaymentsPage() {
  const { isAuthenticated } = useAuthStore()

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

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Платежи</h1>
      <PaymentsBlock />
    </div>
  )
}
