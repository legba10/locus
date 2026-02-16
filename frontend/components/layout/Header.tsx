'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef, useContext } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, Heart, MessageCircle, CreditCard, HelpCircle, LogOut, Shield, User, LayoutList, Settings, Plus } from 'lucide-react'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { MobileMenu } from './MobileMenu'

const menuIconWrap = 'flex shrink-0 [&>svg]:w-[22px] [&>svg]:h-[22px] [&>svg]:stroke-[1.8]'
const iconSm = 'w-[18px] h-[18px] shrink-0'

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
/** ТЗ-14: один логотип /logo.svg + надпись LOCUS, без смены по теме, стабильно везде */
export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const authed = isAuthenticated()

  useEffect(() => {
    if (!profileOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [profileOpen])

  const handleLogoClick = () => setIsMenuOpen(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsTelegram(Boolean((window as any).Telegram?.WebApp))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (authed && user === undefined) return null

  const limit = user?.listingLimit ?? 1
  const used = user?.listingUsed ?? 0
  const canCreateListing = authed
  const createHref = canCreateListing && used >= limit ? '/pricing?reason=limit' : '/owner/dashboard?tab=add'
  const isAdmin = Boolean((user as any)?.isAdmin) || user?.role === 'admin'
  const displayName = user?.full_name ?? user?.username ?? null
  const displayAvatar = user?.avatar_url ?? null

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
        'layout-header layout-header-tz13 layout-header-tz2 sticky left-0 right-0 z-[var(--z-header)] w-full',
        'h-16 md:h-[72px] min-h-16 md:min-h-[72px]',
        'transition-[box-shadow,background] duration-200',
        scrolled && 'layout-header--scrolled'
      )}
      style={{
        paddingTop: headerTop ? `${headerTop}px` : 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="layout-header__inner-tz2 mx-auto max-w-7xl h-full flex items-center justify-between">
        {/* ТЗ-13: Слева — бургер, логотип. Одна точка входа в профиль — аватар справа. */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] transition md:hidden shrink-0 text-[var(--text-main)]"
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
          <Link
            href="/"
            onClick={handleLogoClick}
            className="logo-wrap shrink-0"
            aria-label="LOCUS — на главную"
          >
            <Image
              src="/logo.svg"
              alt="LOCUS"
              width={36}
              height={36}
              priority
              className="logo-img-tz14 object-contain shrink-0 w-8 h-8 md:w-9 md:h-9"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="logo-text">LOCUS</span>
          </Link>
        </div>

        {/* ТЗ-2 + ТЗ-17: справа [messages] [favorites] [bell] [theme] [avatar] [разместить]; gap 12px; мобила — уведомления, тема, профиль. */}
        <div className="layout-header__right flex items-center gap-3 shrink-0">
          <Link href="/messages" className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition hidden md:flex shrink-0" aria-label="Сообщения">
            <MessageCircle size={22} strokeWidth={1.8} />
          </Link>
          <Link href="/favorites" className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition hidden md:flex shrink-0" aria-label="Избранное">
            <Heart size={22} strokeWidth={1.8} />
          </Link>
          {authed && (
            <div className="layout-header__icon-wrap shrink-0">
              <NotificationsBell compactBadge />
            </div>
          )}
          <ThemeToggle />
          {authed ? (
            <div className="relative shrink-0" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="layout-header__avatar flex shrink-0 p-0 border-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label="Профиль"
                aria-expanded={profileOpen}
              >
                {/* ТЗ-3: ровный круглый аватар — контейнер 36×36, overflow hidden, object-fit cover, без белых краёв */}
                <span
                  className="header-avatar-wrapper relative inline-block w-9 h-9 max-w-9 max-h-9 rounded-full overflow-hidden flex items-center justify-center bg-transparent flex-shrink-0"
                  style={{ minWidth: 36, minHeight: 36 }}
                >
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt={displayName || 'Аватар'}
                      fill
                      sizes="36px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-main)] text-sm font-medium">
                      {(displayName?.trim().charAt(0) || 'Г').toUpperCase()}
                    </span>
                  )}
                </span>
              </button>
              {profileOpen && (
                <div
                  className="profile-dropdown-tz13 profile-dropdown-tz17 absolute right-0 top-full mt-2 w-[260px] rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] py-2 shadow-xl z-[var(--z-dropdown)]"
                  role="menu"
                >
                  <Link href="/profile" className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)]" onClick={() => setProfileOpen(false)} role="menuitem">
                    <User className={iconSm} /> Профиль
                  </Link>
                  <Link href="/owner/dashboard" className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)]" onClick={() => setProfileOpen(false)} role="menuitem">
                    <LayoutList className={iconSm} /> Мои объявления
                  </Link>
                  <Link href="/messages" className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)]" onClick={() => setProfileOpen(false)} role="menuitem">
                    <MessageCircle className={iconSm} /> Сообщения
                  </Link>
                  <Link href="/favorites" className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)]" onClick={() => setProfileOpen(false)} role="menuitem">
                    <Heart className={iconSm} /> Избранное
                  </Link>
                  <Link href="/pricing" className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)]" onClick={() => setProfileOpen(false)} role="menuitem">
                    <CreditCard className={iconSm} /> Тарифы
                  </Link>
                  {canCreateListing && (
                    <Link href={createHref} className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)] md:hidden" onClick={() => setProfileOpen(false)} role="menuitem">
                      <Plus className={iconSm} /> Разместить объявление
                    </Link>
                  )}
                  <Link href="/profile" className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)] md:hidden" onClick={() => setProfileOpen(false)} role="menuitem">
                    <Settings className={iconSm} /> Настройки
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="profile-dropdown-tz7__item flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)]" onClick={() => setProfileOpen(false)} role="menuitem">
                      <Shield className={iconSm} /> Админ
                    </Link>
                  )}
                  <div className="border-t border-[var(--border)] my-1" />
                  <button type="button" onClick={() => { setProfileOpen(false); handleLogout(); }} className="profile-dropdown-tz7__item profile-dropdown-logout-tz10 w-full flex items-center gap-3 px-4 py-2.5 text-[14px]" role="menuitem">
                    <LogOut className={iconSm} /> Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="layout-header__cta-btn h-9 px-4 flex items-center justify-center rounded-xl text-sm font-medium shrink-0"
            >
              Войти
            </Link>
          )}
          {canCreateListing && (
            <Link href={createHref} className="layout-header__cta-btn h-9 px-4 flex items-center justify-center rounded-xl text-sm font-medium shrink-0 hidden md:flex" aria-label="Разместить объявление">
              Разместить
            </Link>
          )}
        </div>
      </div>

      {/* ТЗ-13: Бургер — только навигация. Без профиля; вход в профиль один — аватар справа. */}
      <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <div className="mobile-menu-header-row flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="mobile-menu-close text-[var(--text-main)]"
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
        <nav className="mobile-menu-nav menu" aria-label="Навигация">
          <ul className="menu-list">
            <NavItem icon={<Search size={22} strokeWidth={1.8} />} label="Поиск жилья" onClick={() => handleNavigate('/listings')} />
            <NavItem icon={<Heart size={22} strokeWidth={1.8} />} label="Избранное" onClick={() => handleNavigate('/favorites')} />
            <NavItem icon={<MessageCircle size={22} strokeWidth={1.8} />} label="Сообщения" onClick={() => handleNavigate('/messages')} />
            <NavItem icon={<CreditCard size={22} strokeWidth={1.8} />} label="Тарифы" onClick={() => handleNavigate('/pricing')} />
            {isAdmin && (
              <NavItem icon={<Shield size={22} strokeWidth={1.8} />} label="Админ" onClick={() => handleNavigate('/admin')} />
            )}
            <NavItem icon={<HelpCircle size={22} strokeWidth={1.8} />} label="Помощь" onClick={() => handleNavigate('/help')} />
          </ul>
        </nav>
      </MobileMenu>
    </header>
  )
}
