'use client'

import Link from 'next/link'
import { useState, useCallback, memo } from 'react'
import { cn } from '@/shared/utils/cn'
import { track } from '@/shared/analytics/events'
import type { ListingCardProps, ListingCardBadge } from './ListingCard'

/** ТЗ 7: расширенные опции для карточки (просмотры, сохранения, доступность) */
export interface ListingCardTZ7Props extends ListingCardProps {
  pricePerMonth?: number | null
  viewsCount?: number | null
  favoritesCount?: number | null
  availableToday?: boolean
  availableFrom?: string | null
}

/** ТЗ 19: метки на фото — проверено, AI подобрано, топ, новый объект, суперхозяин */
const BADGE_OVERLAY: Record<ListingCardBadge, string> = {
  verified: 'Проверено',
  ai: 'AI подобрано',
  top: 'Топ',
  new: 'Новый объект',
  discount: 'Скидка',
  rare: 'Редко',
  superhost: 'Суперхозяин',
  owner: 'Собственник',
  agent: 'Агент',
}

function ListingCardTZ7Component(props: ListingCardTZ7Props) {
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
    propertyType,
    pricePerMonth,
    viewsCount,
    favoritesCount,
    availableToday,
    availableFrom,
    isFavorite,
    onFavoriteToggle,
    className,
    aiRecommendTooltip,
    rating,
  } = props

  const [imgError, setImgError] = useState(false)
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
  const priceMain = price > 0 && Number.isFinite(price)
    ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' ₽'
    : 'Цена по запросу'
  const priceSuffix = isNight ? '/ ночь' : '/ мес'
  const priceSecondary =
    pricePerMonth != null && pricePerMonth > 0 && isNight
      ? `или ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(pricePerMonth)} ₽ / месяц`
      : null

  const typeLabel =
    propertyType === 'room'
      ? 'Комната'
      : propertyType === 'studio'
        ? 'Студия'
        : propertyType === 'house'
          ? 'Дом'
          : rooms != null && rooms > 0
            ? `${rooms}-к квартира`
            : 'Квартира'
  const districtShort = district || 'центр'
  const metroText = metro ? (typeof metro === 'string' && metro.match(/\d+/) ? `до метро ${metro}` : 'до метро 5 мин') : 'до метро 5 мин'
  const datesLine = availableToday ? 'даты свободны сегодня' : availableFrom ? `С ${availableFrom}` : null

  const topBadges = badges?.slice(0, 3) ?? []
  const ratingValue = rating != null && Number(rating) >= 0 ? Number(rating) : null
  const locationLine = [city, district].filter(Boolean).join(', ') || city || ''

  return (
    <Link
      href={`/listing/${id}`}
      onClick={handleCardClick}
      className={cn(
        'group block rounded-[16px] p-4 sm:p-[12px] gap-2',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
        className
      )}
    >
      {/* ТЗ 19: Фото — 4:3, без растяжения, lazy; оверлеи: бейджи, избранное, цена, рейтинг */}
      <div className="relative w-full overflow-hidden rounded-[12px] bg-[var(--bg-input)] aspect-[4/3]">
        {showPhoto ? (
          <img
            src={displayPhoto}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-4xl">
            📷
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 pointer-events-none" />

        {/* Верх фото: бейджи слева */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {topBadges.map((b) => (
            <span
              key={b}
              className="rounded-lg bg-white/95 px-2 py-1 text-[11px] font-semibold text-[var(--text-primary)] shadow-sm"
            >
              {BADGE_OVERLAY[b] ?? b}
            </span>
          ))}
        </div>

        {/* Верх фото: избранное справа */}
        <div className="absolute right-2 top-2">
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              isFavorite ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-white/95 text-[var(--text-primary)] hover:bg-white'
            )}
          >
            <span className="text-lg">{isFavorite ? '❤️' : '♡'}</span>
          </button>
        </div>

        {/* Низ фото: слева цена / ночь, справа рейтинг ★ */}
        <div className="absolute inset-x-0 bottom-0 rounded-b-[12px] h-14 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 flex items-end justify-between">
          <p className="text-[14px] font-bold text-white drop-shadow-sm">{priceMain} {priceSuffix}</p>
          {ratingValue != null && (
            <p className="text-[13px] font-medium text-white/95 flex items-center gap-1">
              <span aria-hidden>★</span> {Number(ratingValue).toFixed(1)}
            </p>
          )}
        </div>
      </div>

      {/* ТЗ 19: Блок 2 под фото — 4 строки инфо */}
      <div className="flex flex-col gap-0.5 pt-2">
        <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">
          {typeLabel} · {area != null && area > 0 ? `${area} м²` : '—'} · {districtShort}
        </p>
        <p className="text-[13px] text-[var(--text-secondary)] truncate">{locationLine}</p>
        <p className="text-[12px] text-[var(--text-muted)]">{metroText}</p>
        {datesLine && <p className="text-[12px] text-[var(--text-muted)]">{datesLine}</p>}
      </div>

      {/* ТЗ 19: Блок 3 — AI пояснение (маленький серый текст) */}
      {(badges?.includes('ai') || aiRecommendTooltip) && (
        <p className="text-[12px] text-[var(--text-muted)] pt-0.5">
          {aiRecommendTooltip || 'Подходит под ваш бюджет'}
        </p>
      )}

      {/* ТЗ 19: Мини-аналитика — просмотров сегодня, сохранений */}
      {(viewsCount != null || favoritesCount != null) && (
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] pt-1">
          {viewsCount != null && <span>просмотров сегодня {viewsCount}</span>}
          {favoritesCount != null && <span>сохранений {favoritesCount}</span>}
        </div>
      )}
    </Link>
  )
}

export const ListingCardTZ7 = memo(ListingCardTZ7Component)

export function ListingCardTZ7Skeleton() {
  return (
    <div
      className={cn(
        'rounded-[16px] p-4 sm:p-[12px] gap-2',
        'bg-[var(--bg-card)] border border-[var(--border-main)]'
      )}
    >
      <div className="rounded-[12px] bg-[var(--bg-input)] animate-pulse aspect-[4/3] w-full" />
      <div className="pt-2 space-y-2">
        <div className="h-5 w-2/3 rounded bg-[var(--bg-input)] animate-pulse" />
        <div className="h-4 w-full rounded bg-[var(--bg-input)] animate-pulse" />
        <div className="flex gap-2">
          <div className="h-3 w-16 rounded bg-[var(--bg-input)] animate-pulse" />
          <div className="h-3 w-20 rounded bg-[var(--bg-input)] animate-pulse" />
        </div>
      </div>
      <div className="h-10 rounded-[12px] bg-[var(--bg-input)] animate-pulse mt-2" />
    </div>
  )
}
