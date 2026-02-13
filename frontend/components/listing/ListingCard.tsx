'use client'

import Image from 'next/image'
import { useState, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import { isValidImageUrl } from '@/shared/utils/imageUtils'
import { apiFetch } from '@/shared/utils/apiFetch'
import { track } from '@/shared/analytics/events'

export interface ListingCardOwner {
  id: string
  name: string
  avatar: string | null
  rating?: number | null
}

export interface ListingCardProps {
  id: string
  /** Single photo URL or first of photos */
  photo?: string | null
  /** Multiple photos (optional); if present, used for swipe/gallery */
  photos?: Array<{ url: string }>
  title: string
  price: number
  city: string
  district?: string | null
  owner?: ListingCardOwner | null
  /** Listing rating (stars) */
  rating?: number | null
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  className?: string
  highlight?: boolean
}

const PHOTO_HEIGHT_MOBILE = 220
const PHOTO_HEIGHT_DESKTOP = 260
const SWIPE_THRESHOLD = 50

function ListingCardComponent({
  id,
  photo,
  photos: photosProp,
  title,
  price,
  city,
  district,
  owner,
  rating,
  isFavorite = false,
  onFavoriteToggle,
  className,
  highlight = false,
}: ListingCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [isSaved, setIsSaved] = useState(isFavorite)
  const [isToggling, setIsToggling] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const photos = photosProp?.length
    ? photosProp.map((p) => p.url)
    : photo && isValidImageUrl(photo)
      ? [photo]
      : []
  const displayPhoto = photos[activePhotoIndex] ?? photo ?? null
  const hasMultiplePhotos = photos.length > 1

  const openListing = useCallback(() => {
    if (typeof window !== 'undefined') {
      const viewed = Number(localStorage.getItem('locus_viewed_count') || '0') + 1
      localStorage.setItem('locus_viewed_count', String(viewed))
      localStorage.setItem('locus_last_activity', String(Date.now()))
      window.dispatchEvent(new Event('locus:listing-viewed'))
    }
    track('listing_view', { listingId: id, listingTitle: title, listingCity: city, listingPrice: price })
    router.push(`/listings/${id}`)
  }, [id, title, city, price, router])

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isToggling || !onFavoriteToggle) return
      setIsToggling(true)
      const newState = !isSaved
      setIsSaved(newState)
      if (newState) track('favorite_add', { listingId: id })
      apiFetch(`/favorites/${id}/toggle`, { method: 'POST' })
        .then(() => onFavoriteToggle?.())
        .catch(() => setIsSaved(!newState))
        .finally(() => setIsToggling(false))
    },
    [id, isSaved, isToggling, onFavoriteToggle]
  )

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

  const locationText = district ? `${city} · ${district}` : city
  const showOwner = owner?.name || owner?.avatar
  const displayRating = owner?.rating ?? rating

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openListing}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openListing()}
      className={cn(
        'listing-card-unified flex flex-col h-full rounded-[18px] overflow-hidden cursor-pointer',
        'bg-[var(--bg-card)] border border-[var(--border)]',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        'dark:bg-[#14161f] dark:border-[rgba(255,255,255,0.08)] [data-theme="dark"]:bg-[#14161f] [data-theme="dark"]:border-[rgba(255,255,255,0.08)]',
        highlight && 'ring-2 ring-[var(--accent)]',
        className
      )}
    >
      {/* Photo: 220px mobile, 260px desktop */}
      <div
        className="relative w-full h-[220px] md:h-[260px] flex-shrink-0 overflow-hidden rounded-t-[18px] bg-[var(--bg-glass)] select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {displayPhoto && !imgError ? (
          <Image
            src={displayPhoto}
            alt={title || 'Фото жилья'}
            fill
            className="object-cover transition-opacity duration-200 md:hover:opacity-95"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImgError(true)}
            unoptimized={displayPhoto.startsWith('http')}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-secondary)] text-[12px] gap-2">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            </svg>
            <span>Нет фото</span>
          </div>
        )}
        {/* Desktop: arrows */}
        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center transition-colors hidden md:flex"
              aria-label="Предыдущее фото"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center transition-colors hidden md:flex"
              aria-label="Следующее фото"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
        {/* Dots (mobile + desktop) */}
        {hasMultiplePhotos && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {photos.map((_, i) => (
              <span
                key={i}
                className={cn('w-1.5 h-1.5 rounded-full transition-all', activePhotoIndex === i ? 'bg-white scale-110' : 'bg-white/50')}
                aria-hidden
              />
            ))}
          </div>
        )}
        {/* Favorite heart */}
        <button
            type="button"
            onClick={handleFavorite}
            disabled={isToggling}
            className={cn(
              'absolute top-2 right-2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/45 transition-colors',
              isSaved && 'text-red-400',
              isToggling && 'opacity-60 pointer-events-none'
            )}
            aria-label={isSaved ? 'Удалить из избранного' : 'В избранное'}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0 p-4">
        <p className="text-[20px] font-bold text-[var(--text-main)] leading-tight mb-1">
          {formatPrice(price, 'night')}
        </p>
        <h3 className="text-[15px] font-semibold text-[var(--text-main)] line-clamp-2 mb-1">
          {title || 'Без названия'}
        </h3>
        <p className="text-[13px] text-[var(--text-secondary)] line-clamp-1 mb-3">
          {locationText}
        </p>

        {/* Owner: avatar, name, rating */}
        {showOwner && (
          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--border)]">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[var(--bg-glass)] flex-shrink-0">
              {owner?.avatar ? (
                <Image src={owner.avatar} alt="" fill className="object-cover" sizes="32px" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-[var(--text-secondary)]">
                  {(owner?.name || 'Г').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-[13px] font-medium text-[var(--text-main)] truncate flex-1 min-w-0">
              {owner?.name || 'Владелец'}
            </span>
            {displayRating != null && Number.isFinite(displayRating) && (
              <span className="text-[12px] text-[var(--text-secondary)] flex items-center gap-0.5 shrink-0">
                ★ {Number(displayRating).toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export const ListingCard = memo(ListingCardComponent)

/** Skeleton for listing card */
export function ListingCardSkeleton() {
  return (
    <div
      className={cn(
        'listing-card-unified flex flex-col h-full rounded-[18px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border)]'
      )}
    >
      <div className="w-full rounded-t-[18px] skeleton-glass" style={{ height: PHOTO_HEIGHT_MOBILE }} />
      <div className="flex flex-col flex-1 min-h-0 p-4 gap-2">
        <div className="h-6 w-28 rounded-lg skeleton-glass" />
        <div className="h-5 w-full rounded-lg skeleton-glass" />
        <div className="h-4 w-24 rounded-lg skeleton-glass" />
        <div className="mt-auto pt-2 border-t border-[var(--border)] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full skeleton-glass" />
          <div className="h-4 flex-1 rounded skeleton-glass" />
        </div>
      </div>
    </div>
  )
}
