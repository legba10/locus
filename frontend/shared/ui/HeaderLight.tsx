'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [isBrowser, setIsBrowser] = useState(false)

  const isActive = (path: string) => pathname === path
  const desktopNav = useMemo(() => ([
    { label: 'Поиск', href: '/listings' },
    { label: 'Избранное', href: '/favorites' },
    { label: 'Сообщения', href: '/messages' },
    { label: 'Профиль', href: '/profile' },
    { label: 'Тарифы', href: '/pricing' },
  ]), [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setDragOffset(0)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  useEffect(() => {
    if (!isMounted || typeof document === 'undefined') return
    const currentScroll = window.scrollY
    setScrollY(currentScroll)
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `-${currentScroll}px`
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, currentScroll)
    }
  }, [isMounted])

  useEffect(() => {
    if (!mobileOpen) return
    setDragOffset(0)
  }, [pathname])

  const handleOpenMenu = () => {
    setIsMounted(true)
    requestAnimationFrame(() => setMobileOpen(true))
  }

  const closeMenu = () => {
    setMobileOpen(false)
    setDragStart(null)
    setDragOffset(0)
    setTimeout(() => {
      setIsMounted(false)
    }, 260)
  }

  const handleNavigate = (path: string) => {
    closeMenu()
    setTimeout(() => {
      router.push(path)
    }, 280)
  }

  const handleLogout = () => {
    closeMenu()
    setTimeout(async () => {
      if (isAuthenticated()) {
        await logout()
      }
    }, 280)
  }

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

          {/* Mobile Burger Button (top right) */}
          <button
            type="button"
            onClick={handleOpenMenu}
            className={cn(
              'md:hidden inline-flex items-center justify-center',
              'w-10 h-10 rounded-full',
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
      {isBrowser && isMounted &&
        createPortal(
          <>
            <div
              className="mobile-menu-overlay"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <div
              className={cn('mobile-menu', mobileOpen && 'open')}
              style={{
                transform:
                  dragStart && typeof window !== 'undefined'
                    ? `translate3d(0, ${Math.min(100, (dragOffset / window.innerHeight) * 100)}%, 0)`
                    : undefined,
              }}
              onTouchMove={(e) => {
                if (dragStart === null) return
                const delta = e.touches[0].clientY - dragStart
                if (delta > 0) setDragOffset(delta)
              }}
              onTouchEnd={() => {
                if (dragOffset > 120) {
                  closeMenu()
                } else {
                  setDragOffset(0)
                }
                setDragStart(null)
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="mobile-menu-content"
                onTouchStart={(e) => setDragStart(e.touches[0].clientY)}
              >
                <div className="mx-auto h-1.5 w-12 rounded-full bg-violet-200 mb-4" />
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#1C1F26]">Меню</h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    aria-label="Закрыть"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/listings')}
                    className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  >
                    Поиск жилья
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/favorites')}
                    className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  >
                    Избранное
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/messages')}
                    className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  >
                    Сообщения
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/profile')}
                    className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  >
                    Профиль
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/pricing')}
                    className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  >
                    Тарифы
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50 min-h-[48px]"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  )
}
