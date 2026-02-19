'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { LayoutDashboard, FileText, Wallet, Megaphone, Settings, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

/** TZ-22: Единый экран кабинета /dashboard — блоки: Обзор, Мои объявления, Финансы, Продвижение, Настройки. */
export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/dashboard')}`)
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Требуется авторизация</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent('/dashboard')}`} className="text-[var(--accent)] font-medium">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  const blockCls = 'flex items-center justify-between gap-3 w-full p-4 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] transition-colors text-left'
  const iconCls = 'w-5 h-5 shrink-0 text-[var(--text-secondary)]'

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-6">Кабинет</h1>

        {/* Блок 1 — Обзор */}
        <section className="mb-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Обзор</h2>
          <div className="space-y-2">
            <Link href="/profile" className={blockCls}>
              <span className="flex items-center gap-3 min-w-0">
                <LayoutDashboard className={iconCls} strokeWidth={1.8} />
                <span className="text-[15px] font-medium text-[var(--text-primary)]">Статистика и просмотры</span>
              </span>
              <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
            </Link>
            <Link href="/favorites" className={blockCls}>
              <span className="flex items-center gap-3 min-w-0">
                <LayoutDashboard className={iconCls} strokeWidth={1.8} />
                <span className="text-[15px] font-medium text-[var(--text-primary)]">Избранное</span>
              </span>
              <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
            </Link>
          </div>
        </section>

        {/* Блок 2 — Мои объявления */}
        <section className="mb-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Мои объявления</h2>
          <Link href="/dashboard/listings" className={blockCls}>
            <span className="flex items-center gap-3 min-w-0">
              <FileText className={iconCls} strokeWidth={1.8} />
              <span className="text-[15px] font-medium text-[var(--text-primary)]">Список объявлений</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
          </Link>
          <Link href="/dashboard/listings/create" className={cn(blockCls, 'mt-2 bg-[var(--accent)] border-[var(--accent)] hover:opacity-95')}>
            <span className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 shrink-0 text-[var(--button-primary-text)]" strokeWidth={1.8} />
              <span className="text-[15px] font-medium text-[var(--button-primary-text)]">Добавить объявление</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-[var(--button-primary-text)]" />
          </Link>
        </section>

        {/* Блок 3 — Финансы */}
        <section className="mb-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Финансы</h2>
          <Link href="/dashboard/billing" className={blockCls}>
            <span className="flex items-center gap-3 min-w-0">
              <Wallet className={iconCls} strokeWidth={1.8} />
              <span className="text-[15px] font-medium text-[var(--text-primary)]">Баланс и платежи</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
          </Link>
        </section>

        {/* Блок 4 — Продвижение */}
        <section className="mb-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Продвижение</h2>
          <Link href="/dashboard/promo" className={blockCls}>
            <span className="flex items-center gap-3 min-w-0">
              <Megaphone className={iconCls} strokeWidth={1.8} />
              <span className="text-[15px] font-medium text-[var(--text-primary)]">Тарифы и продвижение</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
          </Link>
        </section>

        {/* Блок 5 — Настройки профиля */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Настройки профиля</h2>
          <Link href="/dashboard/profile" className={blockCls}>
            <span className="flex items-center gap-3 min-w-0">
              <Settings className={iconCls} strokeWidth={1.8} />
              <span className="text-[15px] font-medium text-[var(--text-primary)]">Профиль и настройки</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
          </Link>
        </section>
      </div>
    </div>
  )
}
