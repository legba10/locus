'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useContext } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { ThemeContext } from '@/providers/ThemeProvider'
import { Search, Heart, MessageCircle, CreditCard, HelpCircle, LogOut, Shield, User, LayoutList, Settings, Plus, Moon, Sun } from 'lucide-react'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import ThemeToggle from '@/components/ui/ThemeToggle'
import IconButton from '@/components/ui/IconButton'
import UserAvatar from '@/components/ui/UserAvatar'
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
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const authed = isAuthenticated()
  const themeContext = useContext(ThemeContext)
  const isDark = themeContext?.resolvedTheme === 'dark'

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

  /* Режимы header по ТЗ: Desktop ≥1280 — всё; Tablet 768–1279 — menu, logo, search icon, notifications, avatar; Mobile <768 — menu, logo (центр), search icon, avatar */
  return (
    <header
      className={cn(
        'layout-header layout-header-tz13 layout-header-tz2 layout-header-overflow-fix sticky left-0 right-0 z-[var(--z-header)] w-full',
        'h-16 xl:h-[72px] min-h-16 xl:min-h-[72px]',
        'transition-[box-shadow,background] duration-200',
        scrolled && 'layout-header--scrolled'
      )}
      style={{
        paddingTop: headerTop ? `${headerTop}px` : 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="layout-header__inner-tz2 h-full">
        {/* Слева: бургер только < 1280px (xl:hidden). Desktop — без бургера. */}
        <div className="flex items-center shrink-0 xl:hidden">
          <IconButton
            onClick={() => setIsMenuOpen((prev) => !prev)}
            ariaLabel={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block w-5 h-0.5 bg-current rounded-full" />
              <span className="block w-5 h-0.5 bg-current rounded-full" />
              <span className="block w-5 h-0.5 bg-current rounded-full" />
            </span>
          </IconButton>
        </div>

        {/* Центр/лого: на mobile лого по центру (flex-1 justify-center), на md+ лого слева */}
        <div className="flex-1 flex justify-center min-w-0 md:flex-initial md:justify-start">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="logo-wrap"
            aria-label="LOCUS — на главную"
          >
            <span className="logo-text">LOCUS</span>
          </Link>
        </div>

        {/* Справа: по ТЗ — Desktop: search input, favorites, messages, notifications, theme, avatar. Tablet: search icon, notifications, avatar. Mobile: search icon, avatar. */}
        <div className="layout-header__right header-actions flex items-center shrink-0 gap-3 xl:gap-3 xl:ml-6">
          {/* Поиск: на mobile/tablet — только иконка (fullscreen через переход на /search). На desktop — поле ввода. */}
          <IconButton as="a" href="/search" ariaLabel="Поиск" className="flex xl:hidden">
            <Search className="w-5 h-5" strokeWidth={1.8} />
          </IconButton>
          <form action="/search" method="get" className="hidden xl:flex items-center flex-1 min-w-0 max-w-[200px]" onSubmit={(e) => { const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value; if (q?.trim()) { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q.trim())}`); } }}>
            <input type="search" name="q" placeholder="Поиск..." className="layout-header__search-input w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)]" aria-label="Поиск" />
          </form>
          <IconButton as="a" href="/favorites" ariaLabel="Избранное" className="hidden xl:flex">
            <Heart className="w-5 h-5" strokeWidth={1.8} />
          </IconButton>
          <IconButton as="a" href="/messages" ariaLabel="Сообщения" className="hidden xl:flex">
            <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
          </IconButton>
          {authed && <div className="hidden md:flex"><NotificationsBell compactBadge /></div>}
          <div className="hidden xl:flex"><ThemeToggle /></div>
          {authed ? (
            <div className="relative shrink-0" ref={profileRef}>
              <UserAvatar
                user={{ avatar_url: displayAvatar, full_name: displayName, username: user?.username }}
                onClick={() => setProfileOpen((o) => !o)}
                ariaExpanded={profileOpen}
                size={44}
              />
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
                  <button type="button" onClick={() => { themeContext?.toggle(); setProfileOpen(false); }} className="profile-dropdown-tz7__item w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[var(--text-main)] text-left" role="menuitem">
                    {isDark ? <Sun className={iconSm} /> : <Moon className={iconSm} />}
                    <span>Тема</span>
                  </button>
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
            <Link href={createHref} className="layout-header__cta-btn h-9 px-4 flex items-center justify-center rounded-xl text-sm font-medium shrink-0 hidden xl:flex" aria-label="Разместить объявление">
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
