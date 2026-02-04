'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
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
  const { isAuthenticated, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => pathname === path
  const desktopNav = useMemo(() => ([
    { label: 'Поиск', href: '/listings' },
    { label: 'Избранное', href: '/favorites' },
    { label: 'Сообщения', href: '/messages' },
    { label: 'Профиль', href: '/profile' },
    { label: 'Тарифы', href: '/pricing' },
  ]), [])

  void pathname

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
            onClick={() => setIsOpen(true)}
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
      {isOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu__header px-4 py-3 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[14px] font-medium text-gray-700"
            >
              ← Назад
            </button>
            {!isAuthenticated() && (
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-4 py-2 text-[14px] font-semibold rounded-xl',
                    'bg-violet-600 text-white',
                    'hover:bg-violet-700',
                    'transition-all duration-200',
                    'shadow-md shadow-violet-500/25'
                  )}
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          <nav className="mobile-menu__content px-4 py-4 space-y-2">
            <Link
              href="/listings"
              onClick={() => setIsOpen(false)}
              className="block w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50"
            >
              Поиск жилья
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsOpen(false)}
              className="block w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50"
            >
              Избранное
            </Link>
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="block w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50"
            >
              Сообщения
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50"
            >
              Профиль
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="block w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-gray-900 hover:bg-gray-50"
            >
              Тарифы
            </Link>
          </nav>

          <div className="px-4 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 text-left"
            >
              Выйти
            </button>
            <div className="h-6" />
          </div>
        </div>
      )}
    </header>
  )
}
