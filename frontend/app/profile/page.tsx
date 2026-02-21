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
  MessageCircle,
  Heart,
  CalendarCheck,
  Calendar as CalendarIcon,
  LogOut,
  BarChart3,
  Shield,
  LifeBuoy,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const SPACE_SECTION = 'mb-8'
const CARD_CLS = 'h-16 flex items-center justify-between gap-3 w-full px-4 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:bg-[var(--bg-input)] active:scale-[0.99] transition-all duration-200 text-left'
const ICON_CLS = 'w-5 h-5 shrink-0 text-[var(--text-secondary)]'
const SECTION_TITLE = 'text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4'

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
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="page-container-tz33 py-6">
        <section className={SPACE_SECTION}>
          <div className="p-4 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
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

        <section className={SPACE_SECTION}>
          <h2 className={SECTION_TITLE}>Управление жильём</h2>
          <div className="space-y-4">
            {isAdmin ? (
              <>
                <Link href="/admin/moderation" className={CARD_CLS}><span className="flex items-center gap-3"><Shield className={ICON_CLS} />Модерация</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/admin" className={CARD_CLS}><span className="flex items-center gap-3"><Users className={ICON_CLS} />Пользователи</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/admin" className={CARD_CLS}><span className="flex items-center gap-3"><AlertTriangle className={ICON_CLS} />Жалобы</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
              </>
            ) : isLandlord ? (
              <>
                <Link href="/profile/listings" className={CARD_CLS}><span className="flex items-center gap-3"><FileText className={ICON_CLS} />Мои объявления</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/profile/bookings" className={CARD_CLS}><span className="flex items-center gap-3"><CalendarCheck className={ICON_CLS} />Бронирования</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/profile/calendar" className={CARD_CLS}><span className="flex items-center gap-3"><CalendarIcon className={ICON_CLS} />Календарь</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/profile/promo" className={CARD_CLS}><span className="flex items-center gap-3"><Megaphone className={ICON_CLS} />Продвижение</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/profile/finance" className={CARD_CLS}><span className="flex items-center gap-3"><Wallet className={ICON_CLS} />Финансы</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
              </>
            ) : (
              <>
                <Link href="/favorites" className={CARD_CLS}><span className="flex items-center gap-3"><Heart className={ICON_CLS} />Избранное</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/profile/bookings" className={CARD_CLS}><span className="flex items-center gap-3"><CalendarCheck className={ICON_CLS} />Бронирования</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
                <Link href="/profile/settings" className={CARD_CLS}><span className="flex items-center gap-3"><Settings className={ICON_CLS} />Настройки</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
              </>
            )}
          </div>
        </section>

        <section className={SPACE_SECTION}>
          <h2 className={SECTION_TITLE}>Быстрые действия</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/profile/listings/create" className={cn(CARD_CLS, 'h-[72px] justify-center text-center')}>Разместить объявление</Link>
            <Link href="/profile/promo" className={cn(CARD_CLS, 'h-[72px] justify-center text-center')}>Продвинуть</Link>
            <Link href="/profile/analytics" className={cn(CARD_CLS, 'h-[72px] justify-center text-center')}><BarChart3 className="w-4 h-4 mr-1" />Аналитика</Link>
            <Link href="/messages" className={cn(CARD_CLS, 'h-[72px] justify-center text-center')}><MessageCircle className="w-4 h-4 mr-1" />Сообщения</Link>
          </div>
        </section>

        <section className={SPACE_SECTION}>
          <h2 className={SECTION_TITLE}>Система</h2>
          <div className="space-y-4">
            <Link href="/profile/settings" className={CARD_CLS}><span className="flex items-center gap-3"><Settings className={ICON_CLS} />Настройки</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <Link href="/help" className={CARD_CLS}><span className="flex items-center gap-3"><LifeBuoy className={ICON_CLS} />Поддержка</span><ChevronRight className="w-5 h-5 text-[var(--text-muted)]" /></Link>
            <button type="button" onClick={async () => { await logout(); router.push('/') }} className={cn(CARD_CLS, 'w-full text-[var(--text-secondary)] border-red-500/30 hover:bg-red-500/10')}>
              <span className="flex items-center gap-3"><LogOut className={ICON_CLS} />Выход</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
