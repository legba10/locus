'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  const isActive = (path: string) => pathname === path
  const isLandlord = user?.role === 'landlord' || (user?.roles?.includes('landlord') ?? false)
  const tariff = user?.tariff ?? 'free'
  const isPaidTariff = tariff === 'landlord_basic' || tariff === 'landlord_pro'
  const canAccessOwner = isLandlord && isPaidTariff

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
          <nav className="hidden md:flex items-center gap-7 h-full">
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
            <Link 
              href="/owner/dashboard"
              className={cn(
                'text-[14px] font-medium transition-colors',
                'flex items-center h-full',
                isActive('/owner/dashboard') 
                  ? 'text-violet-600' 
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {canAccessOwner ? 'Кабинет' : 'Сдать жильё'}
            </Link>
            {isAuthenticated() && (
              <Link 
                href="/favorites"
                className={cn(
                  'text-[14px] font-medium transition-colors',
                  isActive('/favorites') 
                    ? 'text-violet-600' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Избранное
              </Link>
            )}
            {isAuthenticated() && (
              <Link
                href="/profile"
                className={cn(
                  'text-[14px] font-medium transition-colors',
                  isActive('/profile')
                    ? 'text-violet-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Профиль
              </Link>
            )}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <div className="flex items-center gap-3">
                {canAccessOwner ? (
                  <Link
                    href="/owner/dashboard"
                    className={cn(
                      'hidden md:block text-[13px] font-medium transition-colors',
                      'flex items-center h-full',
                      'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    Мои объявления
                  </Link>
                ) : null}
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
                <div className="md:hidden flex items-center gap-2">
                  <Link
                    href="/bookings"
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    aria-label="Бронирования"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </Link>
                  <Link
                    href="/messages"
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    aria-label="Сообщения"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Link>
                  <Link
                    href="/profile"
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    aria-label="Профиль"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                </div>
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
    </header>
  )
}
