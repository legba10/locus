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
}

export function ListingOwner({ owner, onWrite, showRespondsFast = true }: ListingOwnerProps) {
  const hasRating = owner.rating != null && Number.isFinite(owner.rating)
  const reviewsCount = owner.reviewsCount ?? null
  const listingsCount = owner.listingsCount ?? 0

  const reviewsLabel =
    reviewsCount == null
      ? ''
      : reviewsCount === 1
        ? '1 отзыв'
        : reviewsCount >= 2 && reviewsCount <= 4
          ? `${reviewsCount} отзыва`
          : `${reviewsCount} отзывов`

  const responseLabel = (() => {
    if (!showRespondsFast) return null
    if (owner.lastSeen) {
      // simple heuristic: if lastSeen < 15 мин назад, считаем \"Онлайн\"
      const last = new Date(owner.lastSeen).getTime()
      const diffMin = (Date.now() - last) / 60000
      if (!Number.isNaN(diffMin) && diffMin <= 15) return 'Онлайн'
    }
    return 'Отвечает быстро'
  })()

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-4 md:p-6',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100'
      )}
    >
      <h2 className="text-[18px] font-bold text-[#1C1F26] mb-3">Владелец</h2>
      <div className="flex items-start gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {owner.avatar ? (
            <Image src={owner.avatar} alt={owner.name} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[20px] font-bold text-gray-400">
              {owner.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1C1F26] text-[16px]">{owner.name}</p>
          {hasRating && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[14px] font-medium text-[#1C1F26]">★ {owner.rating?.toFixed(1)}</span>
              {reviewsLabel && (
                <span className="text-[13px] text-[#6B7280]">({reviewsLabel})</span>
              )}
            </div>
          )}
          {listingsCount > 0 && (
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {listingsCount} объявлений
            </p>
          )}
          {responseLabel && (
            <p className="text-[13px] text-emerald-600 mt-1">{responseLabel}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={onWrite}
              className="px-4 py-2.5 rounded-[12px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
            >
              Написать
            </button>
            <Link
              href={`/user/${owner.id}`}
              className="px-4 py-2.5 rounded-[12px] border-2 border-gray-200 text-[#1C1F26] text-[14px] font-semibold hover:bg-gray-50"
            >
              Профиль
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
