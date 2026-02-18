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
  /** ТЗ 15: цена за месяц (при показе по ночам) */
  pricePerMonth?: number | null
  /** ТЗ 15: процент ответов владельца */
  responseRate?: number | null
  /** ТЗ 15: AI оценка района (0–10) */
  aiDistrictScore?: number | null
  /** ТЗ 15: одна строка описания (если нет — используется title) */
  shortDescription?: string | null
}

const SWIPE_THRESHOLD = 50

/** ТЗ 15: соотношение фото — desktop 4:3, mobile 3:2; высота уменьшена (~15% от прежних 220px) */
const PHOTO_ASPECT_DESKTOP = 4 / 3
const PHOTO_ASPECT_MOBILE = 3 / 2

const BADGE_LABELS: Record<ListingCardBadge, string> = {
  ai: 'AI рекомендует',
  verified: 'Проверено',
  top: 'Топ-район',
  new: 'Новое',
  discount: 'Скидка',
  rare: 'Редко',
  superhost: 'Суперхозяин',
  owner: 'Собственник',
  agent: 'Агент',
}

function ListingCardComponent(props: ListingCardProps) {
  const {
    id,
    photo,
    photos: photosProp,
    title,
    price,
    city,
    district,
    metro,
    rentalType,
    rooms,
    area,
    guests,
    floor,
    totalFloors,
    badges,
    rating,
    reviewCount,
    owner,
    amenities,
    className,
    onFavoriteToggle,
    isFavorite,
    pricePerMonth,
    responseRate,
    aiDistrictScore,
    shortDescription,
  } = props

  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [imgError, setImgError] = useState(false)
  const [hover, setHover] = useState(false)

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

  const goPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()
      if (!hasMultiplePhotos) return
      setActivePhotoIndex((i) => (i - 1 + photos.length) % photos.length)
    },
    [hasMultiplePhotos, photos.length]
  )
  const goNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()
      if (!hasMultiplePhotos) return
      setActivePhotoIndex((i) => (i + 1) % photos.length)
    },
    [hasMultiplePhotos, photos.length]
  )

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

  const isNight = rentalType === 'night' || rentalType === 'посуточно' || !rentalType
  const priceMain =
    price > 0 && Number.isFinite(price)
      ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' ₽'
      : 'Цена по запросу'
  const priceSuffix = isNight ? ' / ночь' : ' / мес'
  const priceMonth =
    pricePerMonth != null && pricePerMonth > 0 && isNight
      ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(pricePerMonth) + ' ₽ / мес'
      : null

  const locationLine = [city, district].filter(Boolean).join(' • ') || city || ''
  const metroText = metro ? (typeof metro === 'string' && metro.match(/\d+/) ? metro : '5 мин метро') : null

  const topBadges = (badges ?? []).slice(0, 2).map((b) => BADGE_LABELS[b] || b)
  const showVerifiedOwner = Boolean(owner?.rating && owner.rating >= 4.5) || badges?.includes('verified')

  const amenityLabels: string[] = []
  if (amenities?.includes('wifi')) amenityLabels.push('Wi-Fi')
  if (amenities?.includes('parking')) amenityLabels.push('Парковка')
  if (amenities?.some((a) => a === 'center' || a === 'metro') || amenityLabels.length < 3) {
    if (!amenityLabels.includes('Кондиционер')) amenityLabels.push('Кондиционер')
  }
  const displayAmenities = amenityLabels.slice(0, 3)

  const descLine = (shortDescription || title || 'Без названия').trim()
  const descTruncated = descLine.length > 60 ? descLine.slice(0, 57) + '…' : descLine

  return (
    <div
      className={cn(
        'rounded-[18px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'transition-all duration-200 hover:shadow-lg',
        className
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/listings/${id}`} onClick={handleCardClick} className="block">
        {/* ТЗ 15: блок фото — 4:3 (desktop), 3:2 (mobile); счётчик; бейджи */}
        <div
          className={cn(
            'relative w-full rounded-t-[18px] overflow-hidden select-none max-h-[200px]',
            'aspect-[3/2] md:aspect-[4/3]'
          )}
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
            <div className="w-full h-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] text-3xl min-h-[140px]">
              📷
            </div>
          )}

          {/* AI-бейджи: левый верхний угол */}
          {topBadges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {topBadges.map((label) => (
                <span
                  key={label}
                  className="rounded-lg px-2 py-0.5 text-[11px] font-medium text-white bg-black/55 backdrop-blur"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Счётчик фото */}
          {photos.length > 1 && (
            <div className="absolute top-2 right-2 rounded-lg px-2 py-0.5 text-[11px] font-medium text-white bg-black/55">
              {photos.length} фото
            </div>
          )}

          {/* Hover: стрелки листания (ПК) */}
          {hasMultiplePhotos && (hover || photos.length > 1) && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors hidden sm:flex"
                aria-label="Предыдущее фото"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors hidden sm:flex"
                aria-label="Следующее фото"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          {/* Точки индикатора (mobile) */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:hidden" aria-hidden>
              {photos.slice(0, 7).map((_, i) => (
                <span
                  key={i}
                  className={cn('w-1.5 h-1.5 rounded-full', activePhotoIndex === i ? 'bg-white' : 'bg-white/50')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Контент под фото: цена, локация, параметры, доверие, описание, удобства, CTA */}
        <div className="px-3 pt-3 pb-3">
          {/* Цена */}
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[17px] font-bold text-[var(--text-primary)]">
              {priceMain}{price > 0 ? priceSuffix : ''}
            </span>
            {priceMonth && (
              <span className="text-[13px] text-[var(--text-muted)]">{priceMonth}</span>
            )}
          </div>
          {price > 0 && (
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">сервис 7% включён</p>
          )}

          {/* Локация */}
          <p className="mt-2 text-[14px] text-[var(--text-secondary)] truncate">
            {locationLine}
            {metroText ? ` • ${metroText}` : ''}
          </p>

          {/* Быстрые параметры: гости, спальни, м² */}
          <div className="mt-2 flex flex-wrap gap-3 text-[13px] text-[var(--text-muted)]">
            {guests != null && guests > 0 && (
              <span className="flex items-center gap-1">
                <span aria-hidden>👤</span> {guests} {guests === 1 ? 'гость' : 'гостя'}
              </span>
            )}
            {rooms != null && rooms > 0 && (
              <span className="flex items-center gap-1">
                <span aria-hidden>🛏</span> {rooms} {rooms === 1 ? 'спальня' : 'спальни'}
              </span>
            )}
            {area != null && area > 0 && (
              <span className="flex items-center gap-1">
                <span aria-hidden>📐</span> {area} м²
              </span>
            )}
          </div>

          {/* Метрики доверия */}
          {(rating != null || (reviewCount != null && reviewCount > 0) || responseRate != null || aiDistrictScore != null) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--text-secondary)]">
              {rating != null && rating > 0 && (
                <span className="font-medium text-[var(--text-primary)]">{Number(rating).toFixed(1)} ★</span>
              )}
              {reviewCount != null && reviewCount > 0 && (
                <span>{reviewCount} отзывов</span>
              )}
              {responseRate != null && responseRate > 0 && (
                <span>{responseRate}% ответов</span>
              )}
              {aiDistrictScore != null && aiDistrictScore > 0 && (
                <span className="text-[var(--accent)]">AI район: {Number(aiDistrictScore).toFixed(1)}</span>
              )}
            </div>
          )}

          {/* Мини-описание (1 строка) */}
          <p className="mt-1.5 text-[14px] text-[var(--text-primary)] line-clamp-1">{descTruncated}</p>

          {/* Удобства: до 3 */}
          {displayAmenities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {displayAmenities.map((a) => (
                <span
                  key={a}
                  className="rounded-md px-2 py-0.5 text-[11px] bg-[var(--bg-input)] text-[var(--text-secondary)]"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Проверенный владелец */}
          {showVerifiedOwner && (
            <p className="mt-1.5 text-[12px] text-[var(--accent)] font-medium">Проверенный владелец</p>
          )}
        </div>
      </Link>

      {/* CTA: Избранное, Сравнить (вне основного Link) */}
      <div className="px-3 pb-3 flex items-center gap-2">
        <Link
          href={`/listings/${id}`}
          onClick={handleCardClick}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] hover:opacity-95 transition-opacity"
        >
          Посмотреть
        </Link>
        {onFavoriteToggle && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFavoriteToggle() }}
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl border border-[var(--border-main)] flex items-center justify-center transition-colors',
              isFavorite ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'
            )}
            aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        )}
        <Link
          href={`/listings/${id}`}
          onClick={handleCardClick}
          className="shrink-0 w-10 h-10 rounded-xl border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
          aria-label="Сравнить"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </Link>
      </div>
    </div>
  )
}

export const ListingCard = memo(ListingCardComponent)

/** ТЗ 15: скелетон — те же пропорции 3:2 / 4:3 */
export function ListingCardSkeleton() {
  return (
    <div
      className={cn(
        'rounded-[18px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]'
      )}
    >
      <div className="w-full aspect-[3/2] md:aspect-[4/3] max-h-[200px] skeleton-shimmer-tz12 rounded-t-[18px]" />
      <div className="px-3 pt-3 pb-3 space-y-2">
        <div className="h-5 w-1/3 rounded skeleton-shimmer-tz12" />
        <div className="h-3 w-2/3 rounded skeleton-shimmer-tz12" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer-tz12" />
        <div className="h-3 w-4/5 rounded skeleton-shimmer-tz12" />
      </div>
      <div className="px-3 pb-3 flex gap-2">
        <div className="h-10 flex-1 rounded-xl skeleton-shimmer-tz12" />
        <div className="h-10 w-10 rounded-xl skeleton-shimmer-tz12" />
      </div>
    </div>
  )
}
