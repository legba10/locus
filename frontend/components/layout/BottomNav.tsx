'use client'

/** TZ-53/TZ-70: Нижняя навигация — Apple-grade liquid glass, без glow. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react'

type NavIcon = 'home' | 'search' | 'plus' | 'chat' | 'user'

/** TZ-70: иконки 22px, stroke 1.8 — размер в CSS .nav-item svg */
function NavIcon({ name }: { name: NavIcon }) {
  const stroke = 1.8
  switch (name) {
    case 'home':
      return <Home strokeWidth={stroke} aria-hidden />
    case 'search':
      return <Search strokeWidth={stroke} aria-hidden />
    case 'plus':
      return <Plus strokeWidth={stroke} aria-hidden />
    case 'chat':
      return <MessageCircle strokeWidth={stroke} aria-hidden />
    case 'user':
      return <User strokeWidth={stroke} aria-hidden />
    default:
      return null
  }
}

interface NavItemProps {
  icon: NavIcon
  label: string
  href: string
  active: boolean
  isAdd?: boolean
}

function NavItem({ icon, label, href, active, isAdd }: NavItemProps) {
  const content = (
    <>
      <span className="nav-item__icon">
        <NavIcon name={icon} />
      </span>
      <span className="nav-item__label">{label}</span>
    </>
  )

  const itemCls = cn(
    'nav-item',
    active && 'active',
    isAdd && 'add'
  )

  if (isAdd) {
    return (
      <Link
        href={href}
        className={itemCls}
        aria-current={active ? 'page' : undefined}
        aria-label={label}
      >
        <span className="nav-item__add-btn">
          <span className="nav-item__icon">
            <NavIcon name={icon} />
          </span>
        </span>
        <span className="nav-item__label">{label}</span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={itemCls}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
    >
      {content}
    </Link>
  )
}

const SCROLL_THRESHOLD = 24

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  const isAdmin = pathname?.startsWith('/admin')
  const isListingDetail = pathname?.match(/^\/listing\/[^/]+$/) || pathname?.match(/^\/listings\/[^/]+$/)
  const isChatRoute = pathname?.startsWith('/messages') || pathname?.startsWith('/chat')
  if (isAdmin) return null
  if (isListingDetail) return null
  if (isChatRoute) return null

  const base = pathname?.replace(/\/$/, '') || ''
  const isHome = base === '' || base === '/'
  const isSearch = (base === '/listings' || pathname?.startsWith('/listings')) && !isListingDetail
  const isMessages = base === '/messages' || pathname?.startsWith('/messages')
  const isAdd = pathname?.startsWith('/create-listing') || pathname?.startsWith('/profile/listings/create')
  const isProfile = base === '/profile' || pathname?.startsWith('/profile') || pathname?.startsWith('/auth')

  const authed = isAuthenticated()
  const messagesHref = authed ? '/messages' : '/auth/login?redirect=/messages'
  const profileHref = authed ? '/profile' : '/auth/login?redirect=/profile'
  const addHref = authed ? '/profile/listings/create' : '/auth/login?redirect=' + encodeURIComponent('/profile/listings/create')

  useEffect(() => {
    const onScroll = () => {
      const y = typeof window !== 'undefined' ? window.scrollY : 0
      if (y > SCROLL_THRESHOLD) setScrolled(true)
      else setScrolled(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn('bottom-nav', scrolled && 'scrolled')}
      aria-label="Основная навигация"
    >
      <NavItem icon="home" label="Главная" href="/" active={isHome} />
      <NavItem icon="search" label="Поиск" href="/listings" active={isSearch} />
      <NavItem icon="plus" label="Добавить" href={addHref} active={isAdd} isAdd />
      <NavItem icon="chat" label="Сообщения" href={messagesHref} active={isMessages} />
      <NavItem icon="user" label="Профиль" href={profileHref} active={isProfile} />
    </nav>
  )
}
