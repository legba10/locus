'use client'

/** TZ-30: Продвижение — /profile/promo. Активный тариф, преимущества PRO, кнопка подключения. Без 404. */

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'

const CARD_CLS = 'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'

const PRO_FEATURES = [
  'Выделение объявления в каталоге',
  'Приоритет в поиске',
  'Расширенная статистика',
  'Поддержка 24/7',
]

export default function ProfilePromoPage() {
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
    <>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-6">Продвижение</h1>

        <div className="space-y-6">
          <div className={CARD_CLS}>
            <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-2">Активный тариф</h2>
            <p className="text-[var(--text-primary)] font-medium">Базовый</p>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">Продвижение объявлений не подключено</p>
          </div>

          <div className={CARD_CLS}>
            <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-3">Преимущества PRO</h2>
            <ul className="space-y-2">
              {PRO_FEATURES.map((text, i) => (
                <li key={i} className="flex items-center gap-2 text-[14px] text-[var(--text-primary)]">
                  <span className="text-[var(--accent)]">✓</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/pricing"
            className={cn(
              'flex items-center justify-center w-full py-4 rounded-[16px] font-semibold text-[15px]',
              'bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95'
            )}
          >
            Подключить продвижение
          </Link>
        </div>
    </>
  )
}
