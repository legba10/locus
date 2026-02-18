'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { Home, Search, MessageCircle, User, PlusSquare } from 'lucide-react'

/** ТЗ-21: Нижнее меню (mobile) — единственный центр навигации: Главная, Поиск, Добавить, Сообщения, Профиль. Без избранного и дублей. */
export function BottomNavGlobal() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, user } = useAuthStore()

  const isOwner = pathname?.startsWith('/owner/dashboard')
  const isAdmin = pathname?.startsWith('/admin')
  if (isOwner || isAdmin) return null

  const base = pathname?.replace(/\/$/, '') || ''
  const isHome = base === '' || base === '/'
  const isSearch = base === '/listings' || base.startsWith('/listings')
  const isMessages = base === '/messages' || base.startsWith('/messages')
  const isProfile = base === '/profile' || base.startsWith('/profile') || base.startsWith('/auth')
  const isAdd = pathname?.startsWith('/owner/dashboard') && searchParams?.get('tab') === 'add'

  const authed = isAuthenticated()
  const limit = user?.listingLimit ?? 1
  const used = (user as any)?.listingUsed ?? 0
  const addHref = authed ? (used >= limit ? '/pricing?reason=limit' : '/owner/dashboard?tab=add') : '/auth/login?redirect=' + encodeURIComponent('/owner/dashboard?tab=add')
  const messagesHref = authed ? '/messages' : '/auth/login?redirect=/messages'
  const profileHref = authed ? '/profile' : '/auth/login'
  const profileLabel = authed ? 'Профиль' : 'Войти'

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-bottom-bar)] flex items-center justify-around py-2 px-1 bg-[var(--bg-card)]/95 backdrop-blur border-t border-[var(--border-main)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Основная навигация"
    >
      <Link
        href="/"
        className={cn(
          'flex flex-col items-center gap-0.5 py-2 px-2 rounded-[12px] text-[10px] font-medium transition-colors min-w-[52px]',
          isHome ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        )}
        aria-current={isHome ? 'page' : undefined}
      >
        <Home className="w-5 h-5" strokeWidth={1.8} />
        <span>Главная</span>
      </Link>
      <Link
        href="/listings"
        className={cn(
          'flex flex-col items-center gap-0.5 py-2 px-2 rounded-[12px] text-[10px] font-medium transition-colors min-w-[52px]',
          isSearch ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        )}
        aria-current={isSearch ? 'page' : undefined}
      >
        <Search className="w-5 h-5" strokeWidth={1.8} />
        <span>Поиск</span>
      </Link>
      <Link href={addHref} className={cn('flex flex-col items-center gap-0.5 py-2 px-2 rounded-[12px] text-[10px] font-medium transition-colors min-w-[52px]', isAdd ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')} aria-current={isAdd ? 'page' : undefined}>
        <PlusSquare className="w-5 h-5" strokeWidth={1.8} />
        <span>Добавить</span>
      </Link>
      <Link href={messagesHref} className={cn('flex flex-col items-center gap-0.5 py-2 px-2 rounded-[12px] text-[10px] font-medium transition-colors min-w-[52px]', isMessages ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')} aria-current={isMessages ? 'page' : undefined}>
        <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
        <span>Сообщения</span>
      </Link>
      <Link
        href={profileHref}
        className={cn(
          'flex flex-col items-center gap-0.5 py-2 px-2 rounded-[12px] text-[10px] font-medium transition-colors min-w-[52px]',
          isProfile ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        )}
        aria-current={isProfile ? 'page' : undefined}
      >
        <User className="w-5 h-5" strokeWidth={1.8} />
        <span>{profileLabel}</span>
      </Link>
    </nav>
  )
}
