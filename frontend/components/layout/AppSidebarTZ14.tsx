'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { Home, Search, PlusSquare, MessageCircle, User, LogOut } from 'lucide-react'

/**
 * ТЗ-14: Desktop sidebar — повторяет нижнее меню: Главная, Поиск, Добавить, Сообщения, Профиль + Выйти.
 * Показывается только на desktop (lg+) и только когда пользователь авторизован и не в админке.
 */
export function AppSidebarTZ14() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()

  const isAdmin = pathname?.startsWith('/admin')
  if (!isAuthenticated() || isAdmin) return null

  const base = pathname?.replace(/\/$/, '') || ''
  const isHome = base === '' || base === '/'
  const isSearch = base === '/listings' || base.startsWith('/listings')
  const isAdd = pathname?.startsWith('/create-listing')
  const isMessages = base === '/messages' || base.startsWith('/messages')
  const isProfile = base === '/profile' || base.startsWith('/profile') || base.startsWith('/auth')

  const linkCls = (active: boolean) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
      active ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
    )

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside
      className="hidden lg:flex lg:flex-col w-[220px] shrink-0 border-r border-[var(--border-main)] bg-[var(--bg-card)]/80 pt-4 pb-4"
      aria-label="Навигация"
    >
      <nav className="flex flex-col gap-0.5 px-2">
        <Link href="/" className={linkCls(isHome)}>
          <Home className="w-5 h-5" strokeWidth={1.8} aria-hidden />
          Главная
        </Link>
        <Link href="/listings" className={linkCls(isSearch)}>
          <Search className="w-5 h-5" strokeWidth={1.8} aria-hidden />
          Поиск
        </Link>
        <Link href="/create-listing" className={linkCls(isAdd)}>
          <PlusSquare className="w-5 h-5" strokeWidth={1.8} aria-hidden />
          Добавить
        </Link>
        <Link href="/messages" className={linkCls(isMessages)}>
          <MessageCircle className="w-5 h-5" strokeWidth={1.8} aria-hidden />
          Сообщения
        </Link>
        <Link href="/profile" className={linkCls(isProfile)}>
          <User className="w-5 h-5" strokeWidth={1.8} aria-hidden />
          Профиль
        </Link>
      </nav>
      <div className="mt-auto pt-4 border-t border-[var(--border-main)] px-2">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
            'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
          )}
        >
          <LogOut className="w-5 h-5" strokeWidth={1.8} aria-hidden />
          Выйти
        </button>
      </div>
    </aside>
  )
}
