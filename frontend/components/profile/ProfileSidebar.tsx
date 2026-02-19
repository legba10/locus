'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { useRouter } from 'next/navigation'

/** ТЗ-16: Профиль — Обзор, Основные (Мои объявления, Бронирования, Сообщения, Избранное), Для арендодателя (Продвижение, Финансы), Системные (Настройки, Поддержка). Без Аналитики, без Админ, без дублей. */
function useCabinetTabs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, hasRole } = useAuthStore()
  const isLandlord = hasRole?.('landlord') || user?.role === 'landlord' || (user && (user as any).listingUsed > 0)

  return useMemo(() => {
    const profileActive = pathname === '/profile' && !pathname.startsWith('/profile/')
    const tabs: Array<{ href: string; label: string; isActive: boolean; section?: string }> = [
      { href: '/profile', label: 'Обзор', isActive: profileActive },
    ]
    // Основные
    tabs.push(
      { href: '/owner/dashboard?tab=listings', label: 'Мои объявления', isActive: pathname === '/owner/dashboard' && searchParams?.get('tab') === 'listings', section: 'main' },
      { href: '/owner/dashboard?tab=bookings', label: 'Бронирования', isActive: pathname === '/owner/dashboard' && searchParams?.get('tab') === 'bookings', section: 'main' },
      { href: '/messages', label: 'Сообщения', isActive: pathname?.startsWith('/messages'), section: 'main' },
      { href: '/favorites', label: 'Избранное', isActive: pathname === '/favorites', section: 'main' }
    )
    // Для арендодателя (только если есть объявления)
    if (isLandlord) {
      tabs.push(
        { href: '/owner/dashboard?tab=promotion', label: 'Продвижение', isActive: pathname === '/owner/dashboard' && searchParams?.get('tab') === 'promotion', section: 'landlord' },
        { href: '/profile/finance', label: 'Финансы', isActive: pathname === '/profile/finance' || pathname === '/profile/income', section: 'landlord' }
      )
    }
    // Системные
    tabs.push(
      { href: '/profile/settings', label: 'Настройки', isActive: pathname?.startsWith('/profile/settings'), section: 'system' },
      { href: '/help', label: 'Поддержка', isActive: pathname === '/help', section: 'system' }
    )
    return { tabs, isLandlord }
  }, [pathname, searchParams, isLandlord])
}

const SECTION_LABELS: Record<string, string> = {
  main: 'Основные',
  landlord: 'Для арендодателя',
  system: 'Системные',
}

export function ProfileSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const { tabs, isLandlord } = useCabinetTabs()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentLabel = tabs.find((t) => t.isActive)?.label ?? (pathname === '/profile' ? 'Обзор' : tabs[0]?.label ?? 'Обзор')

  const handleLogout = () => {
    setMobileOpen(false)
    logout()
    router.push('/')
  }

  const renderNav = () => {
    let lastSection: string | undefined
    return (
      <nav className="space-y-0.5">
        {tabs.map((tab) => {
          const showSection = tab.section && tab.section !== lastSection
          if (showSection && tab.section) lastSection = tab.section
          return (
            <div key={tab.href + tab.label}>
              {showSection && (
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {SECTION_LABELS[tab.section]}
                </p>
              )}
              <Link
                href={tab.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
                  tab.isActive ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
                )}
              >
                {tab.label}
              </Link>
            </div>
          )
        })}
      </nav>
    )
  }

  return (
    <>
      {/* Mobile: accordion */}
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
          {currentLabel}
          <svg className={cn('w-5 h-5 transition-transform', mobileOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur overflow-hidden">
            <div className="py-2">
              {renderNav()}
            </div>
            <div className="border-t border-[var(--border-main)] mt-1 pt-1">
              <button type="button" onClick={handleLogout} className="block w-full px-4 py-3 text-left text-[14px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]">
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: сайдбар с группами */}
      <aside className="hidden lg:block rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sticky top-6">
        {renderNav()}
        <div className="border-t border-[var(--border-main)] mt-2 pt-2">
          <button type="button" onClick={handleLogout} className="block w-full px-4 py-3 rounded-[12px] text-left text-[14px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]">
            Выйти
          </button>
        </div>
      </aside>
    </>
  )
}
