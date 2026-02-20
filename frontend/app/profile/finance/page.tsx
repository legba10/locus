'use client'

/** TZ-30: Финансы — /profile/finance. Баланс, тариф, история платежей, лимиты. Placeholder, если функционал не готов. */

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const CARD_CLS = 'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'

export default function ProfileFinancePage() {
  const { isAuthenticated, user } = useAuthStore()
  const isLandlord = (user as any)?.role === 'landlord' || (user as any)?.listingUsed > 0

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

  if (!isLandlord) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/profile" className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6">
            <ChevronLeft className="w-4 h-4" />
            Назад в профиль
          </Link>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-6">Финансы</h1>
          <div className={cn(CARD_CLS, 'text-center')}>
            <p className="text-[var(--text-secondary)] mb-4">Финансы доступны для арендодателей.</p>
            <Link href="/profile/listings/create" className="text-[var(--accent)] font-medium hover:underline">
              Стать арендодателем
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/profile" className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6">
          <ChevronLeft className="w-4 h-4" />
          Назад в профиль
        </Link>

        <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-6">Финансы</h1>

        <div className="space-y-6">
          <div className={CARD_CLS}>
            <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-2">Баланс</h2>
            <p className="text-[24px] font-bold text-[var(--text-primary)]">0 ₽</p>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">Доступно к выводу</p>
          </div>

          <div className={CARD_CLS}>
            <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-2">Тариф</h2>
            <p className="text-[var(--text-primary)]">Базовый</p>
            <Link href="/pricing" className="text-[13px] text-[var(--accent)] hover:underline mt-1 inline-block">
              Сменить тариф
            </Link>
          </div>

          <div className={CARD_CLS}>
            <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-2">История платежей</h2>
            <p className="text-[14px] text-[var(--text-muted)]">Пока нет операций</p>
          </div>

          <div className={CARD_CLS}>
            <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-2">Лимиты</h2>
            <p className="text-[14px] text-[var(--text-primary)]">По тарифу: уточняется</p>
          </div>
        </div>
      </div>
    </div>
  )
}
