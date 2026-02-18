'use client'

import Link from 'next/link'
import { useState, useCallback, memo } from 'react'
import { cn } from '@/shared/utils/cn'
import { track } from '@/shared/analytics/events'

export interface ListingCardOwner {
  id: string
  name: string
  avatar: string | null
  rating?: number | null
}

export type ListingCardBadge = 'verified' | 'ai' | 'top' | 'new' | 'discount' | 'rare' | 'superhost' | 'owner' | 'agent'

export interface ListingCardProps {
  id: string
  photo?: string | null
  photos?: Array<{ url: string }>
  title: string
  price: number
  city: string
  district?: string | null
  metro?: string | null
  rentalType?: 'night' | 'month' | 'room' | 'studio' | string
  rooms?: number
  area?: number
  guests?: number
  floor?: number
  totalFloors?: number
  aiReasons?: string | string[] | null
  badges?: ListingCardBadge[]
  owner?: ListingCardOwner | null
  rating?: number | null
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  className?: string
  highlight?: boolean
  compact?: boolean
  propertyType?: 'apartment' | 'room' | 'studio' | 'house' | string
  reviewCount?: number | null
  amenities?: ('wifi' | 'parking' | 'center' | 'metro')[]
  aiRecommendTooltip?: string
}

const SWIPE_THRESHOLD = 50

const PHOTO_HEIGHT = 220

function ListingCardComponent({
  id,
  photo,
  photos: photosProp,
  title,
  price,
  city,
  district,
  rooms,
  area,
  floor,
  totalFloors,
  className,
}: ListingCardProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [imgError, setImgError] = useState(false)

  const photos = photosProp?.length
    ? photosProp.map((p) => p.url)
    : photo ? [photo] : []
  const displayPhoto = photos[activePhotoIndex] ?? photo ?? null
  const hasMultiplePhotos = photos.length > 1
  const showPhoto = displayPhoto && !imgError

  const handleCardClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      const viewed = Number(localStorage.getItem('locus_viewed_count') || '0') + 1
      localStorage.setItem('locus_viewed_count', String(viewed))
      localStorage.setItem('locus_last_activity', String(Date.now()))
      window.dispatchEvent(new Event('locus:listing-viewed'))
    }
    track('listing_view', { listingId: id, listingTitle: title, listingCity: city, listingPrice: price })
  }, [id, title, city, price])

  const priceFormatted =
    price > 0 && Number.isFinite(price)
      ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' ₽ / мес'
      : 'Цена по запросу'

  const districtText = [city, district].filter(Boolean).join(' • ') || city || ''

  const metaParts: string[] = []
  if (rooms != null && rooms > 0) metaParts.push(`${rooms} ${rooms === 1 ? 'комната' : 'комнаты'}`)
  if (area != null && area > 0) metaParts.push(`${area} м²`)
  if (floor != null && floor > 0) {
    if (totalFloors != null && totalFloors > 0) {
      metaParts.push(`${floor} из ${totalFloors} этаж`)
    } else {
      metaParts.push(`${floor} этаж`)
    }
  }
  const metaText = metaParts.join(' • ')

  const goPrev = useCallback(() => {
    if (!hasMultiplePhotos) return
    setActivePhotoIndex((i) => (i - 1 + photos.length) % photos.length)
  }, [hasMultiplePhotos, photos.length])
  const goNext = useCallback(() => {
    if (!hasMultiplePhotos) return
    setActivePhotoIndex((i) => (i + 1) % photos.length)
  }, [hasMultiplePhotos, photos.length])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
  }, [])
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX == null) return
      const dx = touchStartX - e.changedTouches[0].clientX
      if (Math.abs(dx) > SWIPE_THRESHOLD) dx > 0 ? goNext() : goPrev()
      setTouchStartX(null)
    },
    [touchStartX, goPrev, goNext]
  )

  return (
    <Link
      href={`/listings/${id}`}
      className={cn(
        'block rounded-[18px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'pb-3 transition-shadow hover:shadow-lg',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Блок фото: height 220, radius 18, свайп, индикатор */}
      <div
        className="relative w-full rounded-t-[18px] overflow-hidden select-none"
        style={{ height: PHOTO_HEIGHT }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {showPhoto ? (
          <img
            src={displayPhoto}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] text-[40px]"
            aria-hidden
          >
            📷
          </div>
        )}

        {/* Цена: левый нижний угол, rgba(0,0,0,0.6), white, padding 6 10, radius 10, font-weight 600 */}
        <div
          className="absolute bottom-2 left-2 rounded-[10px] px-2.5 py-1.5 text-white font-semibold text-[14px]"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          {priceFormatted}
        </div>

        {/* Стрелки свайпа (десктоп) */}
        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              aria-label="Предыдущее фото"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              aria-label="Следующее фото"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}

        {/* Индикатор точек */}
        {hasMultiplePhotos && (
          <div className="absolute bottom-2 right-2 flex gap-1" aria-hidden>
            {photos.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  activePhotoIndex === i ? 'bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Контент под фото: padding 12 снизу уже в pb-3, добавим px-3 pt-3 */}
      <div className="px-3 pt-3">
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] line-clamp-2">
          {title || 'Без названия'}
        </h3>
        {districtText && (
          <p className="mt-1 text-[14px] text-[var(--text-secondary)] truncate">
            {districtText}
          </p>
        )}
        {metaText && (
          <p className="mt-0.5 text-[13px] text-[var(--text-muted)] truncate">
            {metaText}
          </p>
        )}
      </div>
    </Link>
  )
}

export const ListingCard = memo(ListingCardComponent)

/** ТЗ №9 + ТЗ-12: скелетон с shimmer — фото 220px, затем блок с линиями */
export function ListingCardSkeleton() {
  return (
    <div
      className={cn(
        'rounded-[18px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'pb-3'
      )}
    >
      <div
        className="w-full skeleton-shimmer-tz12 rounded-t-[18px]"
        style={{ height: PHOTO_HEIGHT }}
      />
      <div className="px-3 pt-3 space-y-2">
        <div className="h-4 w-3/4 rounded skeleton-shimmer-tz12" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer-tz12" />
        <div className="h-3 w-2/5 rounded skeleton-shimmer-tz12" />
      </div>
    </div>
  )
}
