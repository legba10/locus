'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef, useContext } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, Heart, MessageCircle, CreditCard, HelpCircle, LogOut, PlusCircle, Shield, User } from 'lucide-react'
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
  const [logoError, setLogoError] = useState(false)

  const isDarkTheme = resolvedTheme === 'dark'
  const logoIconSrc = logoError
    ? '/favicon.svg'
    : (isDarkTheme ? '/logo-dark.svg' : '/logo-light.svg')
  const authed = isAuthenticated()

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsTelegram(Boolean((window as any).Telegram?.WebApp))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const desktopNavIcons = useMemo(
    () => [
      { label: 'Поиск', href: '/listings', icon: Search },
      { label: 'Избранное', href: '/favorites', icon: Heart },
      { label: 'Сообщения', href: '/messages', icon: MessageCircle },
      { label: 'Профиль', href: authed ? '/profile' : '/auth/login', icon: User },
    ],
    [authed]
  )

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

  const isActive = (path: string) => pathname === path

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
        'layout-header sticky left-0 right-0 z-[var(--z-header)] min-h-14 h-14 w-full border-b border-white/5 bg-background/80 backdrop-blur',
        'transition-[background,border-color] duration-200',
        scrolled && 'layout-header--scrolled'
      )}
      style={{
        paddingTop: headerTop ? `${headerTop}px` : 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        {/* LEFT: burger + logo — ТЗ-1 единый блок, выравнивание по центру */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition md:hidden shrink-0"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMenuOpen}
          >
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block w-5 h-0.5 bg-current rounded-full" />
              <span className="block w-5 h-0.5 bg-current rounded-full" />
              <span className="block w-5 h-0.5 bg-current rounded-full" />
            </span>
          </button>
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="LOCUS — на главную">
            <Image
              src={logoIconSrc}
              alt="LOCUS"
              width={28}
              height={28}
              className="h-7 w-auto"
              onError={() => setLogoError(true)}
            />
            <span className="font-bold text-base tracking-tight text-[var(--text-main)] hidden sm:inline">LOCUS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5 ml-2" aria-label="Основная навигация">
            {desktopNavIcons.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href.split('?')[0])
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                    active && 'text-[var(--text-main)]'
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.8} aria-hidden />
                </Link>
              )
            })}
          </nav>
        </div>

        {/* RIGHT: theme toggle + avatar / login — ТЗ-1 один контейнер, ровно для guest и auth */}
        <div className="flex items-center gap-2 shrink-0">
          {authed && (
            <div className="flex items-center justify-center w-10 h-10">
              <NotificationsBell compactBadge />
            </div>
          )}
          <ThemeToggle />
          {authed ? (
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-main)] shrink-0"
              aria-label="Профиль"
            >
              {displayAvatar ? (
                <Image src={displayAvatar} alt={displayName || 'Аватар'} width={36} height={36} className="w-9 h-9 object-cover" />
              ) : (
                <span className="text-sm font-medium">{(displayName?.trim().charAt(0) || 'Г').toUpperCase()}</span>
              )}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="layout-header__cta-btn h-9 px-4 flex items-center justify-center rounded-xl text-sm font-medium shrink-0"
            >
              Войти
            </Link>
          )}
          {canCreateListing && (
            <Link href={createHref} className="layout-header__cta-btn h-9 px-4 flex items-center justify-center rounded-xl text-sm font-medium shrink-0 hidden md:flex">
              Разместить
            </Link>
          )}
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
