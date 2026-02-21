'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'

export default function ProfileCalendarPage() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-[var(--accent)] text-[14px]">Войти в аккаунт</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Календарь</h1>
      <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6">
        <p className="text-[14px] text-[var(--text-secondary)]">
          Здесь будут отображаться занятые и свободные даты ваших объявлений.
        </p>
      </div>
    </div>
  )
}
