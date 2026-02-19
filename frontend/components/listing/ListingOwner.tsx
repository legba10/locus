'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

export interface ListingOwnerProps {
  owner: {
    id: string
    name: string
    avatar: string | null
    rating?: number | null
    reviewsCount?: number | null
    listingsCount?: number | null
    lastSeen?: string | null
  }
  onWrite?: () => void
  showRespondsFast?: boolean
  /** ТЗ-3: без кнопки «Профиль»; переход по клику на карточку */
  hideProfileButton?: boolean
}

const FALLBACK_OWNER = {
  id: "",
  name: "Пользователь",
  avatar: null as string | null,
  rating: null as number | null,
  reviewsCount: null as number | null,
  listingsCount: 0,
  lastSeen: null as string | null,
};

export function ListingOwner({ owner, onWrite, showRespondsFast = true, hideProfileButton }: ListingOwnerProps) {
  const o = owner ?? FALLBACK_OWNER;
  const hasRating = o.rating != null && Number.isFinite(o.rating);
  const reviewsCount = o.reviewsCount ?? null;
  const listingsCount = o.listingsCount ?? 0;
  const profileHref = o.id ? `/user/${o.id}` : '#';

  const reviewsLabel =
    reviewsCount == null
      ? ''
      : reviewsCount === 1
        ? '1 отзыв'
        : reviewsCount >= 2 && reviewsCount <= 4
          ? `${reviewsCount} отзыва`
          : `${reviewsCount} отзывов`

  const responseLabel = (() => {
    if (!showRespondsFast) return null;
    if (o.lastSeen) {
      // simple heuristic: if lastSeen < 15 мин назад, считаем \"Онлайн\"
      const last = new Date(o.lastSeen).getTime();
      const diffMin = (Date.now() - last) / 60000
      if (!Number.isNaN(diffMin) && diffMin <= 15) return 'Онлайн'
    }
    return 'Отвечает быстро'
  })()

  const content = (
    <>
      <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Владелец</h2>
      <div className="flex items-start gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[var(--bg-input)] flex-shrink-0">
          {o.avatar ? (
            <Image src={o.avatar} alt={o.name || "Пользователь"} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[20px] font-bold text-[var(--text-muted)]">
              {(o.name || "Г").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-primary)] text-[16px]">{o.name || "Пользователь"}</p>
          {responseLabel && (
            <p className="text-[13px] text-emerald-600 dark:text-emerald-400 mt-0.5">{responseLabel}</p>
          )}
          {hasRating && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[14px] font-medium text-[var(--text-primary)]">★ {o.rating?.toFixed(1)}</span>
              {reviewsLabel && (
                <span className="text-[13px] text-[var(--text-secondary)]">({reviewsLabel})</span>
              )}
            </div>
          )}
          {listingsCount > 0 && (
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
              {listingsCount} объявлений
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWrite?.(); }}
              className="px-4 py-2.5 rounded-[12px] bg-[var(--accent)] text-[var(--text-on-accent)] text-[14px] font-semibold hover:opacity-95 transition-opacity"
            >
              Написать
            </button>
            {!hideProfileButton && (
              <Link
                href={profileHref}
                className="px-4 py-2.5 rounded-[12px] border border-[var(--border-main)] text-[var(--text-primary)] text-[14px] font-semibold hover:bg-[var(--bg-input)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Профиль
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const className = cn(
    'rounded-[18px] p-4 md:p-6',
    'bg-[var(--bg-card)] border border-[var(--border-main)]',
    hideProfileButton && 'cursor-pointer hover:bg-[var(--bg-input)]/50 transition-colors'
  );

  if (hideProfileButton && o.id) {
    return (
      <Link href={profileHref} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
