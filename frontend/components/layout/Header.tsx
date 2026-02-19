'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, HelpCircle, Mail, User, LayoutDashboard, FileText, MessageCircle, Wallet, Megaphone, Settings, LogOut, Tag } from 'lucide-react'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import IconButton from '@/components/ui/IconButton'
import UserAvatar from '@/components/ui/UserAvatar'
import { MobileMenu } from './MobileMenu'
import { useSearchOverlayStore } from '@/core/searchOverlay/searchOverlayStore'

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
  const { user, isAuthenticated, hasRole, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  const authed = isAuthenticated()
  const isAdmin = hasRole?.('admin') ?? false
  const isLandlord = Boolean(hasRole?.('landlord') || user?.role === 'landlord' || (user && (user as any).listingUsed > 0))
  const openSearchOverlay = useSearchOverlayStore((s) => s.open)
  const displayName = user?.full_name ?? (user as any)?.name ?? undefined
  const displayAvatar = user?.avatar_url ?? null

  useEffect(() => {
    if (!avatarOpen) return
    const close = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [avatarOpen])

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

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false)
    router.push(path)
  }

  const headerTop = isTelegram ? 48 : 0

  /* Режимы header по ТЗ: Desktop ≥1280 — всё; Tablet 768–1279 — menu, logo, search icon, notifications, avatar; Mobile <768 — menu, logo (центр), search icon, avatar */
  return (
    <header
      className={cn(
        'layout-header layout-header-tz13 layout-header-tz2 layout-header-overflow-fix sticky top-0 left-0 right-0 z-[var(--z-header)] w-full',
        'h-[56px] min-h-[56px]',
        'transition-[box-shadow,background] duration-200',
        scrolled && 'layout-header--scrolled'
      )}
      style={{
        paddingTop: headerTop ? `${headerTop}px` : 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* TZ-21: [бургер] LOCUS [поиск] [уведомления] [аватар]. Лого прижат к бургеру слева, центр пустой, аватар справа. */}
      <div className="layout-header__inner-tz2 h-full flex items-center gap-2">
        {/* Слева: бургер + логотип (mobile всегда, desktop без бургера) */}
        <div className="flex items-center shrink-0 gap-1 min-w-0">
          <div className="flex shrink-0 lg:hidden">
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
          <Link
            href="/"
            onClick={() => { handleLogoClick(); setAvatarOpen(false); }}
            className="logo-wrap inline-flex items-center justify-center h-10 shrink-0"
            aria-label="LOCUS — на главную"
          >
            <span className="logo-text text-[18px] font-bold tracking-tight">LOCUS</span>
          </Link>
        </div>
        {/* Центр пустой */}
        <div className="flex-1 min-w-0 hidden md:block" aria-hidden />

        {/* ТЗ-18: Справа — поиск, колокол, CTA «Сдать жильё», аватар (авторизован) или Войти (гость). Header чистый: без сообщений, бургера на ПК, дублей. */}
        <div className="layout-header__right header-actions flex items-center justify-end shrink-0 gap-2 sm:gap-3 xl:gap-3 xl:ml-6">
          <IconButton onClick={() => openSearchOverlay()} ariaLabel="Поиск" className="flex xl:hidden">
            <Search className="w-6 h-6" strokeWidth={1.8} />
          </IconButton>
          <form className="hidden xl:flex items-center flex-1 min-w-0 max-w-[200px]" onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim() ?? ''; openSearchOverlay(q); }}>
            <input type="search" name="q" placeholder="Поиск..." className="layout-header__search-input w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)]" aria-label="Поиск" />
          </form>
          {/* ТЗ-21: Колокол всегда. Гость — иконка; авторизован — NotificationsBell. */}
          {authed ? (
            <div className="flex shrink-0" aria-label="Уведомления">
              <NotificationsBell compactBadge />
            </div>
          ) : (
            <span className="flex w-9 h-9 items-center justify-center rounded-lg text-[var(--text-muted)]" aria-hidden>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6 6 6 0 00-6 6v3.159c0 .538-.214 1.055-.595 1.436L7 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
          )}
          {/* ТЗ-21: Сообщения в header только на desktop. На mobile — только в нижнем меню. */}
          {authed && (
            <Link href="/messages" className="hidden xl:flex w-9 h-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]" aria-label="Сообщения">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </Link>
          )}
          {/* ТЗ-21: CTA «Сдать жильё» — только desktop (sm+). */}
          <Link
            href={authed ? '/dashboard/listings/create' : `/auth/login?redirect=${encodeURIComponent('/dashboard/listings/create')}`}
            className="hidden sm:flex h-9 px-4 items-center justify-center rounded-xl text-sm font-medium shrink-0 bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95"
          >
            Сдать жильё
          </Link>
          {authed && (
            <>
              <div className="relative flex shrink-0" ref={avatarRef}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setAvatarOpen((v) => !v); }}
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                  aria-label="Меню"
                  aria-expanded={avatarOpen}
                >
                  <UserAvatar user={{ avatar_url: displayAvatar, full_name: displayName, username: user?.username }} size={40} asButton={false} />
                </button>
                {avatarOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 py-1 min-w-[200px] rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-lg z-[var(--z-dropdown)]"
                    role="menu"
                  >
                    <Link href="/profile" onClick={() => setAvatarOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)] rounded-t-[12px]" role="menuitem">Профиль</Link>
                    {isLandlord && (
                      <>
                        <Link href="/owner/dashboard?tab=listings" onClick={() => setAvatarOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]" role="menuitem">Мои объявления</Link>
                        <Link href="/owner/dashboard?tab=bookings" onClick={() => setAvatarOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]" role="menuitem">Бронирования</Link>
                      </>
                    )}
                    <Link href="/profile/settings" onClick={() => setAvatarOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]" role="menuitem">Настройки</Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setAvatarOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)] border-t border-[var(--border-main)]" role="menuitem">Админ панель</Link>
                    )}
                    <button type="button" onClick={() => { setAvatarOpen(false); logout(); router.push('/'); }} className="block w-full text-left px-4 py-3 text-[14px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] rounded-b-[12px]" role="menuitem">Выйти</button>
                  </div>
                )}
              </div>
            </>
          )}
          {!authed && (
            <Link href="/auth/login" className="hidden xl:flex layout-header__cta-btn h-9 px-4 items-center justify-center rounded-xl text-sm font-medium shrink-0">
              Войти
            </Link>
          )}
        </div>
      </div>

      {/* TZ-21: Боковое меню. Гость: поиск, помощь, контакты, войти. Авторизован: обзор, объявления, сообщения, избранное, финансы, продвижение, настройки, выйти. */}
      {!authed && (
        <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          <div className="mobile-menu-header-row flex items-center justify-end">
            <button type="button" onClick={() => setIsMenuOpen(false)} className="mobile-menu-close text-[var(--text-main)]" aria-label="Закрыть меню">
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="mobile-menu-separator" aria-hidden />
          <nav className="mobile-menu-nav menu" aria-label="Меню гостя">
            <ul className="menu-list">
              <NavItem icon={<Search size={22} strokeWidth={1.8} />} label="Поиск" onClick={() => handleNavigate('/listings')} />
              <NavItem icon={<Tag size={22} strokeWidth={1.8} />} label="Тарифы" onClick={() => handleNavigate('/pricing')} />
              <NavItem icon={<HelpCircle size={22} strokeWidth={1.8} />} label="Помощь" onClick={() => handleNavigate('/help')} />
              <NavItem icon={<Mail size={22} strokeWidth={1.8} />} label="Контакты" onClick={() => handleNavigate('/contacts')} />
              <NavItem icon={<User size={22} strokeWidth={1.8} />} label="Войти" onClick={() => handleNavigate('/auth/login')} />
            </ul>
          </nav>
        </MobileMenu>
      )}
      {authed && (
        <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          <div className="mobile-menu-header-row flex items-center justify-end">
            <button type="button" onClick={() => setIsMenuOpen(false)} className="mobile-menu-close text-[var(--text-main)]" aria-label="Закрыть меню">
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="mobile-menu-separator" aria-hidden />
          <nav className="mobile-menu-nav menu" aria-label="Кабинет">
            <ul className="menu-list">
              <NavItem icon={<LayoutDashboard size={22} strokeWidth={1.8} />} label="Кабинет" onClick={() => handleNavigate('/dashboard')} />
              {isLandlord && <NavItem icon={<FileText size={22} strokeWidth={1.8} />} label="Мои объявления" onClick={() => handleNavigate('/dashboard/listings')} />}
              <NavItem icon={<MessageCircle size={22} strokeWidth={1.8} />} label="Сообщения" onClick={() => handleNavigate('/messages')} />
              {isLandlord && <NavItem icon={<Wallet size={22} strokeWidth={1.8} />} label="Финансы" onClick={() => handleNavigate('/dashboard/billing')} />}
              {isLandlord && <NavItem icon={<Megaphone size={22} strokeWidth={1.8} />} label="Продвижение" onClick={() => handleNavigate('/dashboard/promo')} />}
              <NavItem icon={<Settings size={22} strokeWidth={1.8} />} label="Настройки" onClick={() => handleNavigate('/dashboard/profile')} />
              <NavItem icon={<LogOut size={22} strokeWidth={1.8} />} label="Выйти" onClick={() => { setIsMenuOpen(false); logout(); router.push('/'); }} />
            </ul>
          </nav>
        </MobileMenu>
      )}
    </header>
  )
}
