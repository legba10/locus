'use client'

import Link from 'next/link'
import { useState, useCallback, memo } from 'react'
import { cn } from '@/shared/utils/cn'
import { track } from '@/shared/analytics/events'
import type { ListingCardProps, ListingCardBadge } from './ListingCard'

const SWIPE_THRESHOLD = 50
const ASPECT_RATIO = 16 / 10
const COMPACT_CARD_MAX_HEIGHT = 220
const MINI_PREVIEWS = 5
const SHORT_DESC_MAX = 140

const BADGE_LABELS: Record<ListingCardBadge, string> = {
  verified: 'Проверено документами',
  ai: 'AI',
  top: 'PRO',
  new: 'Новое',
  discount: 'Скидка',
  rare: 'Редко',
  superhost: 'Суперхозяин',
  owner: 'Собственник',
  agent: 'Агент',
}

function ListingCardV2Component(props: ListingCardProps) {
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
    floor,
    totalFloors,
    badges,
    rating,
    reviewCount,
    compact = false,
    className,
    propertyType,
  } = props

  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [imgError, setImgError] = useState(false)

  const photos = photosProp?.length
    ? photosProp.map((p) => p.url)
    : photo ? [photo] : []
  const displayPhoto = photos[activePhotoIndex] ?? photo ?? null
  const hasMultiplePhotos = photos.length > 1
  const showPhoto = displayPhoto && !imgError
  const previews = photos.slice(0, MINI_PREVIEWS)

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
      ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' ₽'
      : 'Цена по запросу'
  const typeLabel = rentalType === 'month' || rentalType === 'месяц' ? '/ мес' : 'посуточно'

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

  const line1Parts: string[] = []
  if (rooms != null && rooms > 0) line1Parts.push(`${rooms}-комн`)
  if (area != null && area > 0) line1Parts.push(`${area} м²`)
  if (floor != null && floor > 0) {
    line1Parts.push(totalFloors != null && totalFloors > 0 ? `${floor}/${totalFloors} этаж` : `${floor} этаж`)
  }
  const line1 = line1Parts.join(' • ')
  const metroText = metro ? (typeof metro === 'string' && metro.match(/\d+/) ? metro : `5 мин метро`) : null
  const line2 = [city, metroText].filter(Boolean).join(' • ') || city || ''
  const shortDesc = (props as { shortDescription?: string }).shortDescription ?? title
  const descTruncated = shortDesc.length > SHORT_DESC_MAX ? shortDesc.slice(0, SHORT_DESC_MAX - 3) + '…' : shortDesc

  if (compact) {
    return (
      <Link
        href={`/listing/${id}`}
        className={cn(
          'flex rounded-[18px] overflow-hidden max-h-[220px]',
          'bg-[var(--bg-card)] border border-[var(--border-main)]',
          'transition-shadow hover:shadow-lg',
          className
        )}
        onClick={handleCardClick}
      >
        <div
          className="relative w-[140px] sm:w-[180px] flex-shrink-0 overflow-hidden select-none"
          style={{ height: COMPACT_CARD_MAX_HEIGHT, minHeight: 160 }}
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
            <div className="w-full h-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] text-2xl">
              📷
            </div>
          )}
          {hasMultiplePhotos && (
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[11px] tabular-nums">
              {activePhotoIndex + 1}/{photos.length}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">{priceFormatted}</p>
          {district && <p className="text-[13px] text-[var(--text-secondary)] truncate">{district}</p>}
          {line1 && <p className="text-[12px] text-[var(--text-muted)] truncate">{line1}</p>}
          {line2 && <p className="text-[12px] text-[var(--text-muted)] truncate">{line2}</p>}
          {rating != null && (
            <p className="text-[12px] text-amber-600 mt-0.5">★ {rating.toFixed(1)}</p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/listing/${id}`}
      className={cn(
        'block rounded-[18px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'pb-3 transition-shadow hover:shadow-lg',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Блок 1 — Фото 16:10 + цена, тип, рейтинг, бейджи */}
      <div
        className="relative w-full overflow-hidden select-none"
        style={{ aspectRatio: ASPECT_RATIO }}
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
          <div className="w-full h-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] text-4xl">
            📷
          </div>
        )}

        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-[10px] px-2.5 py-1.5 text-white font-semibold text-[14px]"
              style={{ background: 'rgba(0,0,0,0.65)' }}
            >
              {priceFormatted} {typeLabel}
            </span>
            {badges?.slice(0, 2).map((b) => (
              <span
                key={b}
                className="rounded-lg px-2 py-1 text-[11px] font-medium bg-white/95 text-[var(--text-primary)]"
              >
                {BADGE_LABELS[b] ?? b}
              </span>
            ))}
          </div>
          {rating != null && (
            <span className="rounded-lg px-2 py-1 text-[12px] font-medium bg-black/50 text-white flex items-center gap-1">
              ★ {rating.toFixed(1)}
              {reviewCount != null && reviewCount > 0 && (
                <span className="opacity-90">({reviewCount})</span>
              )}
            </span>
          )}
        </div>

        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
              aria-label="Предыдущее фото"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
              aria-label="Следующее фото"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs tabular-nums">
              {activePhotoIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Мини-галерея: 5 превью */}
      {previews.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto scrollbar-none">
          {previews.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePhotoIndex(i) }}
              className={cn(
                'flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors',
                activePhotoIndex === i ? 'border-[var(--accent)]' : 'border-transparent opacity-80 hover:opacity-100'
              )}
            >
              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Блок 2 — Основная инфа */}
      <div className="px-3 pt-3">
        {line1 && <p className="text-[14px] font-medium text-[var(--text-primary)]">{line1}</p>}
        {line2 && <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{line2}</p>}
        {district && <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{district}</p>}
      </div>

      {/* Блок 3 — Быстрые параметры (сетка иконки + текст) */}
      <div className="px-3 pt-2">
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-[12px] text-[var(--text-muted)]">
          {rooms != null && rooms > 0 && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🛏</span> {rooms} комн
            </span>
          )}
          {area != null && area > 0 && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden>📐</span> {area} м²
            </span>
          )}
          {floor != null && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🏢</span> {totalFloors != null ? `${floor}/${totalFloors}` : floor} эт
            </span>
          )}
          {propertyType && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden>🏠</span> {propertyType === 'apartment' ? 'Квартира' : propertyType === 'room' ? 'Комната' : propertyType}
            </span>
          )}
        </div>
      </div>

      {/* Блок 4 — Краткое описание (2 строки, до 140 символов) */}
      {descTruncated && (
        <div className="px-3 pt-2">
          <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">{descTruncated}</p>
        </div>
      )}

      {/* Блок 5 — Быстрые действия */}
      <div className="px-3 pt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 bg-[var(--bg-input)] text-[13px] text-[var(--text-secondary)]">
          ❤️ сохранить
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 bg-[var(--bg-input)] text-[13px] text-[var(--text-secondary)]">
          💬 написать
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 bg-[var(--bg-input)] text-[13px] text-[var(--text-secondary)]">
          📞 позвонить
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 bg-[var(--accent)] text-[13px] font-medium text-[var(--button-primary-text)]">
          📅 забронировать
        </span>
      </div>
    </Link>
  )
}

export const ListingCardV2 = memo(ListingCardV2Component)

export function ListingCardV2Skeleton() {
  return (
    <div
      className={cn(
        'rounded-[18px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'pb-3'
      )}
    >
      <div
        className="w-full skeleton-shimmer-tz12"
        style={{ aspectRatio: ASPECT_RATIO }}
      />
      <div className="px-3 pt-3 space-y-2">
        <div className="h-4 w-3/4 rounded skeleton-shimmer-tz12" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer-tz12" />
        <div className="h-3 w-2/5 rounded skeleton-shimmer-tz12" />
        <div className="h-8 w-full rounded-[10px] skeleton-shimmer-tz12" />
      </div>
    </div>
  )
}
