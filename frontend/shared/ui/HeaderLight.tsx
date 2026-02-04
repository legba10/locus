'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Logo } from './Logo'

/**
 * HeaderLight — v3 Premium Header
 * 
 * По ТЗ v3:
 * - Логотип БЕЗ квадратного контейнера, прозрачный фон
 * - icon 28px + text LOCUS
 * - gap 8px
 * - hover: scale(1.04) + soft shadow
 * - align baseline с навигацией
 */
export function HeaderLight() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobilePanelRef = useRef<HTMLDivElement | null>(null)

  const isActive = (path: string) => pathname === path
  const isLandlord = user?.role === 'landlord' || (user?.roles?.includes('landlord') ?? false)
  const tariff = user?.tariff ?? 'free'
  const isPaidTariff = tariff === 'landlord_basic' || tariff === 'landlord_pro'
  const canAccessOwner = isLandlord && isPaidTariff
  const hostCtaHref = canAccessOwner ? '/owner/dashboard?tab=add' : '/pricing?reason=host'

  const desktopNav = useMemo(() => {
    if (isLandlord) {
      return [
        { label: 'Мои объявления', href: '/owner/dashboard?tab=listings' },
        { label: 'Добавить объявление', href: hostCtaHref },
        { label: 'Бронирования', href: '/bookings' },
        { label: 'Сообщения', href: '/messages' },
        { label: 'Аналитика', href: '/owner/dashboard?tab=analytics' },
        { label: 'Профиль', href: '/profile' },
      ]
    }
    return [
      { label: 'Бронирования', href: '/bookings' },
      { label: 'Избранное', href: '/favorites' },
      { label: 'Сообщения', href: '/messages' },
      { label: 'Профиль', href: '/profile' },
    ]
  }, [isLandlord, hostCtaHref])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (mobilePanelRef.current && !mobilePanelRef.current.contains(target)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className={cn(
      'sticky top-0 z-50',
      'bg-white/95 backdrop-blur-md',
      'border-b border-gray-100/80',
      'shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
    )}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo — по ТЗ v3: без контейнера, baseline aligned */}
          <div className="flex items-center">
            <Logo variant="primary" size="md" />
          </div>

          {/* Navigation — выровнено по центру */}
          <nav className="hidden md:flex items-center gap-6 h-full">
            <Link
              href="/listings"
              className={cn(
                'text-[14px] font-medium transition-colors',
                'flex items-center h-full',
                isActive('/listings')
                  ? 'text-violet-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Поиск жилья
            </Link>
            {isAuthenticated() &&
              desktopNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[14px] font-medium transition-colors',
                    'flex items-center h-full',
                    isActive(item.href.split('?')[0])
                      ? 'text-violet-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            <Link
              href="/pricing"
              className={cn(
                'text-[14px] font-semibold transition-colors',
                isActive('/pricing') ? 'text-violet-700' : 'text-violet-600 hover:text-violet-700'
              )}
            >
              Тарифы
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <div className="flex items-center gap-3">
                {!canAccessOwner && (
                  <Link
                    href="/pricing"
                    className={cn(
                      'hidden md:inline-flex items-center rounded-xl px-3.5 py-2 text-[13px] font-semibold',
                      'bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors'
                    )}
                  >
                    Тарифы
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={cn(
                    'w-9 h-9 rounded-xl',
                    'bg-gradient-to-br from-violet-100 to-violet-50',
                    'border border-violet-100',
                    'flex items-center justify-center',
                    'text-violet-600 text-[14px] font-semibold'
                  )}
                  aria-label="Профиль"
                >
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Link>
                <button
                  onClick={logout}
                  className={cn(
                    'px-3.5 py-2 text-[13px] font-medium rounded-xl',
                    'text-gray-500 hover:text-gray-900',
                    'hover:bg-gray-50',
                    'transition-colors'
                  )}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <>
                {/* Войти */}
                <Link 
                  href="/auth/login"
                  className={cn(
                    'px-4 py-2 text-[14px] font-medium rounded-xl',
                    'text-gray-700',
                    'hover:bg-gray-100',
                    'transition-colors'
                  )}
                >
                  Войти
                </Link>
                
                {/* Регистрация — фиолетовая CTA */}
                <Link 
                  href="/auth/register"
                  className={cn(
                    'px-4 py-2 text-[14px] font-semibold rounded-xl',
                    'bg-violet-600 text-white',
                    'hover:bg-violet-700',
                    'transition-all duration-200',
                    'shadow-md shadow-violet-500/25',
                    'hover:shadow-lg hover:shadow-violet-500/30',
                    'hover:-translate-y-0.5'
                  )}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Burger Button */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className={cn(
          'md:hidden fixed bottom-4 right-4 z-[60]',
          'w-12 h-12 rounded-full',
          'bg-violet-600 text-white shadow-[0_12px_32px_rgba(124,58,237,0.35)]',
          'flex items-center justify-center text-xl'
        )}
        aria-label="Открыть меню"
      >
        ☰
      </button>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
          <div
            ref={mobilePanelRef}
            className={cn(
              'fixed right-4 bottom-20 left-4',
              'rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]',
              'p-5 space-y-3'
            )}
          >
            {isAuthenticated() ? (
              <>
                {isLandlord && (
                  <div className="space-y-2">
                    <Link
                      href="/owner/dashboard?tab=listings"
                      className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      Мои объявления
                    </Link>
                    <Link
                      href={hostCtaHref}
                      className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      Добавить объявление
                    </Link>
                    <Link
                      href="/owner/dashboard?tab=analytics"
                      className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      Аналитика
                    </Link>
                  </div>
                )}
                <Link
                  href="/bookings"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Бронирования
                </Link>
                <Link
                  href="/messages"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Сообщения
                </Link>
                {!isLandlord && (
                  <Link
                    href="/favorites"
                    className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Избранное
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Профиль
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                    setMobileOpen(false)
                  }}
                  className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Регистрация
                </Link>
                <Link
                  href="/pricing"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-violet-700 hover:bg-violet-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Тарифы
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
