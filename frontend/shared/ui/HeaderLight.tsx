'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Logo } from './Logo'

const iconClass = 'w-5 h-5 flex-shrink-0 text-[#4AA3E2]'
function SearchIcon() { return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> }
function HeartIcon() { return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> }
function MessageIcon() { return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function UserIcon() { return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function CreditIcon() { return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function HelpIcon() { return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function LogoutIcon() { return <svg className="w-5 h-5 flex-shrink-0 text-[#E14C4C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }

function NavItem({ icon, label, onClick }: { icon: 'search' | 'heart' | 'message' | 'user' | 'credit' | 'help'; label: string; onClick: () => void }) {
  const Icon = icon === 'search' ? SearchIcon : icon === 'heart' ? HeartIcon : icon === 'message' ? MessageIcon : icon === 'user' ? UserIcon : icon === 'credit' ? CreditIcon : HelpIcon
  return (
    <li className="menu-item">
      <button type="button" onClick={onClick} className="burger-panel-btn menu-item-btn w-full min-h-[48px] py-3.5 text-[15px] font-medium text-[#1A1A1A] hover:bg-[rgba(123,74,226,0.1)] hover:text-[#7B4AE2] flex justify-end items-center gap-3 transition-colors [&>svg]:hover:text-[#7B4AE2] [&>svg]:w-5 [&>svg]:h-5 [&>svg]:opacity-60">
        <span>{label}</span>
        <Icon />
      </button>
    </li>
  )
}

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
    return () => { document.body.classList.remove('body-scroll-lock') }
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
                    ? 'text-[#7B4AE2]'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth — ТЗ: одна кнопка Войти/Зарегистрироваться; Выйти = Danger */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated() ? (
              <button
                onClick={logout}
                className={cn(
                  'px-3.5 py-2 text-[13px] font-medium rounded-xl',
                  'text-[#E14C4C] hover:bg-[rgba(225,76,76,0.08)]',
                  'transition-colors'
                )}
              >
                Выйти
              </button>
            ) : (
              <Link
                href="/auth/login"
                className={cn(
                  'px-4 py-2.5 text-[14px] font-semibold rounded-[14px]',
                  'bg-[#7B4AE2] text-white',
                  'hover:opacity-90 transition-opacity'
                )}
              >
                Войти / Зарегистрироваться
              </Link>
            )}
          </div>

          {/* Mobile Burger — ЖЁСТКОЕ ТЗ: 3 полоски, Primary, без круга, 24×24, справа */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={cn(
              'md:hidden inline-flex items-center justify-center relative z-[1000]',
              'min-w-[44px] min-h-[44px] w-11 h-11 p-0',
              'bg-transparent',
              'text-[#7B4AE2] hover:opacity-90 active:opacity-80',
              'transition-opacity'
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
      <div
        role="button"
        tabIndex={0}
        aria-label="Закрыть меню"
        className={cn('mobile-menu-overlay', isMenuOpen && 'open')}
        onClick={() => setIsMenuOpen(false)}
        onKeyDown={(e) => e.key === 'Enter' && setIsMenuOpen(false)}
      />
      <div ref={menuRef} className={cn('mobile-menu', isMenuOpen && 'open')}>
        <div className="flex flex-col h-full bg-[#FFFFFF]">
          <div className="shrink-0 px-5 pt-5 pb-2 border-b border-[#ECECEC]">
            <span className="text-[17px] font-semibold text-[#1A1A1A]">Меню</span>
          </div>
          <div className="menu flex-1 overflow-y-auto">
            {!isAuthenticated() ? (
              <>
                <button type="button" onClick={() => handleNavigate('/auth/login')} className="burger-panel-btn w-full min-h-[48px] h-12 py-3 px-4 rounded-[14px] text-[15px] font-semibold text-white bg-[#7B4AE2] hover:opacity-90 flex items-center justify-center transition-opacity">
                  Войти / Зарегистрироваться
                </button>
                <ul className="menu-list">
                  <NavItem icon="search" label="Поиск жилья" onClick={() => handleNavigate('/listings')} />
                  <NavItem icon="heart" label="Избранное" onClick={() => handleNavigate('/favorites')} />
                  <NavItem icon="message" label="Сообщения" onClick={() => handleNavigate('/messages')} />
                  <NavItem icon="credit" label="Тарифы" onClick={() => handleNavigate('/pricing')} />
                  <NavItem icon="help" label="Помощь / Блог" onClick={() => handleNavigate('/help')} />
                </ul>
              </>
            ) : (
              <ul className="menu-list">
                <NavItem icon="user" label="Профиль" onClick={() => handleNavigate('/profile')} />
                <NavItem icon="search" label="Поиск жилья" onClick={() => handleNavigate('/listings')} />
                <NavItem icon="heart" label="Избранное" onClick={() => handleNavigate('/favorites')} />
                <NavItem icon="message" label="Сообщения" onClick={() => handleNavigate('/messages')} />
                <NavItem icon="credit" label="Тарифы" onClick={() => handleNavigate('/pricing')} />
                <NavItem icon="help" label="Помощь / Блог" onClick={() => handleNavigate('/help')} />
                <li className="menu-item">
                  <button type="button" onClick={handleLogout} className="burger-panel-btn burger-panel-btn--logout menu-item-btn w-full min-h-[48px] py-3.5 text-[15px] font-medium text-[#E14C4C] hover:bg-[rgba(225,76,76,0.08)] flex justify-end items-center gap-3 transition-colors">
                    <span>Выйти</span>
                    <LogoutIcon />
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
