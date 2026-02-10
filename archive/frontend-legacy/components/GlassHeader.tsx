'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { GlassButton } from '@/ui-system/glass'
import { RU } from '@/core/i18n/ru'

interface GlassHeaderProps {
  className?: string
}

/**
 * GlassHeader — Header v2 в стиле LOCUS
 * 
 * Элементы:
 * - логотип LOCUS (голубой)
 * - поиск
 * - кнопки: Войти (glass), Регистрация (AI Purple gradient)
 */
export function GlassHeader({ className }: GlassHeaderProps) {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  const isActive = (path: string) => pathname === path
  const isLandlord = user?.role === 'landlord' || (user?.roles?.includes('landlord') ?? false)
  const tariff = user?.tariff ?? 'free'
  const isPaidTariff = tariff === 'landlord_basic' || tariff === 'landlord_pro'
  const canAccessOwner = isLandlord && isPaidTariff

  return (
    <header className={cn(
      'sticky top-0 z-30',
      'bg-slate-950/80 backdrop-blur-xl',
      'border-b border-white/[0.1]',
      className
    )}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <span className={cn(
              'text-xl font-bold',
              'bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent',
              'group-hover:from-blue-300 group-hover:to-blue-400',
              'transition-all duration-300'
            )}>
              LOCUS
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/listings"
              className={cn(
                'text-sm font-medium transition-colors',
                isActive('/listings') 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white'
              )}
            >
              {RU.search.title}
            </Link>
            {isAuthenticated() && (
              <Link 
                href="/favorites"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive('/favorites') 
                    ? 'text-white' 
                    : 'text-white/60 hover:text-white'
                )}
              >
                Избранное
              </Link>
            )}
            {isAuthenticated() && (
              <Link
                href="/profile"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive('/profile')
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                )}
              >
                Профиль
              </Link>
            )}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                {/* Owner Dashboard Link */}
                {canAccessOwner && (
                  <Link 
                    href="/owner/dashboard"
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive('/owner/dashboard') 
                        ? 'text-white' 
                        : 'text-white/60 hover:text-white'
                    )}
                  >
                    {RU.owner.dashboard_title}
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className={cn(
                    'w-8 h-8 rounded-full',
                    'bg-gradient-to-r from-purple-500 to-blue-500',
                    'flex items-center justify-center',
                    'text-white text-sm font-medium'
                  )}
                  aria-label="Профиль"
                >
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {RU.auth.logout}
                  </button>
                </div>
              <div className="md:hidden flex items-center gap-2">
                <Link
                  href="/bookings"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
                  aria-label="Бронирования"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Link>
                <Link
                  href="/messages"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
                  aria-label="Сообщения"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
                  aria-label="Профиль"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <GlassButton variant="glass" size="sm">
                    {RU.auth.login}
                  </GlassButton>
                </Link>
                <Link href="/auth/register">
                  <GlassButton variant="primary" size="sm">
                    {RU.auth.register}
                  </GlassButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
