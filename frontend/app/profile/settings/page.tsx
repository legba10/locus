'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { ProfileCard } from '@/components/profile'
import { ThemeSettings } from '@/components/ui/ThemeSettings'
import { cn } from '@/shared/utils/cn'

/** ТЗ-8: Настройки — только имя, почта, пароль, аватар, уведомления, тема. */
const SETTINGS_NAV = [
  { href: '/profile', label: 'Аккаунт' },
  { href: '/profile/security', label: 'Пароль' },
  { href: '/profile/notifications', label: 'Уведомления' },
  { href: '/profile/settings', label: 'Интерфейс' },
]

export default function ProfileSettingsPage() {
  const pathname = usePathname()
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
      <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Настройки</h1>
      <nav className="flex flex-wrap gap-2 pb-2 border-b border-[var(--border-main)]">
        {SETTINGS_NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors',
              (pathname?.replace(/\/$/, '') || '') === href.replace(/\/$/, '')
                ? 'bg-[var(--accent)] text-[var(--button-primary-text)]'
                : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <section>
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-4">Интерфейс</h2>
        <ProfileCard>
          <ThemeSettings />
        </ProfileCard>
      </section>
    </div>
  )
}
