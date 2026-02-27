'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { StatusBadge, apiStatusToBadge } from '@/components/listing/StatusBadge'
import { ListingPlanBadge } from '@/components/monetization/ListingPlanBadge'
import type { ListingPlan } from '@/shared/contracts/api'

export interface ListingCardCabinetV2Data {
  id: string
  title: string
  price: number
  cover: string | null
  status: string
  plan?: ListingPlan
  createdAt?: string
  views?: number
  favorites?: number
  /** TZ-65: причина отклонения (при status rejected) */
  rejectionReason?: string | null
}

export interface ListingCardCabinetV2Props {
  listing: ListingCardCabinetV2Data
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onHide: (id: string) => void
  /** Открыть выбор тарифа продвижения (ТЗ 5) */
  onPromote?: (id: string) => void
  /** ТЗ 6: открыть статистику по объявлению */
  onStats?: (id: string) => void
  onArchive?: (id: string) => void
  className?: string
}

function formatPrice(value: number): string {
  if (!value) return '—'
  return `${value.toLocaleString('ru-RU')} ₽/мес`
}

export function ListingCardCabinetV2({
  listing,
  onEdit,
  onDelete,
  onHide,
  onPromote,
  onStats,
  onArchive,
  className,
}: ListingCardCabinetV2Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const statusBadge = apiStatusToBadge(listing.status)
  const isPending = statusBadge === 'pending'
  const isRejected = statusBadge === 'rejected'

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <article
      className={cn(
        'rounded-[16px] p-5 bg-[var(--bg-card)] border border-[var(--border-main)]',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
        'transition-shadow',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/listing/${listing.id}`}
          className="shrink-0 w-full sm:w-[160px] h-[100px] sm:h-[100px] rounded-[12px] overflow-hidden bg-[var(--bg-input)]"
        >
          {listing.cover ? (
            <img
              src={listing.cover}
              alt=""
              className="w-full h-full object-cover"
              width={160}
              height={100}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-2xl">
              📷
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/listing/${listing.id}`}>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate hover:text-[var(--accent)]">
                {listing.title || 'Без названия'}
              </h3>
            </Link>
            <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
              {formatPrice(listing.price)}
            </p>
            {isRejected && listing.rejectionReason && (
              <p className="text-[13px] text-[var(--danger)] mt-2 mb-1">
                Причина: {listing.rejectionReason}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={statusBadge} />
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
                <span>Тариф:</span>
                <ListingPlanBadge plan={listing.plan ?? 'free'} />
              </span>
              {listing.views != null && (
                <span className="text-[12px] text-[var(--text-muted)]">👁 {listing.views}</span>
              )}
              {listing.favorites != null && (
                <span className="text-[12px] text-[var(--text-muted)]">❤ {listing.favorites}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isPending ? (
              <span className="px-3 py-2 rounded-[10px] text-[13px] text-[var(--text-muted)]">
                Редактирование недоступно
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onEdit(listing.id)}
                className="px-3 py-2 rounded-[10px] text-[13px] font-medium bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-[var(--button-primary-text)] transition-colors"
              >
                {isRejected ? 'Исправить и отправить снова' : 'Редактировать'}
              </button>
            )}
            {onStats && (
              <button type="button" onClick={() => onStats(listing.id)} className="px-3 py-2 rounded-[10px] text-[13px] font-medium bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors">
                Статистика
              </button>
            )}
            {onPromote && (
              <button
                type="button"
                onClick={() => onPromote(listing.id)}
                className="px-3 py-2 rounded-[10px] text-[13px] font-medium bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors"
              >
                {listing.plan === 'pro' || listing.plan === 'top' ? 'Изменить' : 'Улучшить объявление'}
              </button>
            )}
            {statusBadge === 'active' && (
              <button
                type="button"
                onClick={() => onHide(listing.id)}
                className="px-3 py-2 rounded-[10px] text-[13px] font-medium bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors"
              >
                Снять с публикации
              </button>
            )}
            {onArchive && (
              <button
                type="button"
                onClick={() => onArchive(listing.id)}
                className="px-3 py-2 rounded-[10px] text-[13px] font-medium bg-[var(--bg-input)] text-[var(--text-muted)] hover:bg-[var(--bg-main)] transition-colors"
              >
                Архив
              </button>
            )}
            <div className="relative sm:hidden" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
                aria-expanded={menuOpen}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="6" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="18" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-main)] shadow-lg z-10 min-w-[160px]">
                  <button type="button" onClick={() => { onEdit(listing.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]">
                    Редактировать
                  </button>
                  <button type="button" onClick={() => { onHide(listing.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]">
                    Скрыть
                  </button>
                  <button type="button" onClick={() => { onDelete(listing.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-[var(--bg-input)]">
                    Удалить
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDelete(listing.id)}
              className="hidden sm:inline-flex px-3 py-2 rounded-[10px] text-[13px] font-medium text-red-600 hover:bg-red-500/10 transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
