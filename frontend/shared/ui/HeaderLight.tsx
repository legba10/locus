'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef } from 'react'
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
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const lastScrollYRef = useRef(0)
  const touchStartYRef = useRef<number | null>(null)

  const isActive = (path: string) => pathname === path
  const desktopNav = useMemo(() => ([
    { label: 'Поиск', href: '/listings' },
    { label: 'Избранное', href: '/favorites' },
    { label: 'Сообщения', href: '/messages' },
    { label: 'Профиль', href: '/profile' },
    { label: 'Тарифы', href: '/pricing' },
  ]), [])

  void pathname

  useEffect(() => {
    if (!isMenuOpen) return
    lastScrollYRef.current = window.scrollY
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        setIsMenuOpen(false)
      }
    }
    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0].clientY
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartYRef.current === null) return
      const deltaY = event.touches[0].clientY - touchStartYRef.current
      if (deltaY > 12) {
        setIsMenuOpen(false)
        touchStartYRef.current = null
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
    router.push('/')
  }

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false)
    router.push(path)
  }

  return (
    <header className={cn(
      'sticky top-0 z-50',
      'relative',
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
            {desktopNav.map((item) => (
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
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated() ? (
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
            ) : (
              <>
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

          {/* Mobile Burger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={cn(
              'md:hidden inline-flex items-center justify-center',
              'w-12 h-12 rounded-full',
              'bg-violet-600 text-white',
              'shadow-[0_8px_24px_rgba(124,58,237,0.35)]',
              'hover:bg-violet-500 active:bg-violet-700',
              'transition-all'
            )}
            aria-label="Открыть меню"
          >
            ☰
          </button>
        </div>
      </div>
      <div className={cn('mobile-menu-overlay', isMenuOpen && 'open')} aria-hidden="true" />
      <div className={cn('mobile-menu', isMenuOpen && 'open')}>
        {!isAuthenticated() ? (
          <div className="mobile-menu__content px-4 py-4 space-y-2">
            <button
              type="button"
              onClick={() => handleNavigate('/auth/login')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-semibold text-white bg-violet-600 hover:bg-violet-500 text-center"
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/auth/register')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-semibold text-violet-600 border border-violet-200 hover:bg-violet-50 text-center"
            >
              Регистрация
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/listings')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Поиск жилья
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/favorites')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Избранное
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/messages')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Сообщения
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/profile')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Профиль
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/pricing')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Тарифы
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/help')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Помощь / Блог
            </button>
          </div>
        ) : (
          <div className="mobile-menu__content px-4 py-4 space-y-2">
            <div className="pb-2 border-b border-gray-100">
              <p className="text-[14px] font-semibold text-[#1C1F26]">
                {('name' in (user || {}) && (user as { name?: string }).name) || user?.email || 'Профиль'}
              </p>
              {user?.email && (
                <p className="text-[12px] text-[#6B7280]">{user.email}</p>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 text-[13px] font-medium text-red-600 hover:text-red-700"
              >
                Выйти
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('/listings')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Поиск жилья
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/favorites')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Избранное
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/messages')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Сообщения
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/profile')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Профиль
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/pricing')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Тарифы
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/help')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50 text-left"
            >
              Помощь / Блог
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
