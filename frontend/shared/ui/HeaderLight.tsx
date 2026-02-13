'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef, useContext } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, Heart, MessageCircle, CreditCard, HelpCircle, LogOut, ArrowLeft, PlusCircle, Shield } from 'lucide-react'
import { NotificationsBell } from './NotificationsBell'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { ThemeContext } from '@/providers/ThemeProvider'

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
  const { resolvedTheme } = useContext(ThemeContext)
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const logoIconSrc = resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'
  const menuRef = useRef<HTMLDivElement>(null)
  const authed = isAuthenticated()
  if (authed && user === undefined) return null
  const limit = user?.listingLimit ?? 1
  const used = user?.listingUsed ?? 0
  const canCreateListing = authed
  const createHref = canCreateListing && used >= limit ? '/pricing?reason=limit' : '/owner/dashboard?tab=add'
  const isAdmin = Boolean((user as any)?.isAdmin) || user?.role === 'admin'
  const displayName = user?.full_name ?? user?.username ?? null
  const displayAvatar = user?.avatar_url ?? null
  const profileCompletion = Math.round(
    ((Boolean(user?.full_name || user?.username) ? 1 : 0) +
      (Boolean(user?.email) ? 1 : 0) +
      (Boolean(user?.phone) ? 1 : 0) +
      (Boolean(user?.avatar_url) ? 1 : 0) +
      (Boolean((user as any)?.city) ? 1 : 0)) / 5 * 100
  )

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
      'sticky top-0 left-0 right-0 z-header',
      'shadow-sm'
    )}>
      <div className="header container">
        <div className="flex items-center justify-between h-[64px]">
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              className="burger relative z-50"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <Link href="/" className="logo locus-home-link flex items-center shrink-0 md:mr-0">
            <img src={logoIconSrc} alt="LOCUS" className="header-logo-img" width={30} height={30} />
            <span className="header-logo-text">LOCUS</span>
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
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth — ТЗ: одна кнопка Войти/Зарегистрироваться; Выйти = Danger */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {authed && <NotificationsBell />}
            {canCreateListing && (
              <Link
                href={createHref}
                className={cn(
                  'px-4 py-2.5 text-[14px] font-semibold rounded-xl',
                  'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
                  'hover:opacity-95 transition-opacity'
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
                  'text-[var(--danger)] hover:opacity-80',
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
                  'bg-[var(--accent)] text-[var(--button-primary-text)]',
                  'hover:opacity-90 transition-opacity'
                )}
              >
                Войти / Зарегистрироваться
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            {authed && <NotificationsBell />}
            {!authed && <div className="w-10 h-10 mr-3" aria-hidden />}
          </div>
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
                <div className="mobile-menu-profile-avatar relative overflow-hidden" aria-hidden>
                  {displayAvatar ? (
                    <Image src={displayAvatar} alt={displayName || 'Аватар'} fill className="object-cover" sizes="48px" />
                  ) : (
                    <span>{(displayName?.trim().charAt(0) || 'Г').toUpperCase()}</span>
                  )}
                </div>
                <div className="mobile-menu-profile-text">
                  <div className="mobile-menu-profile-name">
                    {isAuthenticated() && displayName ? displayName : 'Гость'}
                  </div>
                  <div className="mobile-menu-profile-subtitle">Перейти в профиль</div>
                  {isAuthenticated() && (
                    <div className="mt-1 text-[12px] text-[var(--text-secondary)]">
                      Профиль заполнен на {profileCompletion}%
                    </div>
                  )}
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
              <button type="button" onClick={() => handleNavigate('/auth/login')} className="btn btn--primary btn--md w-full">
                Войти / Зарегистрироваться
              </button>
            </div>
          )}
          <div className="md:hidden flex items-center justify-start px-1 pb-3">
            <ThemeToggle />
          </div>
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
