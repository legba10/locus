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

const BADGE_OVERLAY: Record<ListingCardBadge, string> = {
  verified: 'Проверено',
  ai: 'AI рекомендует',
  top: 'Топ вариант',
  new: 'Новое',
  discount: 'Скидка',
  rare: 'Редко',
  superhost: 'Суперхозяин',
  owner: 'Собственник',
  agent: 'Агент',
}

const PHOTO_HEIGHT_PC = 220
const PHOTO_HEIGHT_MOBILE = 200

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
  const locationLine = [city, district].filter(Boolean).join(' • ') || city || ''
  const metroText = metro ? (typeof metro === 'string' && metro.match(/\d+/) ? metro : '5 мин метро') : null

  const topBadges = badges?.slice(0, 3) ?? []

  return (
    <Link
      href={`/listings/${id}`}
      onClick={handleCardClick}
      className={cn(
        'group block rounded-[16px] p-4 sm:p-[12px] gap-2',
        'bg-[var(--bg-card)] border border-[var(--border-main)]',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
        className
      )}
    >
      {/* 1. Фото — ПК 220px, моб 200px, 4/3 cover; оверлеи */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-[12px] bg-[var(--bg-input)]',
          'h-[200px] lg:h-[220px]'
        )}
      >
        {showPhoto ? (
          <img
            src={displayPhoto}
            alt=""
            className="h-full w-full object-cover transition-all duration-200 group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)] text-4xl">
            📷
          </div>
        )}
        {/* Затемнение при hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 pointer-events-none" />

        {/* Оверлей слева сверху — бейджи */}
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

        {/* Оверлей справа сверху — избранное */}
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

        {/* Оверлей снизу — градиент + тип + локация */}
        <div className="absolute inset-x-0 bottom-0 rounded-b-[12px] h-20 bg-gradient-to-t from-black/75 to-transparent pt-6 px-3 pb-2">
          <p className="text-[13px] font-semibold text-white truncate">{typeLabel}</p>
          <p className="text-[12px] text-white/90 truncate">{locationLine}</p>
        </div>
      </div>

      {/* 2. Основной блок — цена, характеристики, AI, даты */}
      <div className="flex flex-col gap-2 pt-1">
        <div>
          <p className="text-[18px] font-bold text-[var(--text-primary)] leading-tight">
            {priceMain} {priceSuffix}
          </p>
          {priceSecondary && (
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{priceSecondary}</p>
          )}
        </div>

        {/* Характеристики в строку */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--text-muted)]">
          {guests != null && guests > 0 && (
            <span className="flex items-center gap-1">
              <span aria-hidden>🛏</span> {guests} гостей
            </span>
          )}
          {rooms != null && rooms > 0 && (
            <span className="flex items-center gap-1">
              <span aria-hidden>🛋</span> {rooms} {rooms === 1 ? 'комната' : 'комн.'}
            </span>
          )}
          {area != null && area > 0 && (
            <span className="flex items-center gap-1">
              <span aria-hidden>📐</span> {area} м²
            </span>
          )}
          {metroText && (
            <span className="flex items-center gap-1">
              <span aria-hidden>🚇</span> {metroText}
            </span>
          )}
        </div>

        {/* AI-метка */}
        {(badges?.includes('ai') || aiRecommendTooltip) && (
          <p className="text-[12px] font-medium text-[var(--accent)]">
            {aiRecommendTooltip || 'Подобрано для вас'}
          </p>
        )}

        {/* Даты */}
        {(availableToday || availableFrom) && (
          <p className="text-[12px] text-[var(--text-secondary)]">
            {availableToday ? 'Свободно сегодня' : availableFrom ? `С ${availableFrom}` : ''}
          </p>
        )}
      </div>

      {/* 3. Блок доверия */}
      {(viewsCount != null || favoritesCount != null) && (
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
          {viewsCount != null && <span>{viewsCount} просмотров за неделю</span>}
          {favoritesCount != null && <span>{favoritesCount} сохранения</span>}
        </div>
      )}

      {/* 4. Кнопка */}
      <div className="pt-1">
        <span
          className={cn(
            'inline-flex w-full items-center justify-center rounded-[12px] py-2.5 text-[14px] font-semibold transition-colors',
            'bg-[var(--accent)] text-[var(--button-primary-text)]'
          )}
        >
          Смотреть
        </span>
      </div>
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
      <div
        className="rounded-[12px] bg-[var(--bg-input)] animate-pulse h-[200px] lg:h-[220px]"
      />
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
