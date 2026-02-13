'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

export interface OwnerCardProps {
  owner: {
    id: string
    name: string
    avatar: string | null
    rating?: number | null
    reviewsCount?: number | null
  }
  onWrite: () => void
}

export function OwnerCard({ owner, onWrite }: OwnerCardProps) {
  const hasRating = owner.rating != null && Number.isFinite(owner.rating)
  const reviewsLabel =
    owner.reviewsCount == null
      ? ''
      : owner.reviewsCount === 1
        ? '1 отзыв'
        : owner.reviewsCount >= 2 && owner.reviewsCount <= 4
          ? `${owner.reviewsCount} отзыва`
          : `${owner.reviewsCount} отзывов`

  return (
    <div className={cn('rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 md:p-6')}>
      <h2 className="text-[18px] font-bold text-[var(--text-main)] mb-4">Владелец</h2>
      <div className="flex items-start gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[var(--bg-glass)] flex-shrink-0">
          {owner.avatar ? (
            <Image src={owner.avatar} alt={owner.name} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[20px] font-bold text-[var(--text-secondary)]">
              {(owner.name || 'Г').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-main)] text-[16px]">{owner.name || 'Пользователь'}</p>
          {hasRating && (
            <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
              ★ {owner.rating?.toFixed(1)}
              {reviewsLabel && ` · ${reviewsLabel}`}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={onWrite}
              className="min-h-[44px] px-4 rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px]"
            >
              Написать
            </button>
            <Link
              href={`/user/${owner.id}`}
              className="min-h-[44px] px-4 rounded-[16px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-semibold text-[14px] inline-flex items-center justify-center"
            >
              Профиль
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
