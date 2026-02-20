'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useMemo } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { useRouter } from 'next/navigation'

/** TZ-27: Единая навигация — только /profile. Назад в профиль. */
function useCabinetTabs() {
  const pathname = usePathname()
  const { user, hasRole } = useAuthStore()
  const isLandlord = hasRole?.('landlord') || user?.role === 'landlord' || (user && (user as any).listingUsed > 0)

  return useMemo(() => {
    const tabs: Array<{ href: string; label: string; isActive: boolean; section?: string }> = []
    if (isLandlord) {
      tabs.push({ href: '/profile/listings', label: 'Мои объявления', isActive: pathname?.startsWith('/profile/listings'), section: 'main' })
    }
    tabs.push(
      { href: '/profile/bookings', label: 'Бронирования', isActive: pathname?.startsWith('/profile/bookings'), section: 'main' },
      { href: '/messages', label: 'Сообщения', isActive: pathname?.startsWith('/messages'), section: 'main' },
      { href: '/favorites', label: 'Избранное', isActive: pathname === '/favorites', section: 'main' }
    )
    if (isLandlord) {
      tabs.push(
        { href: '/profile/promo', label: 'Продвижение', isActive: pathname?.startsWith('/profile/promo'), section: 'landlord' },
        { href: '/profile/finance', label: 'Финансы', isActive: pathname?.startsWith('/profile/finance'), section: 'landlord' }
      )
    }
    tabs.push(
      { href: '/profile/settings', label: 'Настройки', isActive: pathname?.startsWith('/profile/settings'), section: 'system' }
    )
    return { tabs, isLandlord }
  }, [pathname, isLandlord])
}

const SECTION_LABELS: Record<string, string> = {
  main: 'Основное',
  landlord: 'Для арендодателя',
  system: 'Система',
}

export function ProfileSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const { tabs, isLandlord } = useCabinetTabs()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentLabel = tabs.find((t) => t.isActive)?.label ?? (pathname === '/profile' ? 'Профиль' : tabs[0]?.label ?? 'Профиль')

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
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]">
                ← Назад в профиль
              </Link>
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
        <Link href="/profile" className="block px-4 py-2 mb-2 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← Назад в профиль
        </Link>
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
