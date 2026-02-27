'use client'

import Link from 'next/link'
import { useState, useCallback, memo } from 'react'
import { cn } from '@/shared/utils/cn'
import { track } from '@/shared/analytics/events'
import type { ListingCardProps, ListingCardBadge } from './ListingCard'

/** ТЗ-13: расширенные опции для next-gen карточки */
export interface ListingCardTZ13Props extends ListingCardProps {
  pricePerMonth?: number | null
  viewsCount?: number | null
  favoritesCount?: number | null
  availableToday?: boolean
  availableFrom?: string | null
  /** Минимум ночей (от N ночей) */
  minNights?: number | null
  /** AI совпадение 0–100 для блока "AI: N% совпадение" */
  aiMatchScore?: number | null
}

const BADGE_OVERLAY: Record<ListingCardBadge, string> = {
  verified: 'Проверено',
  ai: 'AI-подбор',
  top: 'Топ',
  new: 'Новое',
  discount: 'Скидка',
  rare: 'Редко',
  superhost: 'Суперхозяин',
  owner: 'Собственник',
  agent: 'Агент',
}

function ListingCardTZ13Component(props: ListingCardTZ13Props) {
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
    badges,
    propertyType,
    rating,
    reviewCount = null,
    isFavorite,
    onFavoriteToggle,
    className,
    aiRecommendTooltip,
    aiReasons,
    minNights,
    aiMatchScore,
  } = props

  const [imgError, setImgError] = useState(false)
  const [hover, setHover] = useState(false)
  const photos = photosProp?.length ? photosProp.map((p) => p.url) : photo ? [photo] : []
  const displayPhoto = photos[0] ?? photo ?? null
  const showPhoto = displayPhoto && !imgError

  const handleCardClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      const viewed = Number(localStorage.getItem('locus_viewed_count') || '0') + 1
      localStorage.setItem('locus_viewed_count', String(viewed))
      window.dispatchEvent(new Event('locus:listing-viewed'))
    }
    track('listing_view', { listingId: id, listingTitle: title, listingCity: city, listingPrice: price })
  }, [id, title, city, price])

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onFavoriteToggle?.()
    },
    [onFavoriteToggle]
  )

  const isNight = rentalType === 'night' || rentalType === 'посуточно' || !rentalType
  const hasPrice = price > 0 && Number.isFinite(price)
  const priceFormatted = hasPrice
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' ₽'
    : null
  const priceSuffix = isNight ? ' / ночь' : ' / мес'

  const ratingValue = rating != null && Number(rating) >= 0 ? Number(rating).toFixed(1) : null
  const isNewListing = badges?.includes('new') || (ratingValue == null && (reviewCount == null || reviewCount === 0))
  const minNightsLabel = minNights != null && minNights > 1 ? `от ${minNights} ночей` : null

  const locationLine = [city, district].filter(Boolean).join(' · ') || city || ''
  const metroLine = metro
    ? typeof metro === 'string' && metro.match(/\d+/)
      ? metro
      : '5 мин до метро'
    : null

  const typeLabel =
    propertyType === 'room'
      ? 'Комната'
      : propertyType === 'studio'
        ? 'Студия'
        : propertyType === 'house'
          ? 'Дом'
          : rooms != null && rooms > 0
            ? `${rooms}к`
            : 'кв'
  const paramsLine = [
    typeLabel,
    area != null && area > 0 ? `${area}м²` : null,
    guests != null && guests > 0 ? `${guests} гостей` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const topBadges = (badges ?? []).slice(0, 3)
  const aiReasonsList = Array.isArray(aiReasons) ? aiReasons : aiReasons ? [aiReasons] : []
  const aiTooltip = aiRecommendTooltip || aiReasonsList[0] || 'Подходит под ваш запрос'
  const showAiBlock = badges?.includes('ai') || aiMatchScore != null || aiRecommendTooltip || aiReasonsList.length > 0
  const aiScorePercent = aiMatchScore != null && aiMatchScore >= 0 ? Math.round(aiMatchScore) : null

  return (
    <article
      className={cn(
        'listing-card-tz13 group flex flex-col rounded-[16px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
        'focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2',
        className
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Фото: 4:3, max height, overlay бейджи слева, ♡ справа */}
      <Link href={`/listing/${id}`} onClick={handleCardClick} className="block flex-shrink-0 relative w-full overflow-hidden bg-[var(--bg-input)] aspect-[4/3] max-h-[240px]">
        {showPhoto ? (
          <img
            src={displayPhoto}
            alt=""
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-transform duration-300',
              hover && 'scale-[1.04]'
            )}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-4xl">
            📷
          </div>
        )}
        {/* Overlay слева: Проверено, AI-подбор, Новое */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {topBadges.map((b) => (
            <span
              key={b}
              className={cn(
                'rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--text-primary)] shadow-sm transition-opacity',
                'bg-white/95',
                hover && b === 'ai' && 'opacity-100'
              )}
            >
              {BADGE_OVERLAY[b] ?? b}
            </span>
          ))}
        </div>
        {/* Overlay справа: избранное */}
        <div className="absolute right-2 top-2">
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200',
              isFavorite ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-white/95 text-[var(--text-primary)] hover:bg-white'
            )}
          >
            <svg className={cn('w-5 h-5', isFavorite && 'fill-current')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-3 md:p-4">
        {/* Цена + рейтинг */}
        <div className="flex items-center justify-between gap-2">
          {priceFormatted ? (
            <p className="text-[16px] font-bold text-[var(--text-primary)]">
              {priceFormatted}{priceSuffix}
            </p>
          ) : (
            <span className="text-[14px] text-[var(--text-muted)]">Цена по запросу</span>
          )}
          {ratingValue != null && (
            <p className="text-[14px] font-medium text-[var(--text-primary)] flex items-center gap-1">
              <span aria-hidden>★</span> {ratingValue}
            </p>
          )}
        </div>
        {minNightsLabel && (
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{minNightsLabel}</p>
        )}
        {isNewListing && !minNightsLabel && (
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Новое объявление</p>
        )}

        {/* Локация */}
        <p className="text-[14px] text-[var(--text-secondary)] mt-2 truncate">{locationLine}</p>
        {metroLine && (
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{metroLine}</p>
        )}

        {/* AI-метрики */}
        {showAiBlock && (
          <div className="mt-3">
            {aiScorePercent != null ? (
              <div className="group/ai relative inline-block">
                <span className="text-[13px] text-[var(--accent)] font-medium">
                  AI: {aiScorePercent}% совпадение
                </span>
                <span
                  className="absolute left-0 top-full z-10 mt-1 hidden w-64 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] p-2 text-[12px] text-[var(--text-secondary)] shadow-lg group-hover/ai:block"
                  role="tooltip"
                >
                  {aiTooltip}
                </span>
              </div>
            ) : aiReasonsList.length > 0 ? (
              <div className="group/ai relative">
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Подходит для: {aiReasonsList.slice(0, 3).join(', ')}
                </p>
                {aiTooltip && aiTooltip !== aiReasonsList[0] && (
                  <span
                    className="absolute left-0 top-full z-10 mt-1 hidden w-64 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] p-2 text-[12px] text-[var(--text-secondary)] shadow-lg group-hover/ai:block"
                    role="tooltip"
                  >
                    {aiTooltip}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[12px] text-[var(--text-muted)]">{aiTooltip}</p>
            )}
          </div>
        )}

        {/* Параметры: 1к · 42м² · 4 гостя */}
        {paramsLine && (
          <p className="text-[13px] text-[var(--text-muted)] mt-2 truncate">{paramsLine}</p>
        )}

        {/* Кнопки: [♡] [Посмотреть] */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-[var(--border-main)]">
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            className={cn(
              'shrink-0 h-10 w-10 md:h-11 md:w-11 rounded-[12px] border border-[var(--border-main)] flex items-center justify-center transition-all duration-200 hover:bg-[var(--bg-secondary)] active:scale-95',
              isFavorite && 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30'
            )}
          >
            <svg className={cn('w-5 h-5 transition-all', isFavorite && 'fill-current scale-110')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <Link
            href={`/listing/${id}`}
            onClick={handleCardClick}
            className={cn(
              'flex-1 min-w-0 h-10 md:h-11 rounded-[12px] flex items-center justify-center font-semibold text-[14px]',
              'bg-[var(--accent)] text-[var(--button-primary-text)]',
              'hover:opacity-95 active:scale-[0.98] transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2'
            )}
          >
            Посмотреть
          </Link>
        </div>
      </div>
    </article>
  )
}

export const ListingCardTZ13 = memo(ListingCardTZ13Component)

/** ТЗ-13: skeleton под ту же структуру */
export function ListingCardTZ13Skeleton() {
  return (
    <div
      className={cn(
        'listing-card-tz13-skeleton flex flex-col rounded-[16px] overflow-hidden',
        'bg-[var(--bg-card)] border border-[var(--border-main)]'
      )}
    >
      <div className="w-full aspect-[4/3] max-h-[240px] skeleton-shimmer-tz12" />
      <div className="flex flex-col flex-1 p-3 md:p-4 gap-3">
        <div className="flex justify-between">
          <div className="h-5 w-24 rounded skeleton-shimmer-tz12" />
          <div className="h-5 w-10 rounded skeleton-shimmer-tz12" />
        </div>
        <div className="h-4 w-32 rounded skeleton-shimmer-tz12" />
        <div className="h-4 w-full rounded skeleton-shimmer-tz12" />
        <div className="h-4 w-3/4 rounded skeleton-shimmer-tz12" />
        <div className="h-4 w-1/2 rounded skeleton-shimmer-tz12 mt-1" />
        <div className="flex gap-2 mt-4 pt-2 border-t border-[var(--border-main)]">
          <div className="h-10 w-10 rounded-[12px] skeleton-shimmer-tz12" />
          <div className="h-10 flex-1 rounded-[12px] skeleton-shimmer-tz12" />
        </div>
      </div>
    </div>
  )
}
