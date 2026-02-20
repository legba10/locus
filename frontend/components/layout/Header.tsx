'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search } from 'lucide-react'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import IconButton from '@/components/ui/IconButton'
import UserAvatar from '@/components/ui/UserAvatar'
import { useSearchOverlayStore } from '@/core/searchOverlay/searchOverlayStore'

/**
 * ТЗ-27: Единый Header без бургера. Только: логотип LOCUS, поиск, колокол, аватар.
 */
export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, hasRole, logout } = useAuthStore()
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

  const headerTop = isTelegram ? 48 : 0

  /* ТЗ-27: Header без бургера — логотип, поиск, колокол, аватар. */
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
      <div className="layout-header__inner-tz2 h-full flex items-center gap-2">
        {/* Слева: только логотип */}
        <div className="flex items-center shrink-0 gap-1 min-w-0">
          <Link
            href="/"
            onClick={() => setAvatarOpen(false)}
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
            href={authed ? '/profile/listings/create' : `/auth/login?redirect=${encodeURIComponent('/profile/listings/create')}`}
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
                        <Link href="/profile/listings" onClick={() => setAvatarOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]" role="menuitem">Мои объявления</Link>
                        <Link href="/bookings" onClick={() => setAvatarOpen(false)} className="block px-4 py-3 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]" role="menuitem">Бронирования</Link>
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
    </header>
  )
}
