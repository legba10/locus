'use client'

/** TZ-1: единое меню админки — route-based навигация */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils/cn'

const linkCls = (active: boolean) =>
  cn(
    'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
    active ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text-primary)]'
  )

export default function AdminSidebar() {
  const pathname = usePathname()
  const base = pathname?.replace(/\/$/, '') || ''
  const segment = base.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard'

  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Админ-меню">
      <Link href="/admin" className={linkCls(segment === 'dashboard' || segment === '')}>
        Dashboard
      </Link>
      <Link href="/admin/listings" className={linkCls(segment === 'listings')}>
        Объявления
      </Link>
      <Link href="/admin/moderation" className={linkCls(segment === 'moderation')}>
        Модерация
      </Link>
      <Link href="/admin/reports" className={linkCls(segment === 'reports')}>
        Жалобы
      </Link>
      <Link href="/admin/users" className={linkCls(segment === 'users')}>
        Пользователи
      </Link>
      <Link href="/admin/stats" className={linkCls(segment === 'stats')}>
        Статистика
      </Link>
    </nav>
  )
}
