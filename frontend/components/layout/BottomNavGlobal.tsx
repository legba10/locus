'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { Home, Search, MessageCircle, User, PlusSquare, Heart } from 'lucide-react'

/** ТЗ-21: Нижнее меню (mobile). Арендатор: Главная, Поиск, Сообщения, Избранное, Профиль. Арендодатель: Главная, Поиск, Добавить, Сообщения, Профиль. Без тарифов, доходов, дашборда. */
export function BottomNavGlobal() {
  const pathname = usePathname()
  const { isAuthenticated, user, hasRole } = useAuthStore()

  const isAdmin = pathname?.startsWith('/admin')
  if (isAdmin) return null

  const base = pathname?.replace(/\/$/, '') || ''
  const isListingDetail = pathname?.match(/^\/listings\/[^/]+$/)
  const isHome = base === '' || base === '/'
  const isSearch = (base === '/listings' || base.startsWith('/listings')) && !isListingDetail
  const isMessages = base === '/messages' || base.startsWith('/messages')
  const isFavorites = base === '/favorites'
  const isProfile = base === '/profile' || base.startsWith('/profile') || base.startsWith('/auth')
  const isAdd = pathname?.startsWith('/create-listing') || pathname?.startsWith('/dashboard/listings/create')

  const authed = isAuthenticated()
  const isLandlord = Boolean(hasRole?.('landlord') || user?.role === 'landlord' || (user && (user as any).listingUsed > 0))
  const messagesHref = authed ? '/messages' : '/auth/login?redirect=/messages'
  const profileHref = authed ? '/profile' : '/auth/login'
  const addHref = authed ? '/dashboard/listings/create' : '/auth/login?redirect=' + encodeURIComponent('/dashboard/listings/create')

  const linkCls = (active: boolean) =>
    cn('flex flex-col items-center gap-0.5 py-2 px-2 rounded-[12px] text-[10px] font-medium transition-colors min-w-[52px]', active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')

  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-bottom-bar)] flex items-center justify-around py-2 px-1 bg-[var(--bg-card)]/95 backdrop-blur border-t border-[var(--border-main)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        isListingDetail && 'opacity-85'
      )}
      aria-label="Основная навигация"
      data-listing-detail={isListingDetail ? 'true' : undefined}
    >
      <Link href="/" className={linkCls(isHome)} aria-current={isHome ? 'page' : undefined}>
        <Home className="w-5 h-5" strokeWidth={1.8} />
        <span>Главная</span>
      </Link>
      <Link href="/listings" className={linkCls(isSearch)} aria-current={isSearch ? 'page' : undefined}>
        <Search className="w-5 h-5" strokeWidth={1.8} />
        <span>Поиск</span>
      </Link>
      {authed && isLandlord ? (
        <Link href={addHref} className={linkCls(isAdd)} aria-current={isAdd ? 'page' : undefined}>
          <PlusSquare className="w-5 h-5" strokeWidth={1.8} />
          <span>Добавить</span>
        </Link>
      ) : authed ? (
        <Link href={messagesHref} className={linkCls(isMessages)} aria-current={isMessages ? 'page' : undefined}>
          <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
          <span>Сообщения</span>
        </Link>
      ) : (
        <Link href={messagesHref} className={linkCls(false)}>
          <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
          <span>Сообщения</span>
        </Link>
      )}
      {authed && isLandlord ? (
        <Link href={messagesHref} className={linkCls(isMessages)} aria-current={isMessages ? 'page' : undefined}>
          <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
          <span>Сообщения</span>
        </Link>
      ) : authed ? (
        <Link href="/favorites" className={linkCls(isFavorites)} aria-current={isFavorites ? 'page' : undefined}>
          <Heart className="w-5 h-5" strokeWidth={1.8} />
          <span>Избранное</span>
        </Link>
      ) : (
        <Link href="/auth/login?redirect=/favorites" className={linkCls(false)}>
          <Heart className="w-5 h-5" strokeWidth={1.8} />
          <span>Избранное</span>
        </Link>
      )}
      <Link href={profileHref} className={linkCls(isProfile)} aria-current={isProfile ? 'page' : undefined}>
        <User className="w-5 h-5" strokeWidth={1.8} />
        <span>{authed ? 'Профиль' : 'Войти'}</span>
      </Link>
    </nav>
  )
}
