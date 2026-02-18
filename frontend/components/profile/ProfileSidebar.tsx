'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

/** ТЗ-20: Дашборд, Доход, затем настройки */
const TABS = [
  { href: '/profile', label: 'Дашборд' },
  { href: '/profile/income', label: 'Доход' },
  { href: '/profile/security', label: 'Безопасность' },
  { href: '/profile/notifications', label: 'Уведомления' },
  { href: '/profile/payments', label: 'Платежи' },
  { href: '/profile/docs', label: 'Документы' },
  { href: '/profile/settings', label: 'Настройки' },
] as const

export function ProfileSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile: accordion — выбор вкладки открывает список */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className={cn(
            'w-full flex items-center justify-between rounded-[16px] p-4',
            'bg-[var(--bg-card)]/80 backdrop-blur border border-[var(--border-main)]',
            'text-[var(--text-primary)] font-medium'
          )}
          aria-expanded={mobileOpen}
        >
          {TABS.find((t) => pathname === t.href)?.label ?? 'Дашборд'}
          <svg className={cn('w-5 h-5 transition-transform', mobileOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur overflow-hidden">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 text-[14px] font-medium transition-colors',
                  pathname === tab.href
                    ? 'bg-[var(--accent)] text-[var(--button-primary-text)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: сайдбар */}
      <aside className="hidden lg:block rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sticky top-6">
        <nav className="space-y-0.5">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'block px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
                  isActive ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
