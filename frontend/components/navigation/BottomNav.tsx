'use client'

/** TZ-3: нижняя навигация — glass, ровная кнопка добавить, safe-area */

import Link from 'next/link'
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'

export default function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  const isAdmin = pathname?.startsWith('/admin')
  const isListingDetail = pathname?.match(/^\/listing\/[^/]+$/) || pathname?.match(/^\/listings\/[^/]+$/)
  const isChatRoute = pathname?.startsWith('/messages') || pathname?.startsWith('/chat')
  if (isAdmin) return null
  if (isListingDetail) return null
  if (isChatRoute) return null

  const base = pathname?.replace(/\/$/, '') || ''
  const isHome = base === '' || base === '/'
  const isSearch = base === '/listings' || base === '/search' || pathname?.startsWith('/listings') || pathname?.startsWith('/search')
  const isMessages = base === '/messages' || pathname?.startsWith('/messages')
  const isAdd = pathname?.startsWith('/create-listing') || pathname?.startsWith('/profile/listings/create')
  const isProfile = base === '/profile' || pathname?.startsWith('/profile') || pathname?.startsWith('/auth')

  const authed = isAuthenticated()
  const messagesHref = authed ? '/messages' : '/auth/login?redirect=/messages'
  const profileHref = authed ? '/profile' : '/auth/login?redirect=/profile'
  const addHref = authed ? '/profile/listings/create' : '/auth/login?redirect=' + encodeURIComponent('/profile/listings/create')

  return (
    <nav className="bottomNav" aria-label="Основная навигация">
      <Link href="/" className={isHome ? 'active' : ''}>
        <Home size={22} />
        <span>Главная</span>
      </Link>

      <Link href="/listings" className={isSearch ? 'active' : ''}>
        <Search size={22} />
        <span>Поиск</span>
      </Link>

      <Link href={addHref} className="addButton">
        <Plus size={26} />
      </Link>

      <Link href={messagesHref} className={isMessages ? 'active' : ''}>
        <MessageCircle size={22} />
        <span>Сообщения</span>
      </Link>

      <Link href={profileHref} className={isProfile ? 'active' : ''}>
        <User size={22} />
        <span>Профиль</span>
      </Link>
    </nav>
  )
}
