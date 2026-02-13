'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useCallback, memo } from 'react'
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

/** TZ-3: единый ratio 4:3, desktop 320px, mobile 100% */
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

  return (
    <Link
      href={`/listings/${id}`}
      className={cn('block w-full max-w-[420px] h-full', className)}
      onClick={() => {
        if (typeof window !== 'undefined') {
          const viewed = Number(localStorage.getItem('locus_viewed_count') || '0') + 1
          localStorage.setItem('locus_viewed_count', String(viewed))
          localStorage.setItem('locus_last_activity', String(Date.now()))
          window.dispatchEvent(new Event('locus:listing-viewed'))
        }
        track('listing_view', { listingId: id, listingTitle: title, listingCity: city, listingPrice: price })
      }}
    >
      <article
        className={cn('listing-card bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col h-full min-h-[320px]', highlight && 'listing-card-glow')}
      >
        {/* TZ-5: aspect 4/3, первое фото eager */}
        <div
          className="listing-card__image-wrap relative w-full aspect-[4/3] overflow-hidden rounded-t-xl"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {displayPhoto && !imgError ? (
            <Image
              src={displayPhoto}
              alt={title || 'Фото жилья'}
              fill
              className="listing-card__image object-cover"
              loading={activePhotoIndex === 0 ? 'eager' : 'lazy'}
              sizes="(max-width: 768px) 100vw, 420px"
              onError={() => setImgError(true)}
              unoptimized={displayPhoto.startsWith('http')}
            />
          ) : null}
        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="listing-card__arrow listing-card__arrow--prev"
              aria-label="Предыдущее фото"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="listing-card__arrow listing-card__arrow--next"
              aria-label="Следующее фото"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
        {hasMultiplePhotos && (
          <div className="listing-card__dots" aria-hidden>
            {photos.map((_, i) => (
              <span key={i} className={cn('listing-card__dot', activePhotoIndex === i && 'is-active')} />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={isToggling}
          className={cn(
            'listing-card__favorite',
            isSaved && 'is-saved',
            isToggling && 'is-busy'
          )}
          aria-label={isSaved ? 'Удалить из избранного' : 'В избранное'}
        >
          <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        </div>

        <div className="listing-card__info p-3 flex flex-col gap-2 flex-1">
          <p className="listing-card__address">{locationText}</p>
          <div className="listing-card__rating-row">
            {rating != null && Number(rating) > 0 ? (
              <span className="listing-card__rating" aria-label={`Рейтинг ${rating}`}>
                <span className="listing-card__rating-star" aria-hidden>★</span>
                {Number(rating).toFixed(1)}
              </span>
            ) : (
              <span className="listing-card__rating listing-card__rating--empty">—</span>
            )}
          </div>
          <h3 className="listing-card__title listing-card__title--secondary">{title || 'Без названия'}</h3>
          {showOwner && (
            <div className="listing-card__owner">
              <div className="listing-card__owner-avatar">
                {owner?.avatar ? (
                  <Image src={owner.avatar} alt="" fill className="object-cover" sizes="24px" />
                ) : (
                  <span className="listing-card__owner-initial">{(owner?.name || 'Г').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="listing-card__owner-name">{owner?.name || 'Владелец'}</span>
            </div>
          )}
          <p className="listing-card__price mt-auto">{formatPrice(price, 'night')}</p>
        </div>
      </article>
    </Link>
  )
}

export const ListingCard = memo(ListingCardComponent)

/** TZ-5: skeleton — aspect 4/3, animate-pulse */
export function ListingCardSkeleton() {
  return (
    <div className="listing-card-skeleton w-full max-w-[420px]">
      <div className="listing-card-skeleton__photo aspect-[4/3] animate-pulse bg-[var(--bg-secondary)]" />
      <div className="listing-card-skeleton__info">
        <div className="listing-card-skeleton__line listing-card-skeleton__line--price" />
        <div className="listing-card-skeleton__line listing-card-skeleton__line--address" />
        <div className="listing-card-skeleton__line listing-card-skeleton__line--rating" />
        <div className="listing-card-skeleton__owner">
          <div className="listing-card-skeleton__avatar" />
          <div className="listing-card-skeleton__name" />
        </div>
      </div>
    </div>
  )
}
