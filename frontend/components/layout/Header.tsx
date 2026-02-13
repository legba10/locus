'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef, useContext } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, Heart, MessageCircle, CreditCard, HelpCircle, LogOut, PlusCircle, Shield } from 'lucide-react'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { ThemeContext } from '@/providers/ThemeProvider'
import { MobileMenu } from './MobileMenu'

const menuIconWrap = 'flex shrink-0 [&>svg]:w-[22px] [&>svg]:h-[22px] [&>svg]:stroke-[1.8]'

/** TZ-5: пункт меню — full width, текст слева, иконка справа */
function NavItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <li className="menu-item">
      <button
        type="button"
        onClick={onClick}
        className="menu-item-btn w-full text-[15px] flex items-center justify-between gap-3 min-h-[44px] px-3 rounded-[var(--radius-md)] transition-colors"
        style={{ fontSize: 'var(--font-size-md, 16px)' }}
      >
        <span>{label}</span>
        <span className={cn('menu-icon-wrap', menuIconWrap)}>{icon}</span>
      </button>
    </li>
  )
}

/**
 * ТЗ-8: Единый Header для всего сайта.
 * Высота: mobile 64px, desktop 72px. Safe-area. Grid: [burger][logo][bell].
 * Логотип по теме (logo-dark / logo-light). Бургер 24px, колокольчик 22px, badge 8px.
 */
export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme } = useContext(ThemeContext)
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)

  const logoIconSrc = resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'
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
      (Boolean((user as any)?.city) ? 1 : 0)) /
      5 *
      100
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsTelegram(Boolean((window as any).Telegram?.WebApp))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path: string) => pathname === path
  const desktopNav = useMemo(
    () => [
      { label: 'Поиск', href: '/listings' },
      { label: 'Избранное', href: '/favorites' },
      { label: 'Сообщения', href: '/messages' },
      { label: 'Профиль', href: '/profile' },
      { label: 'Тарифы', href: '/pricing' },
      ...(isAdmin ? [{ label: 'Админ', href: '/admin' }] : []),
    ],
    [isAdmin]
  )

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
    router.push('/')
  }

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false)
    router.push(path)
  }

  const headerTop = isTelegram ? 48 : 0

  return (
    <header
      className={cn(
        'layout-header sticky left-0 right-0 z-[var(--z-header)]',
        'transition-[background,border-color] duration-200',
        scrolled && 'layout-header--scrolled'
      )}
      style={{
        paddingTop: `max(env(safe-area-inset-top), ${headerTop}px)`,
      }}
    >
      <div className="layout-header__inner">
        <div className="layout-header__grid">
          {/* Burger — ТЗ-8: 24px, отступ 16px */}
          <div className="layout-header__cell layout-header__burger-cell md:hidden">
            <button
              type="button"
              className="layout-header__burger"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          {/* Logo */}
          <div className="layout-header__cell layout-header__logo-cell">
            <Link href="/" className="layout-header__logo" aria-label="LOCUS — на главную">
              <img
                src={logoIconSrc}
                alt=""
                className="layout-header__logo-img"
                width={28}
                height={28}
              />
              <span className="layout-header__logo-text">LOCUS</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 h-full">
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-[14px] font-medium transition-colors flex items-center h-full',
                  isActive(item.href.split('?')[0])
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: theme, bell, CTA, auth */}
          <div className="layout-header__cell layout-header__actions-cell">
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              {authed && (
                <div className="layout-header__bell-wrap">
                  <NotificationsBell compactBadge />
                </div>
              )}
              {canCreateListing && (
                <Link
                  href={createHref}
                  className={cn(
                    'px-4 py-2.5 text-[14px] font-semibold rounded-[14px]',
                    'bg-[var(--button-secondary-bg)] text-[var(--accent)] border border-[var(--border)]',
                    'hover:opacity-90 transition-opacity'
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
                    'text-[var(--danger)] hover:opacity-80 transition-colors'
                  )}
                >
                  Выйти
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className={cn(
                    'px-4 py-2.5 text-[14px] font-semibold rounded-[14px]',
                    'bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-90 transition-opacity'
                  )}
                >
                  Войти / Зарегистрироваться
                </Link>
              )}
            </div>

            {/* Mobile: bell only */}
            <div className="md:hidden flex items-center">
              {authed && (
                <div className="layout-header__bell-wrap">
                  <NotificationsBell compactBadge />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <div className="mobile-menu-header-row">
          <button
            type="button"
            onClick={() => handleNavigate('/profile')}
            className="mobile-menu-profile-block"
          >
            <div className="mobile-menu-profile-inner">
              <div className="mobile-menu-profile-avatar relative overflow-hidden" aria-hidden>
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt={displayName || 'Аватар'}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
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
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="mobile-menu-separator" aria-hidden />
        {!isAuthenticated() && (
          <div className="mobile-menu-cta-wrap">
            <button
              type="button"
              onClick={() => handleNavigate('/auth/login')}
              className="btn btn--primary btn--md w-full"
            >
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
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn--danger btn--md w-full"
              aria-label="Выйти"
            >
              <LogOut size={20} strokeWidth={1.8} aria-hidden />
              <span>Выйти</span>
            </button>
          </div>
        )}
      </MobileMenu>
    </header>
  )
}
