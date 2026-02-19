'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'

/** ТЗ-20.6: Экран дохода — за месяц, за всё время, график (UI без смены API) */
export default function ProfileIncomePage() {
  const { user, isAuthenticated } = useAuthStore()

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

  const isLandlord = (user as any)?.role === 'landlord' || (user as any)?.listingUsed > 0

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Доход</h1>

      {!isLandlord ? (
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 text-center">
          <p className="text-[var(--text-secondary)] mb-4">Доход доступен для арендодателей.</p>
          <Link href="/dashboard/listings/create" className="text-[var(--accent)] font-medium hover:underline">
            Разместить объявление
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5">
              <p className="text-[13px] text-[var(--text-muted)]">За месяц</p>
              <p className="text-[24px] font-bold text-[var(--text-primary)] mt-1 tabular-nums">— ₽</p>
            </div>
            <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5">
              <p className="text-[13px] text-[var(--text-muted)]">За всё время</p>
              <p className="text-[24px] font-bold text-[var(--text-primary)] mt-1 tabular-nums">— ₽</p>
            </div>
          </div>
          <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">График</h2>
            <div className="h-48 rounded-[12px] bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] text-[14px]">
              График дохода (данные из API при подключении)
            </div>
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">
            Подробная аналитика в{' '}
            <Link href="/owner/dashboard?tab=analytics" className="text-[var(--accent)] hover:underline">
              кабинете арендодателя
            </Link>
            .
          </p>
        </>
      )}
    </div>
  )
}
