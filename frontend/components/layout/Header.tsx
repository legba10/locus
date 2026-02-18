'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search, HelpCircle, CreditCard, Mail, User } from 'lucide-react'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import IconButton from '@/components/ui/IconButton'
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
  const { user, isAuthenticated } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)

  const authed = isAuthenticated()
  const openSearchOverlay = useSearchOverlayStore((s) => s.open)

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
        'h-16 min-h-16',
        'transition-[box-shadow,background] duration-200',
        scrolled && 'layout-header--scrolled'
      )}
      style={{
        paddingTop: headerTop ? `${headerTop}px` : 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="layout-header__inner-tz2 h-full">
        {/* ТЗ-1: Бургер только для гостя. Авторизованный — всё через нижнее меню и профиль. */}
        {!authed && (
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
        )}

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

        {/* ТЗ-14: Авторизованный — только логотип, поиск, колокольчик. Сообщения/профиль/добавить — только в нижнем меню и sidebar. */}
        <div className="layout-header__right header-actions flex items-center shrink-0 gap-2 sm:gap-3 xl:gap-3 xl:ml-6">
          <IconButton onClick={() => openSearchOverlay()} ariaLabel="Поиск" className="flex xl:hidden">
            <Search className="w-6 h-6" strokeWidth={1.8} />
          </IconButton>
          <form className="hidden xl:flex items-center flex-1 min-w-0 max-w-[200px]" onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim() ?? ''; openSearchOverlay(q); }}>
            <input type="search" name="q" placeholder="Поиск..." className="layout-header__search-input w-full h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)]" aria-label="Поиск" />
          </form>
          {authed && (
            <div className="flex shrink-0" aria-label="Уведомления">
              <NotificationsBell compactBadge />
            </div>
          )}
          {!authed && (
            <Link href="/auth/login" className="layout-header__cta-btn h-9 px-4 flex items-center justify-center rounded-xl text-sm font-medium shrink-0">
              Войти
            </Link>
          )}
        </div>
      </div>

      {/* ТЗ-2: Бургер только для гостя. Содержимое: поиск жилья, тарифы, помощь, контакты, войти. */}
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
              <NavItem icon={<Search size={22} strokeWidth={1.8} />} label="Поиск жилья" onClick={() => handleNavigate('/listings')} />
              <NavItem icon={<CreditCard size={22} strokeWidth={1.8} />} label="Тарифы" onClick={() => handleNavigate('/pricing')} />
              <NavItem icon={<HelpCircle size={22} strokeWidth={1.8} />} label="Помощь" onClick={() => handleNavigate('/help')} />
              <NavItem icon={<Mail size={22} strokeWidth={1.8} />} label="Контакты" onClick={() => handleNavigate('/contacts')} />
              <NavItem icon={<User size={22} strokeWidth={1.8} />} label="Войти" onClick={() => handleNavigate('/auth/login')} />
            </ul>
          </nav>
        </MobileMenu>
      )}
    </header>
  )
}
