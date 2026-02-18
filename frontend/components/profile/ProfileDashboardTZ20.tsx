'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { LayoutList, Calendar, MessageCircle, TrendingUp, Heart, Star } from 'lucide-react'

/** ТЗ-20: Главный экран профиля = дашборд: аватар, имя, рейтинг, статус; 4 карточки */
export function ProfileDashboardTZ20() {
  const { user } = useAuthStore()
  const isLandlord = (user as any)?.role === 'landlord' || (user as any)?.listingUsed > 0
  const { data: listingsData } = useFetch<{ items?: any[] }>(
    ['owner-listings'],
    '/api/listings/my',
    { enabled: !!user && isLandlord }
  )
  const listings = listingsData?.items ?? []
  const activeCount = listings.filter((l: any) => l.status === 'PUBLISHED' || l.status === 'ACTIVE').length

  const displayName = user?.full_name ?? user?.username ?? 'Пользователь'
  const displayAvatar = user?.avatar_url ?? null
  const rating = (user as any)?.rating_avg ?? (user as any)?.rating ?? null
  const listingUsed = (user as any)?.listingUsed ?? 0
  const listingLimit = user?.listingLimit ?? 1

  const cards = [
    { href: '/owner/dashboard', label: 'Мои объявления', icon: LayoutList, count: listingUsed },
    { href: '/owner/dashboard?tab=bookings', label: 'Бронирования', icon: Calendar },
    { href: '/messages', label: 'Сообщения', icon: MessageCircle },
    { href: '/profile/income', label: 'Доход / аналитика', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Верх: аватар, имя, рейтинг, статус */}
      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--bg-input)] flex-shrink-0 flex items-center justify-center">
            {displayAvatar ? (
              <Image src={displayAvatar} alt="" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="text-2xl font-semibold text-[var(--text-muted)]">{displayName[0]?.toUpperCase() || 'П'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold text-[var(--text-primary)]">{displayName}</h1>
            {rating != null && (
              <p className="flex items-center gap-1.5 mt-1 text-[14px] text-[var(--text-secondary)]">
                <Star className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" aria-hidden />
                {Number(rating).toFixed(1)}
              </p>
            )}
            <p className="text-[13px] text-[var(--text-muted)] mt-1">
              Статус: <span className="font-medium text-[var(--text-primary)]">активен</span>
              {listingLimit > 0 && (
                <> · Объявлений: {listingUsed} из {listingLimit}</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ТЗ-20.1: Мои показатели (для арендодателя) — 4 карточки в ряд ПК, 2 моб */}
      {isLandlord && (
        <section>
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-3">Мои показатели</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
              <p className="text-[22px] font-bold text-[var(--text-primary)] tabular-nums">{activeCount}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">активных объявлений</p>
            </div>
            <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
              <p className="text-[22px] font-bold text-[var(--text-primary)] tabular-nums">—</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">доход</p>
            </div>
            <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
              <p className="text-[22px] font-bold text-[var(--text-primary)] tabular-nums">—</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">бронирований</p>
            </div>
            <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
              <p className="text-[22px] font-bold text-[var(--text-primary)] tabular-nums">{rating != null ? Number(rating).toFixed(1) : '—'}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">рейтинг</p>
            </div>
          </div>
        </section>
      )}

      {/* 4 карточки: Мои объявления, Бронирования, Сообщения, Доход */}
      <section>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-3">Разделы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map(({ href, label, icon: Icon, count }) => (
            <Link
              key={href + label}
              href={href}
              className={cn(
                'flex items-center gap-4 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4',
                'hover:border-[var(--accent)]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all'
              )}
            >
              <div className="w-12 h-12 rounded-[12px] bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-[var(--accent)]" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">{label}</p>
                {count != null && count > 0 && (
                  <p className="text-[13px] text-[var(--text-muted)]">{count} объявл.</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ТЗ-20.4: Отзывы и рейтинг — средний рейтинг, AI-анализ, сильные/слабые стороны */}
      <section>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-3">Отзывы</h2>
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-2 mb-2">
            {rating != null ? (
              <span className="flex items-center gap-1.5 text-[18px] font-bold text-[var(--text-primary)]">
                <Star className="w-5 h-5 fill-[var(--accent)] text-[var(--accent)]" aria-hidden />
                {Number(rating).toFixed(1)}
              </span>
            ) : (
              <span className="text-[var(--text-muted)] text-[14px]">Пока нет рейтинга</span>
            )}
          </div>
          <p className="text-[13px] text-[var(--text-muted)] mb-2">AI-анализ отзывов и сильные/слабые стороны появятся после накопления отзывов.</p>
          <Link href="/owner/dashboard?tab=profile" className="text-[13px] font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" strokeWidth={1.8} />
            Подробнее в кабинете
          </Link>
        </div>
      </section>

      {/* ТЗ-20.4: Отзывы — средний рейтинг, AI-анализ */}
      <section>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-3">Отзывы</h2>
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
          {rating != null ? (
            <p className="flex items-center gap-1.5 text-[18px] font-bold text-[var(--text-primary)]">
              <Star className="w-5 h-5 fill-[var(--accent)] text-[var(--accent)]" aria-hidden />
              {Number(rating).toFixed(1)} — средний рейтинг
            </p>
          ) : (
            <p className="text-[var(--text-muted)] text-[14px]">Пока нет рейтинга</p>
          )}
          <p className="text-[13px] text-[var(--text-muted)] mt-2">Сильные и слабые стороны появятся после отзывов.</p>
        </div>
      </section>

      {/* Избранное — не удаляем, даём ссылку */}
      <p className="text-[13px] text-[var(--text-muted)]">
        <Link href="/favorites" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1.5">
          <Heart className="w-4 h-4" strokeWidth={1.8} />
          Избранное
        </Link>
      </p>
    </div>
  )
}
