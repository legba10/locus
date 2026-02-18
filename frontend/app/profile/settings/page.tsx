'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { ProfileCard } from '@/components/profile'
import { ThemeSettings } from '@/components/ui/ThemeSettings'
import { cn } from '@/shared/utils/cn'

export default function ProfileSettingsPage() {
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
      <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Настройки интерфейса</h1>

      <ProfileCard>
        <ThemeSettings />
      </ProfileCard>

      <ProfileCard title="Язык">
        <p className="text-[14px] text-[var(--text-secondary)] mb-3">Язык интерфейса</p>
        <div className="flex gap-2">
          <button type="button" className={cn('px-4 py-2 rounded-[12px] text-[14px] font-medium bg-[var(--accent)] text-[var(--button-primary-text)]')}>
            Русский
          </button>
          <button type="button" className="px-4 py-2 rounded-[12px] text-[14px] font-medium border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]">
            English
          </button>
        </div>
      </ProfileCard>
    </div>
  )
}
