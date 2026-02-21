'use client'

/** TZ-30: Настройки — Основное, Безопасность, Интерфейс. Один экран, три блока, отступы 24px. */

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useSoundStore } from '@/core/sound/useSoundStore'
import { ProfileCard } from '@/components/profile'
import { ThemeSettings } from '@/components/ui/ThemeSettings'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const CARD_CLS =
  'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'

export default function ProfileSettingsPage() {
  const { isAuthenticated } = useAuthStore()
  const { soundEnabled, toggleSoundEnabled } = useSoundStore()

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
      <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Настройки</h1>

      {/* Блок 1: Основное */}
      <section className={CARD_CLS}>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">Основное</h2>
        <p className="text-[14px] text-[var(--text-secondary)] mb-4">
          Имя, email, телефон, аватар
        </p>
        <Link
          href="/profile/edit"
          className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--accent)] hover:underline"
        >
          Редактировать <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Блок 2: Безопасность */}
      <section className={CARD_CLS}>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">Безопасность</h2>
        <p className="text-[14px] text-[var(--text-secondary)] mb-4">
          Смена пароля, активные сессии
        </p>
        <Link
          href="/profile/security"
          className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--accent)] hover:underline"
        >
          Перейти <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Блок 3: Интерфейс */}
      <section className={CARD_CLS}>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">Интерфейс</h2>
        <p className="text-[14px] text-[var(--text-secondary)] mb-4">
          Язык, тема, уведомления
        </p>
        <ProfileCard className="mb-4">
          <ThemeSettings />
        </ProfileCard>
        <Link
          href="/profile/notifications"
          className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--accent)] hover:underline"
        >
          Настройки уведомлений <ChevronRight className="w-4 h-4" />
        </Link>
        <div className="mt-4 pt-4 border-t border-[var(--border-main)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium text-[var(--text-primary)]">🔔 Звуковые уведомления</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">Входящие сообщения, бронирования и системные события</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={toggleSoundEnabled}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                soundEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--bg-input)]'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  soundEnabled ? 'left-6' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
