'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { Home, Search, MessageCircle, User, PlusSquare } from 'lucide-react'

/** TZ-22: Нижнее меню — всегда 5 пунктов: Главная, Поиск, Добавить, Сообщения, Профиль. Единая основа, без дублей. */
export function BottomNavGlobal() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  const isAdmin = pathname?.startsWith('/admin')
  const isListingDetail = pathname?.match(/^\/listings\/[^/]+$/)
  const isChatRoute = pathname?.startsWith('/messages') || pathname?.startsWith('/chat')
  if (isAdmin) return null
  if (isListingDetail) return null
  if (isChatRoute) return null

  const base = pathname?.replace(/\/$/, '') || ''
  const isHome = base === '' || base === '/'
  const isSearch = (base === '/listings' || base.startsWith('/listings')) && !isListingDetail
  const isMessages = base === '/messages' || base.startsWith('/messages')
  const isAdd = pathname?.startsWith('/create-listing') || pathname?.startsWith('/profile/listings/create')
  const isDashboard = base === '/profile' || base.startsWith('/profile') || base.startsWith('/auth')

  const authed = isAuthenticated()
  const messagesHref = authed ? '/messages' : '/auth/login?redirect=/messages'
  const profileHref = authed ? '/profile' : '/auth/login?redirect=/profile'
  const addHref = authed ? '/profile/listings/create' : '/auth/login?redirect=' + encodeURIComponent('/profile/listings/create')

  /* TZ-47: активный таб — color #8b5cf6, без glow/background/box-shadow */
  const linkCls = (active: boolean) =>
    cn(
      'flex flex-col items-center gap-0.5 py-2 px-2 rounded-[12px] text-[10px] font-medium transition-colors min-w-[52px]',
      active ? 'text-[#8b5cf6] bg-transparent !shadow-none' : 'text-[var(--text-muted)]'
    )

  /* TZ-50/TZ-51: bottom-nav — светлая тема: blur(16px)+rgba(255,255,255,0.92), без glow; dark — в CSS */
  return (
    <nav
      className={cn(
        'bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-bottom-bar)] flex items-center justify-around px-1',
        'min-h-[72px] pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]'
      )}
      style={{ height: 'max(72px, calc(72px + env(safe-area-inset-bottom, 0px)))' }}
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
      <Link href={addHref} className={linkCls(isAdd)} aria-current={isAdd ? 'page' : undefined}>
        <PlusSquare className="w-5 h-5" strokeWidth={1.8} />
        <span>Добавить</span>
      </Link>
      <Link href={messagesHref} className={linkCls(isMessages)} aria-current={isMessages ? 'page' : undefined}>
        <MessageCircle className="w-5 h-5" strokeWidth={1.8} />
        <span>Сообщения</span>
      </Link>
      <Link href={profileHref} className={linkCls(isDashboard)} aria-current={isDashboard ? 'page' : undefined}>
        <User className="w-5 h-5" strokeWidth={1.8} />
        <span>{authed ? 'Профиль' : 'Профиль'}</span>
      </Link>
    </nav>
  )
}
