'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'
import { Search } from 'lucide-react'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import IconButton from '@/components/ui/IconButton'
import UserAvatar from '@/components/ui/UserAvatar'
import { useSearchOverlayStore } from '@/core/searchOverlay/searchOverlayStore'

/**
 * ТЗ-31: Desktop header — только логотип, поиск, колокольчик, аватар.
 * Без «Сдать жильё» и без «Сообщения» (есть в сайдбаре/нижнем меню).
 */
export function Header() {
  const { user, isAuthenticated } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)

  const authed = isAuthenticated()
  const openSearchOverlay = useSearchOverlayStore((s) => s.open)
  const displayName = user?.full_name ?? (user as any)?.name ?? undefined
  const displayAvatar = user?.avatar_url ?? null

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
        'h-16 min-h-16',
        'transition-[box-shadow,background] duration-200',
        scrolled && 'layout-header--scrolled'
      )}
      style={{
        paddingTop: headerTop ? `${headerTop}px` : 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="layout-header__inner-tz2 h-full flex items-center gap-4">
        {/* Слева: только логотип */}
        <div className="flex items-center shrink-0 gap-1 min-w-0">
          <Link
            href="/"
            className="logo-wrap inline-flex items-center justify-center h-10 shrink-0"
            aria-label="LOCUS — на главную"
          >
            <span className="logo-text text-[18px] font-bold tracking-tight">LOCUS</span>
          </Link>
        </div>
        {/* Центр пустой */}
        <div className="flex-1 min-w-0 hidden md:block" aria-hidden />

        {/* ТЗ-31: Справа только поиск, колокол, аватар (или Войти). Без дублей «Добавить»/«Сообщения». */}
        <div className="layout-header__right header-actions flex items-center justify-end shrink-0 gap-4 xl:ml-6">
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
          {/* TZ-34: выпадающее меню из аватара удалено. Аватар = переход в /profile */}
          {authed && (
            <Link
              href="/profile"
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              aria-label="Профиль"
            >
              <UserAvatar user={{ avatar_url: displayAvatar, full_name: displayName, username: user?.username }} size={40} asButton={false} />
            </Link>
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
