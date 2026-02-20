'use client'

/** TZ-30: Единый центр управления. 4 блока, роли (арендатор/арендодатель), без дублей. */

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { FileText, Wallet, Megaphone, Settings, ChevronRight, MessageCircle, Heart, CalendarCheck, LogOut, Sparkles } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const SECTION_SPACING = 'mb-6'
const CARD_CLS = 'flex items-center justify-between gap-3 w-full p-4 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:bg-[var(--bg-input)] active:scale-[0.99] transition-all duration-200 text-left'
const ICON_CLS = 'w-5 h-5 shrink-0 text-[var(--text-secondary)]'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, hasRole } = useAuthStore()

  const listingUsed = (user as any)?.listingUsed ?? 0
  const isLandlord = hasRole?.('landlord') || user?.role === 'landlord' || listingUsed > 0
  const canBecomeLandlord = !isLandlord && listingUsed === 0

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/profile')}`)
    }
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

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-6">Профиль</h1>

        {/* Блок 1 — Аккаунт: аватар, имя, статус, рейтинг, одна кнопка */}
        <section className={SECTION_SPACING}>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Аккаунт</h2>
          <div className="flex items-center gap-4 p-4 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="w-14 h-14 rounded-full bg-[var(--bg-input)] overflow-hidden shrink-0 flex items-center justify-center text-[22px] font-semibold text-[var(--text-muted)]">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (user?.full_name || user?.username || '?').slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold text-[var(--text-primary)] truncate">
                {user?.full_name || user?.username || 'Пользователь'}
              </p>
              <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
                {isLandlord ? 'Арендодатель' : 'Арендатор'}
              </p>
              {user?.rating != null && (
                <p className="text-[13px] text-[var(--text-muted)] mt-0.5">★ {Number(user.rating).toFixed(1)}</p>
              )}
            </div>
            <Link
              href="/profile/edit"
              className="shrink-0 px-4 py-2 rounded-[12px] text-[14px] font-medium bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-90"
            >
              Редактировать профиль
            </Link>
          </div>
        </section>

        {/* Блок 2 — Управление жильём (динамика по роли) */}
        <section className={SECTION_SPACING}>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Управление жильём</h2>
          <div className="space-y-2">
            {isLandlord && (
              <>
                <Link href="/profile/listings" className={CARD_CLS}>
                  <span className="flex items-center gap-3 min-w-0">
                    <FileText className={ICON_CLS} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Мои объявления</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                </Link>
                <Link href="/profile/bookings" className={CARD_CLS}>
                  <span className="flex items-center gap-3 min-w-0">
                    <CalendarCheck className={ICON_CLS} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Бронирования</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                </Link>
                <Link href="/profile/promo" className={CARD_CLS}>
                  <span className="flex items-center gap-3 min-w-0">
                    <Megaphone className={ICON_CLS} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Продвижение</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                </Link>
                <Link href="/profile/finance" className={CARD_CLS}>
                  <span className="flex items-center gap-3 min-w-0">
                    <Wallet className={ICON_CLS} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Финансы</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                </Link>
              </>
            )}
            {!isLandlord && (
              <>
                <Link href="/profile/bookings" className={CARD_CLS}>
                  <span className="flex items-center gap-3 min-w-0">
                    <CalendarCheck className={ICON_CLS} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Бронирования</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                </Link>
                <Link href="/favorites" className={CARD_CLS}>
                  <span className="flex items-center gap-3 min-w-0">
                    <Heart className={ICON_CLS} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Избранное</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                </Link>
                <Link href="/messages" className={CARD_CLS}>
                  <span className="flex items-center gap-3 min-w-0">
                    <MessageCircle className={ICON_CLS} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Сообщения</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                </Link>
              </>
            )}
            {canBecomeLandlord && (
              <Link
                href="/profile/listings/create"
                className={cn(CARD_CLS, 'bg-[var(--accent)]/10 border-[var(--accent)]/30')}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Sparkles className="w-5 h-5 shrink-0 text-[var(--accent)]" strokeWidth={1.8} />
                  <span className="text-[15px] font-medium text-[var(--accent)]">Стать арендодателем</span>
                </span>
                <ChevronRight className="w-5 h-5 shrink-0 text-[var(--accent)]" />
              </Link>
            )}
            {isLandlord && (
              <Link href="/profile/listings/create" className={cn(CARD_CLS, 'mt-2 bg-[var(--accent)] border-[var(--accent)] hover:opacity-95')}>
                <span className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 shrink-0 text-[var(--button-primary-text)]" strokeWidth={1.8} />
                  <span className="text-[15px] font-medium text-[var(--button-primary-text)]">Добавить объявление</span>
                </span>
                <ChevronRight className="w-5 h-5 shrink-0 text-[var(--button-primary-text)]" />
              </Link>
            )}
          </div>
        </section>

        {/* Блок 3 — Настройки */}
        <section className={SECTION_SPACING}>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Настройки</h2>
          <div className="space-y-2">
            <Link href="/profile/settings" className={CARD_CLS}>
              <span className="flex items-center gap-3 min-w-0">
                <Settings className={ICON_CLS} strokeWidth={1.8} />
                <span className="text-[15px] font-medium text-[var(--text-primary)]">Основное, безопасность, интерфейс</span>
              </span>
              <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
            </Link>
            <button
              type="button"
              onClick={async () => { await logout(); router.push('/') }}
              className={cn(CARD_CLS, 'w-full text-[var(--text-secondary)] border-red-500/30 hover:bg-red-500/10')}
            >
              <span className="flex items-center gap-3 min-w-0">
                <LogOut className={ICON_CLS} strokeWidth={1.8} />
                <span className="text-[15px] font-medium">Выход</span>
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
