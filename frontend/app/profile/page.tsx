'use client'

/** TZ-34: Профиль = единый центр управления. Без дублей меню и вложенных панелей. */

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
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'

/** TZ-47: карточки меню — height 56px, border-radius 14px, padding 0 16px */
const CARD_CLS = 'h-14 min-h-[56px] flex items-center justify-between gap-3 w-full px-4 rounded-[14px] card-tz47 hover:translate-y-[-1px] active:scale-[0.99] transition-all duration-200 text-left'
const ICON_CLS = 'w-5 h-5 shrink-0 text-[var(--text-secondary)]'
const SECTION_TITLE = 'text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)]'

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
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Требуется авторизация</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent('/profile')}`} className="text-[var(--accent)] font-medium">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  const roleLabel = isAdmin ? 'Администратор' : isLandlord ? 'Арендодатель' : 'Пользователь'

  return (
    <div className="bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="profile-container-tz47 pt-4">
        <Link
          href="/profile/listings/create"
          className="mb-4 flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-90"
        >
          Разместить объявление
        </Link>
        <section className="flex flex-col gap-3 mb-4">
          <div className="p-4 rounded-[14px] card-tz47">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] overflow-hidden shrink-0 flex items-center justify-center text-[20px] font-semibold text-[var(--text-muted)]">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : (user?.full_name || user?.username || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-[var(--text-primary)] truncate">{user?.full_name || user?.username || 'Пользователь'}</p>
                <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{roleLabel}</p>
              </div>
              <Link href="/profile/edit" className="shrink-0 px-3 py-2 rounded-[12px] text-[14px] font-medium bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-90">
                Редактировать
              </Link>
            </div>
          </div>
        </section>

        {isAdmin && (
          <section className="flex flex-col gap-3 mb-6">
            <h2 className={SECTION_TITLE}>Администрирование</h2>
            <div className="flex flex-col gap-3">
              <Link href="/admin" className={CARD_CLS}><span className="flex items-center gap-3"><Shield className={ICON_CLS} />Админ панель</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
              <Link href="/admin?tab=moderation" className={CARD_CLS}><span className="flex items-center gap-3"><Shield className={ICON_CLS} />Модерация</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
              <Link href="/admin?tab=push" className={CARD_CLS}><span className="flex items-center gap-3"><AlertTriangle className={ICON_CLS} />Жалобы</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
              <Link href="/admin?tab=users" className={CARD_CLS}><span className="flex items-center gap-3"><Users className={ICON_CLS} />Управление пользователями</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            </div>
          </section>
        )}

        <section className={cn('flex flex-col gap-3', isAdmin && 'mt-3')}>
          <h2 className={SECTION_TITLE}>Профиль</h2>
          <div className="flex flex-col gap-3">
            <Link href="/profile/listings" className={CARD_CLS}><span className="flex items-center gap-3"><FileText className={ICON_CLS} />Мои объявления</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <Link href="/profile/bookings" className={CARD_CLS}><span className="flex items-center gap-3"><CalendarCheck className={ICON_CLS} />Бронирования</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <Link href="/profile/finance" className={CARD_CLS}><span className="flex items-center gap-3"><Wallet className={ICON_CLS} />Финансы</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <Link href="/profile/promo" className={CARD_CLS}><span className="flex items-center gap-3"><Megaphone className={ICON_CLS} />Продвижение</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <Link href="/profile/analytics" className={CARD_CLS}><span className="flex items-center gap-3"><BarChart3 className={ICON_CLS} />Аналитика</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <Link href="/profile/settings" className={CARD_CLS}><span className="flex items-center gap-3"><Settings className={ICON_CLS} />Настройки</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <button type="button" onClick={async () => { await logout(); router.push('/') }} className={cn(CARD_CLS, 'w-full text-[var(--text-secondary)] border-red-500/30 hover:bg-red-500/10')}>
              <span className="flex items-center gap-3"><LogOut className={ICON_CLS} />Выход</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
