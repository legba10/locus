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
  const touchStartXRef = useRef<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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
    document.body.classList.add('body-scroll-lock')
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX
    }
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null) return
      const endX = e.changedTouches[0].clientX
      const deltaX = endX - touchStartXRef.current
      if (deltaX > 50) setIsMenuOpen(false)
      touchStartXRef.current = null
    }
    const el = menuRef.current
    if (el) {
      el.addEventListener('touchstart', handleTouchStart, { passive: true })
      el.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
    return () => {
      document.body.classList.remove('body-scroll-lock')
      if (el) {
        el.removeEventListener('touchstart', handleTouchStart)
        el.removeEventListener('touchend', handleTouchEnd)
      }
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

          {/* Mobile Burger — ТЗ №4: только иконка ≡, фиолетовые полоски, без круга/фона */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={cn(
              'md:hidden inline-flex items-center justify-center relative z-[1000]',
              'min-w-[44px] min-h-[44px] w-11 h-11 p-0',
              'bg-transparent text-violet-600',
              'hover:text-violet-700 active:text-violet-800',
              'transition-colors'
            )}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </div>
      <div className={cn('mobile-menu-overlay', isMenuOpen && 'open')} aria-hidden="true" />
      <div ref={menuRef} className={cn('mobile-menu', isMenuOpen && 'open')}>
        {/* Единый список: menu-item стиль, одинаковая высота/шрифт/отступы. ТЗ FINAL */}
        {!isAuthenticated() ? (
          <div className="mobile-menu__content px-4 pt-20 pb-4">
            <button type="button" onClick={() => handleNavigate('/auth/login')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Войти
            </button>
            <button type="button" onClick={() => handleNavigate('/listings')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Поиск жилья
            </button>
            <button type="button" onClick={() => handleNavigate('/favorites')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Избранное
            </button>
            <button type="button" onClick={() => handleNavigate('/messages')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Сообщения
            </button>
            <button type="button" onClick={() => handleNavigate('/pricing')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Тарифы
            </button>
            <button type="button" onClick={() => handleNavigate('/help')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Помощь / Блог
            </button>
          </div>
        ) : (
          <div className="mobile-menu__content px-4 pt-20 pb-4">
            <button type="button" onClick={() => handleNavigate('/profile')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Профиль
            </button>
            <button type="button" onClick={() => handleNavigate('/listings')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Поиск жилья
            </button>
            <button type="button" onClick={() => handleNavigate('/favorites')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Избранное
            </button>
            <button type="button" onClick={() => handleNavigate('/messages')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Сообщения
            </button>
            <button type="button" onClick={() => handleNavigate('/pricing')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Тарифы
            </button>
            <button type="button" onClick={() => handleNavigate('/help')} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-gray-900 text-left border-b border-gray-100/80 hover:bg-violet-50/60 flex items-center">
              Помощь / Блог
            </button>
            <button type="button" onClick={handleLogout} className="mobile-menu-item w-full h-11 px-4 text-[14px] font-medium text-red-600 text-left border-b border-gray-100/80 hover:bg-red-50/60 flex items-center">
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
