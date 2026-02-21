'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { Home, Search, MessageCircle, User, PlusSquare, LogOut, Shield } from 'lucide-react'

const iconCls = 'w-5 h-5 shrink-0'
const linkCls = (active: boolean) =>
  cn(
    'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
    active ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
  )

/** TZ-22: Desktop sidebar — те же 5 пунктов, что и нижнее меню: Главная, Поиск, Добавить, Сообщения, Профиль. */
export function AppSidebarTZ14() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, hasRole, logout } = useAuthStore()

  const isAdminRoute = pathname?.startsWith('/admin')
  if (isAdminRoute) return null

  const base = pathname?.replace(/\/$/, '') || ''
  const isHome = base === '' || base === '/'
  const isSearch = base === '/listings' || base.startsWith('/listings')
  const isAdd = pathname?.startsWith('/create-listing') || pathname?.startsWith('/profile/listings/create')
  const isMessages = base === '/messages' || base.startsWith('/messages')
  const isDashboard = base === '/profile' || base.startsWith('/profile')

  const authed = isAuthenticated()
  const addHref = authed ? '/profile/listings/create' : '/auth/login?redirect=' + encodeURIComponent('/profile/listings/create')
  const profileHref = authed ? '/profile' : '/auth/login?redirect=' + encodeURIComponent('/profile')
  const messagesHref = authed ? '/messages' : '/auth/login?redirect=/messages'
  const isAdmin = hasRole?.('admin') ?? false

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside
      className="hidden lg:flex lg:flex-col w-[240px] shrink-0 border-r border-[var(--border-main)] bg-[var(--bg-card)]/80 pt-4 pb-4 overflow-y-auto"
      aria-label="Навигация"
    >
      <nav className="flex flex-col gap-0.5 px-2">
        <Link href="/" className={linkCls(isHome)}>
          <Home className={iconCls} strokeWidth={1.8} aria-hidden />
          Главная
        </Link>
        <Link href="/listings" className={linkCls(isSearch)}>
          <Search className={iconCls} strokeWidth={1.8} aria-hidden />
          Поиск
        </Link>
        <Link href={addHref} className={linkCls(isAdd)}>
          <PlusSquare className={iconCls} strokeWidth={1.8} aria-hidden />
          Добавить
        </Link>
        <Link href={messagesHref} className={linkCls(isMessages)}>
          <MessageCircle className={iconCls} strokeWidth={1.8} aria-hidden />
          Сообщения
        </Link>
        <Link href={profileHref} className={linkCls(isDashboard)}>
          <User className={iconCls} strokeWidth={1.8} aria-hidden />
          Профиль
        </Link>
      </nav>

      {isAdmin && (
        <nav className="flex flex-col gap-0.5 px-2 mt-4 pt-4 border-t border-[var(--border-main)]">
          <Link href="/admin" className={linkCls(pathname?.startsWith('/admin') ?? false)}>
            <Shield className={iconCls} strokeWidth={1.8} aria-hidden />
            Админ панель
          </Link>
        </nav>
      )}

      {authed && (
        <div className="mt-auto pt-4 border-t border-[var(--border-main)] px-2">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
              'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
            )}
          >
            <LogOut className={iconCls} strokeWidth={1.8} aria-hidden />
            Выйти
          </button>
        </div>
      )}
    </aside>
  )
}
