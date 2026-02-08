'use client'

import { cn } from '@/shared/utils/cn'

export interface ListingHeaderProps {
  title: string
  city: string
  rating?: number | null
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
  reviewCount,
  rooms,
  area,
  floor,
  totalFloors,
  typeLabel = 'Квартира',
}: ListingHeaderProps) {
  const hasRating = rating != null && Number.isFinite(rating)
  const count = reviewCount ?? 0
  const meta = [
    rooms != null && rooms > 0 ? `${rooms} комн.` : null,
    area != null && area > 0 ? `${area} м²` : null,
    floor != null && totalFloors != null ? `${floor}/${totalFloors} этаж` : null,
    typeLabel,
  ].filter(Boolean)

  return (
    <div className={cn(
      'bg-white rounded-[18px] p-6',
      'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80'
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-[#1C1F26] mb-1">{title}</h1>
          <p className="text-[15px] text-[#6B7280]">{city}</p>
        </div>
        <div className="flex flex-col justify-center md:items-end">
          {hasRating && (
            <div className="flex items-center gap-1.5 mb-1">
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[16px] font-semibold text-[#1C1F26]">{rating.toFixed(1)}</span>
              {count > 0 && (
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
