'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, Heart, MessageCircle, CreditCard, HelpCircle, LogOut, User } from 'lucide-react'

const menuIconWrap = 'flex shrink-0 text-[#7C8CA5] [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.8]'

function NavItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <li className="menu-item">
      <button type="button" onClick={onClick} className="menu-item-btn w-full h-12 rounded-[12px] px-[14px] text-[15px] font-medium text-[#1A1A1A] hover:bg-[var(--locus-accent-light)] hover:text-[var(--locus-primary)] flex items-center gap-3 transition-colors [&_.menu-icon-wrap]:hover:text-[var(--locus-primary)]">
        <span className={cn('menu-icon-wrap', menuIconWrap)}>{icon}</span>
        <span>{label}</span>
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
      <div className={cn('header mx-auto max-w-6xl px-4', !isMenuOpen && 'relative z-[1000]')}>
        <div className="flex items-center justify-between h-14">
          <div className="logo flex items-center gap-2 shrink-0">
            <img src="/logo-locus-icon.png" alt="" className="header-logo-img" />
            <span className="header-logo-text font-semibold text-[#1A1A1A]">LOCUS</span>
          </div>

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

          <button
            type="button"
            className={cn('burger md:hidden relative z-[1000] w-8 h-8 p-0 bg-transparent border-0 cursor-pointer flex items-center justify-center', isMenuOpen && 'open')}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            <span />
            <span />
            <span />
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
      <div ref={menuRef} className={cn('drawer mobile-menu', isMenuOpen && 'open')}>
        <div className="drawer-inner flex flex-col h-full">
          <nav className="menu flex-1 overflow-y-auto">
            {!isAuthenticated() ? (
              <>
                <button type="button" onClick={() => handleNavigate('/auth/login')} className="menu-cta w-full h-[52px] rounded-[14px] text-[15px] font-semibold text-white flex items-center justify-center transition-opacity">
                  Войти / Зарегистрироваться
                </button>
                <ul className="menu-list">
                  <NavItem icon={<Search size={20} strokeWidth={1.8} />} label="Поиск жилья" onClick={() => handleNavigate('/listings')} />
                  <NavItem icon={<Heart size={20} strokeWidth={1.8} />} label="Избранное" onClick={() => handleNavigate('/favorites')} />
                  <NavItem icon={<MessageCircle size={20} strokeWidth={1.8} />} label="Сообщения" onClick={() => handleNavigate('/messages')} />
                  <NavItem icon={<CreditCard size={20} strokeWidth={1.8} />} label="Тарифы" onClick={() => handleNavigate('/pricing')} />
                  <NavItem icon={<HelpCircle size={20} strokeWidth={1.8} />} label="Помощь" onClick={() => handleNavigate('/help')} />
                </ul>
              </>
            ) : (
              <>
                <ul className="menu-list">
                  <NavItem icon={<Search size={20} strokeWidth={1.8} />} label="Поиск жилья" onClick={() => handleNavigate('/listings')} />
                  <NavItem icon={<Heart size={20} strokeWidth={1.8} />} label="Избранное" onClick={() => handleNavigate('/favorites')} />
                  <NavItem icon={<MessageCircle size={20} strokeWidth={1.8} />} label="Сообщения" onClick={() => handleNavigate('/messages')} />
                  <NavItem icon={<User size={20} strokeWidth={1.8} />} label="Профиль" onClick={() => handleNavigate('/profile')} />
                  <NavItem icon={<CreditCard size={20} strokeWidth={1.8} />} label="Тарифы" onClick={() => handleNavigate('/pricing')} />
                  <NavItem icon={<HelpCircle size={20} strokeWidth={1.8} />} label="Помощь" onClick={() => handleNavigate('/help')} />
                </ul>
                <li className="menu-item">
                  <button type="button" onClick={handleLogout} className="menu-item-btn menu-item-btn--logout w-full h-12 rounded-[12px] px-[14px] text-[15px] font-medium text-[#E14C4C] hover:bg-[rgba(225,76,76,0.08)] flex items-center gap-3 transition-colors">
                    <span className={cn('menu-icon-wrap', menuIconWrap)}><LogOut size={20} strokeWidth={1.8} className="text-[#E14C4C]" /></span>
                    <span>Выйти</span>
                  </button>
                </li>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
