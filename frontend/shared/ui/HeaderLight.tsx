'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
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
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [sheetTranslate, setSheetTranslate] = useState(100)
  const [isClosing, setIsClosing] = useState(false)

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
    if (typeof document === 'undefined') return
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      setSheetTranslate(100)
      requestAnimationFrame(() => setSheetTranslate(0))
    } else {
      document.body.style.overflow = ''
      setSheetTranslate(100)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    handleCloseMenu()
  }, [pathname])

  const handleOpenMenu = () => {
    setIsClosing(false)
    setMobileOpen(true)
  }

  const handleCloseMenu = () => {
    if (isClosing) return
    setIsClosing(true)
    setSheetTranslate(100)
    setTimeout(() => {
      setMobileOpen(false)
      setIsClosing(false)
      setDragStart(null)
    }, 240)
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
      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
          onClick={handleCloseMenu}
        >
          <div
            className={cn(
              'fixed bottom-0 left-0 w-screen',
              'max-h-[90dvh] overflow-y-auto overscroll-contain',
              'rounded-t-[16px] bg-white',
              'shadow-[0_-12px_40px_rgba(0,0,0,0.2)]',
              'pb-8'
            )}
            style={{
              zIndex: 9999,
              transform: `translateY(${sheetTranslate}%)`,
              transition: dragStart ? 'none' : 'transform 240ms ease-out',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
              paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 pt-3 pb-2"
              onTouchStart={(e) => setDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => {
                if (dragStart === null) return
                const delta = e.touches[0].clientY - dragStart
                if (delta > 0) {
                  const percent = Math.min(100, (delta / window.innerHeight) * 100)
                  setSheetTranslate(percent)
                }
              }}
              onTouchEnd={() => {
                if (sheetTranslate > 30) {
                  handleCloseMenu()
                } else {
                  setSheetTranslate(0)
                }
                setDragStart(null)
              }}
            >
              <div className="mx-auto h-1.5 w-12 rounded-full bg-violet-200" />
            </div>

            <div className="px-6 pt-2">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#1C1F26]">Меню</h3>
                  <p className="text-[13px] text-[#6B7280]">Быстрый доступ к основным разделам</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    setDragOffset(0)
                  }}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Закрыть"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <Link
                  href="/listings"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  onClick={handleCloseMenu}
                >
                  Поиск жилья
                </Link>
                <Link
                  href="/favorites"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  onClick={handleCloseMenu}
                >
                  Избранное
                </Link>
                <Link
                  href="/messages"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  onClick={handleCloseMenu}
                >
                  Сообщения
                </Link>
                <Link
                  href="/profile"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  onClick={handleCloseMenu}
                >
                  Профиль
                </Link>
                <Link
                  href="/pricing"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  onClick={handleCloseMenu}
                >
                  Тарифы
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    if (isAuthenticated()) {
                      await logout()
                    }
                    handleCloseMenu()
                  }}
                  className="w-full text-left rounded-xl px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50 min-h-[48px]"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
