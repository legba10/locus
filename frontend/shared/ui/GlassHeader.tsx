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
  const isAdmin = user?.role === 'admin' || (user?.roles?.includes('admin') ?? false)
  const isHost = user?.role === 'host' || (user?.roles?.includes('host') ?? false)
  const tariff = user?.profile?.tariff ?? 'free'
  const isPaidTariff = tariff === 'landlord_basic' || tariff === 'landlord_pro'
  const canAccessOwner = isAdmin || (isHost && isPaidTariff)

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
                  <div className={cn(
                    'w-8 h-8 rounded-full',
                    'bg-gradient-to-r from-purple-500 to-blue-500',
                    'flex items-center justify-center',
                    'text-white text-sm font-medium'
                  )}>
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {RU.auth.logout}
                  </button>
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
