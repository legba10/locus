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
  const [dragOffset, setDragOffset] = useState(0)

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
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
          onClick={() => {
            setMobileOpen(false)
            setDragOffset(0)
          }}
        >
          <div
            className={cn(
              'w-full rounded-t-3xl bg-white',
              'shadow-[0_-12px_40px_rgba(0,0,0,0.2)]',
              'pb-8'
            )}
            style={{
              transform: `translateY(${dragOffset}px)`,
              transition: dragStart ? 'none' : 'transform 220ms ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 pt-3 pb-2"
              onTouchStart={(e) => setDragStart(e.touches[0].clientY)}
              onTouchMove={(e) => {
                if (dragStart === null) return
                const delta = e.touches[0].clientY - dragStart
                if (delta > 0) setDragOffset(Math.min(delta, 240))
              }}
              onTouchEnd={() => {
                if (dragOffset > 100) {
                  setMobileOpen(false)
                  setDragOffset(0)
                } else {
                  setDragOffset(0)
                }
                setDragStart(null)
              }}
            >
              <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
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
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Поиск
                </Link>
                <Link
                  href="/favorites"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Избранное
                </Link>
                <Link
                  href="/messages"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Сообщения
                </Link>
                <Link
                  href="/profile"
                  className="block rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Профиль
                </Link>
                {isAuthenticated() && (
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
                )}
                {!isAuthenticated() && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      href="/auth/login"
                      className="rounded-xl px-4 py-3 text-center text-[14px] font-medium text-gray-900 hover:bg-gray-50 border border-gray-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      Войти
                    </Link>
                    <Link
                      href="/auth/register"
                      className="rounded-xl px-4 py-3 text-center text-[14px] font-medium text-white bg-violet-600 hover:bg-violet-500"
                      onClick={() => setMobileOpen(false)}
                    >
                      Регистрация
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
