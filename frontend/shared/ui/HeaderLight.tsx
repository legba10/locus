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
  const tariff = user?.profile?.tariff ?? 'free'
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
                <div className={cn(
                  'w-9 h-9 rounded-xl',
                  'bg-gradient-to-br from-violet-100 to-violet-50',
                  'border border-violet-100',
                  'flex items-center justify-center',
                  'text-violet-600 text-[14px] font-semibold'
                )}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
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
    </header>
  )
}
