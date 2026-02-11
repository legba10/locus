'use client'

import { cn } from '@/shared/utils/cn'

export interface ListingHeaderProps {
  title: string
  city: string
  rating?: number | null
  /** Percent of positive reviews (4–5 stars), 0–100. Shown as ★ {rating} {reviewPercent}% */
  reviewPercent?: number | null
  reviewCount?: number | null
  rooms?: number | null
  area?: number | null
  floor?: number | null
  totalFloors?: number | null
  typeLabel?: string
}

export function ListingHeader({
  title,
  city,
  rating,
  reviewPercent,
  reviewCount,
  rooms,
  area,
  floor,
  totalFloors,
  typeLabel = 'Квартира',
}: ListingHeaderProps) {
  const hasRating = rating != null && Number.isFinite(rating)
  const count = reviewCount ?? 0
  const percent = reviewPercent != null && Number.isFinite(reviewPercent) ? Math.round(reviewPercent) : null
  const meta = [
    rooms != null && rooms > 0 ? `${rooms} комн.` : null,
    area != null && area > 0 ? `${area} м²` : null,
    floor != null && totalFloors != null ? `${floor}/${totalFloors} этаж` : null,
    typeLabel,
  ].filter(Boolean)

  return (
    <div className={cn(
      'bg-white rounded-2xl p-4 md:p-6',
      'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100'
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <h1 className="text-[20px] md:text-[24px] font-bold text-[#1C1F26] leading-tight mb-1">{title}</h1>
          <p className="text-[14px] text-[#6B7280]">{city}</p>
        </div>
        <div className="flex flex-col justify-center md:items-end">
          {hasRating && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-amber-500 text-[18px] leading-none">★</span>
              <span className="text-[16px] font-semibold text-[#1C1F26]">{rating.toFixed(1)}</span>
              {percent != null && (
                <span className="text-[14px] font-medium text-[#6B7280] tabular-nums">{percent}%</span>
              )}
              {percent == null && count > 0 && (
                <span className="text-[14px] text-[#6B7280]">({count} отзывов)</span>
              )}
            </div>
          )}
          {meta.length > 0 && (
            <p className="text-[14px] text-[#6B7280]">
              {meta.join(' • ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
