'use client'

/** TZ-49 + TZ-52 + TZ-56: Профиль — цельный экран, ProfileHeader / PrimaryActions / ProfileSections. */

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import {
  FileText,
  Wallet,
  Megaphone,
  Settings,
  ChevronRight,
  CalendarCheck,
  LogOut,
  BarChart3,
  Shield,
  AlertTriangle,
  Users,
  Plus,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Container, Button } from '@/components/ui'

const ICON_CLS = 'w-5 h-5 shrink-0 text-[var(--text-secondary)]'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, hasRole } = useAuthStore()

  const listingUsed = (user as any)?.listingUsed ?? 0
  const isAdmin = hasRole?.('admin') || user?.role === 'admin'
  const isLandlord = !isAdmin && (hasRole?.('landlord') || user?.role === 'landlord' || listingUsed > 0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated()) router.replace(`/auth/login?redirect=${encodeURIComponent('/profile')}`)
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="text-center section">
          <p className="text-[var(--text-secondary)]">Требуется авторизация</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent('/profile')}`} className="btn-primary inline-flex items-center justify-center px-5">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  const roleLabel = isAdmin ? 'Администратор' : isLandlord ? 'Арендодатель' : 'Пользователь'

  const menuItemCls = 'profile-item flex items-center justify-between gap-3 w-full text-left card-ds'

  return (
    <div className="profile-page bg-[var(--bg-primary)] pb-24 md:pb-8">
      <Container className="profile-container pt-4">
        {/* 1. ProfileHeader — единый цельный блок */}
        <header className="profile-header">
          <div className="profile-header__avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (user?.full_name || user?.username || '?').slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="profile-header__user-info">
            <p className="profile-header__username">
              {user?.full_name || user?.username || 'Пользователь'}
            </p>
            <p className="profile-header__role">{roleLabel}</p>
          </div>
          <Link href="/profile/edit" className="profile-header__edit btn-secondary inline-flex items-center justify-center px-3 py-2 text-[13px] h-auto min-h-0">
            Редактировать
          </Link>
        </header>

        {/* 2. PrimaryActions — кнопка размещения (стандартная primary, отступ сверху) */}
        <div className="md:hidden create-listing-btn">
          <Link href="/profile/listings/create" className="btn-primary inline-flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2.2} />
            Разместить объявление
          </Link>
        </div>

        {/* 3. ProfileSections */}
        {isAdmin && (
          <section className="profile-admin-section">
            <h2 className="profile-admin-section__title">Администрирование</h2>
            <div className="profile-item-wrap">
              <Link href="/admin" className={menuItemCls}>
                <span className="flex items-center gap-3"><Shield className={ICON_CLS} />Админ панель</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
              <Link href="/admin?tab=moderation" className={menuItemCls}>
                <span className="flex items-center gap-3"><Shield className={ICON_CLS} />Модерация</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
              <Link href="/admin?tab=push" className={menuItemCls}>
                <span className="flex items-center gap-3"><AlertTriangle className={ICON_CLS} />Жалобы</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
              <Link href="/admin?tab=users" className={menuItemCls}>
                <span className="flex items-center gap-3"><Users className={ICON_CLS} />Пользователи</span>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </Link>
            </div>
          </section>
        )}

        <section className="profile-sections">
          <h2 className="profile-section-title">Профиль</h2>
          <div className="profile-item-wrap">
            <Link href="/profile/listings" className={menuItemCls}>
              <span className="flex items-center gap-3"><FileText className={ICON_CLS} />Мои объявления</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/bookings" className={menuItemCls}>
              <span className="flex items-center gap-3"><CalendarCheck className={ICON_CLS} />Бронирования</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/finance" className={menuItemCls}>
              <span className="flex items-center gap-3"><Wallet className={ICON_CLS} />Финансы</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/promo" className={menuItemCls}>
              <span className="flex items-center gap-3"><Megaphone className={ICON_CLS} />Продвижение</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/analytics" className={menuItemCls}>
              <span className="flex items-center gap-3"><BarChart3 className={ICON_CLS} />Аналитика</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Link href="/profile/settings" className={menuItemCls}>
              <span className="flex items-center gap-3"><Settings className={ICON_CLS} />Настройки</span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </Link>
            <Button
              type="button"
              variant="ghost"
              className={cn(menuItemCls, 'text-[var(--text-secondary)] hover:bg-red-500/10')}
              onClick={async () => {
                await logout()
                router.push('/')
              }}
            >
              <span className="flex items-center gap-3"><LogOut className={ICON_CLS} />Выход</span>
            </Button>
          </div>
        </section>
      </Container>
    </div>
  )
}
