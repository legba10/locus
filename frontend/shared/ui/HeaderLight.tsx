'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, Heart, MessageCircle, CreditCard, HelpCircle, LogOut, ArrowLeft, PlusCircle, Shield } from 'lucide-react'

const menuIconWrap = 'flex shrink-0 [&>svg]:w-[22px] [&>svg]:h-[22px] [&>svg]:stroke-[1.8]'

function NavItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <li className="menu-item">
      <button type="button" onClick={onClick} className="menu-item-btn w-full text-[15px] flex items-center transition-colors">
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
  const authed = isAuthenticated()
  const limit = user?.listingLimit ?? 1
  const used = user?.listingUsed ?? 0
  const canCreateListing = authed
  const createHref = canCreateListing && used >= limit ? '/pricing?reason=limit' : '/owner/dashboard?tab=add'
  const isAdmin = Boolean((user as any)?.isAdmin) || user?.role === 'admin'

  const isActive = (path: string) => pathname === path
  const desktopNav = useMemo(() => ([
    { label: 'Поиск', href: '/listings' },
    { label: 'Избранное', href: '/favorites' },
    { label: 'Сообщения', href: '/messages' },
    { label: 'Профиль', href: '/profile' },
    { label: 'Тарифы', href: '/pricing' },
    ...(isAdmin ? [{ label: 'Админ', href: '/admin' }] : []),
  ]), [isAdmin])

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
      'sticky top-0 z-40',
      'relative',
      'bg-white/95 backdrop-blur-md',
      'border-b border-gray-100/80',
      'shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
    )}>
      <div className="header mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="logo locus-home-link flex items-center shrink-0">
            <img src="/logo-locus-icon.png" alt="LOCUS" className="header-logo-img" />
            <span className="header-logo-text text-[#1A1A1A]">LOCUS</span>
          </Link>

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
            {canCreateListing && (
              <Link
                href={createHref}
                className={cn(
                  'px-4 py-2.5 text-[14px] font-semibold rounded-[14px]',
                  'bg-violet-50 text-violet-700 border border-violet-100',
                  'hover:bg-violet-100 transition-colors'
                )}
              >
                Разместить объявление
              </Link>
            )}
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
            className="burger md:hidden relative z-50 w-8 h-8 p-0 bg-transparent border-0 cursor-pointer flex items-center justify-center"
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
        <div className="drawer-inner">
          <div className="mobile-menu-header-row">
            <button
              type="button"
              onClick={() => handleNavigate('/profile')}
              className="mobile-menu-profile-block"
            >
              <div className="mobile-menu-profile-inner">
                <div className="mobile-menu-profile-avatar" aria-hidden>
                  {isAuthenticated() && user?.full_name
                    ? (user.full_name.trim().charAt(0) || 'П').toUpperCase()
                    : 'Г'}
                </div>
                <div className="mobile-menu-profile-text">
                  <div className="mobile-menu-profile-name">
                    {isAuthenticated() && user?.full_name ? user.full_name : 'Гость'}
                  </div>
                  <div className="mobile-menu-profile-subtitle">Перейти в профиль</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="mobile-menu-close"
              aria-label="Закрыть меню"
            >
              <ArrowLeft size={22} strokeWidth={1.8} />
            </button>
          </div>
          <div className="mobile-menu-separator" aria-hidden />
          {!isAuthenticated() && (
            <div className="mobile-menu-cta-wrap">
              <button type="button" onClick={() => handleNavigate('/auth/login')} className="menu-cta">
                Войти / Зарегистрироваться
              </button>
            </div>
          )}
          <nav className="mobile-menu-nav menu">
            <ul className="menu-list">
              <NavItem icon={<Search size={22} strokeWidth={1.8} />} label="Поиск жилья" onClick={() => handleNavigate('/listings')} />
              {canCreateListing && (
                <NavItem
                  icon={<PlusCircle size={22} strokeWidth={1.8} />}
                  label="Разместить объявление"
                  onClick={() => handleNavigate(createHref)}
                />
              )}
              <NavItem icon={<Heart size={22} strokeWidth={1.8} />} label="Избранное" onClick={() => handleNavigate('/favorites')} />
              <NavItem icon={<MessageCircle size={22} strokeWidth={1.8} />} label="Сообщения" onClick={() => handleNavigate('/messages')} />
              <NavItem icon={<CreditCard size={22} strokeWidth={1.8} />} label="Тарифы" onClick={() => handleNavigate('/pricing')} />
              {isAdmin && (
                <NavItem icon={<Shield size={22} strokeWidth={1.8} />} label="Админ" onClick={() => handleNavigate('/admin')} />
              )}
              <NavItem icon={<HelpCircle size={22} strokeWidth={1.8} />} label="Помощь" onClick={() => handleNavigate('/help')} />
            </ul>
          </nav>
          {isAuthenticated() && (
            <div className="mobile-menu-logout-wrap">
              <ul className="menu-list">
                <li className="menu-item">
                  <button type="button" onClick={handleLogout} className="menu-item-btn menu-item-btn--logout">
                    <span className={cn('menu-icon-wrap', menuIconWrap)}><LogOut size={22} strokeWidth={1.8} /></span>
                    <span>Выйти</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
