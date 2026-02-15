'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useCallback, memo } from 'react'
import { cn } from '@/shared/utils/cn'
import { RU } from '@/core/i18n/ru'
import { isValidImageUrl } from '@/shared/utils/imageUtils'
import { apiFetch } from '@/shared/utils/apiFetch'
import { track } from '@/shared/analytics/events'
import { useToast } from '@/shared/contexts/ToastContext'

export interface ListingCardOwner {
  id: string
  name: string
  avatar: string | null
  rating?: number | null
}

/** ТЗ-4: бейджи — максимум 2, фиолетовые/синие */
export type ListingCardBadge = 'verified' | 'ai' | 'top' | 'new' | 'discount' | 'rare'

export interface ListingCardProps {
  id: string
  photo?: string | null
  photos?: Array<{ url: string }>
  title: string
  price: number
  city: string
  district?: string | null
  /** Метро (показывается на фото и в локации) */
  metro?: string | null
  /** Тип аренды: Посуточно, Долгосрочно, Комната, Студия */
  rentalType?: 'night' | 'month' | 'room' | 'studio' | string
  /** Комнаты, площадь, гостей, этаж — для метрик */
  rooms?: number
  area?: number
  guests?: number
  floor?: number
  totalFloors?: number
  /** AI: одна строка пояснения или массив причин (склеиваем в одну строку) */
  aiReasons?: string | string[] | null
  /** Бейджи (макс 2 показываем): Проверено, Подобрано AI, Топ, Новое, Скидка, Редкое */
  badges?: ListingCardBadge[]
  owner?: ListingCardOwner | null
  rating?: number | null
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  className?: string
  highlight?: boolean
  /** ТЗ-4: компактный вид без кнопок и AI (только фото, бейджи, цена, локация) */
  compact?: boolean
}

const BADGE_LABELS: Record<ListingCardBadge, string> = {
  verified: 'Проверено LOCUS',
  ai: 'Подобрано AI',
  top: 'Топ вариант',
  new: 'Новое',
  discount: 'Скидка',
  rare: 'Редкое',
}

const RENTAL_LABELS: Record<string, string> = {
  night: 'Посуточно',
  month: 'Долгосрочно',
  room: 'Комната',
  studio: 'Студия',
}

const SWIPE_THRESHOLD = 50

function ListingCardComponent({
  id,
  photo,
  photos: photosProp,
  title,
  price,
  city,
  district,
  metro,
  rentalType = 'night',
  rooms,
  area,
  guests,
  floor,
  totalFloors,
  aiReasons,
  badges = [],
  owner,
  rating,
  isFavorite = false,
  onFavoriteToggle,
  className,
  highlight = false,
  compact = false,
}: ListingCardProps) {
  const { toast } = useToast()
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
      ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ` ${RU.price.currency}`
      : RU.price.on_request
  const priceSuffix = rentalType === 'month' ? RU.price.per_month : RU.price.per_night
  const rentalLabel = RENTAL_LABELS[rentalType] || (rentalType === 'month' ? 'Долгосрочно' : 'Посуточно')

  const displayBadges = badges.slice(0, 2)
  const locationText = [city, district].filter(Boolean).join(' • ') || city
  const aiLine = Array.isArray(aiReasons)
    ? aiReasons.slice(0, 2).join('. ')
    : typeof aiReasons === 'string'
      ? aiReasons
      : null
  const metrics: string[] = []
  if (rooms != null && rooms > 0) metrics.push(`${rooms} ${rooms === 1 ? 'комната' : 'комн.'}`)
  if (area != null && area > 0) metrics.push(`${area} м²`)
  if (guests != null && guests > 0) metrics.push(`${guests} гостей`)
  if (floor != null && floor > 0) metrics.push(`${floor} этаж`)
  const metricsText = metrics.join(' · ')
  const showOwner = owner?.name || owner?.avatar

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
        .then(() => {
          onFavoriteToggle?.()
          toast({ type: 'success', message: newState ? 'Добавлено' : 'Удалено' })
        })
        .catch(() => {
          setIsSaved(!newState)
          toast({ type: 'error', message: 'Что-то пошло не так' })
        })
        .finally(() => setIsToggling(false))
    },
    [id, isSaved, isToggling, onFavoriteToggle, toast]
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

  return (
    <Link
      href={`/listings/${id}`}
      className="block"
      onClick={handleCardClick}
    >
      <article
        className={cn(
          'listing-card listing-card-tz4',
          highlight && 'listing-card-glow',
          compact && 'listing-card-tz4--compact',
          className
        )}
      >
        {/* ТЗ-4: фото — слева сверху бейдж (Проверено/Подобрано AI), справа избранное, снизу район + метро */}
        <div
          className="listing-card__image-wrap"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {displayPhoto && !imgError ? (
            <Image
              src={displayPhoto}
              alt={title || 'Фото жилья'}
              fill
              className="listing-card__image object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 320px"
              onError={() => setImgError(true)}
              unoptimized={displayPhoto.startsWith('http')}
            />
          ) : (
            <div className="listing-card__image-placeholder" aria-hidden>
              <span className="listing-card__image-placeholder-text">Нет фото</span>
            </div>
          )}
          {/* ТЗ-4: бейдж слева сверху на фото — один: «Подобрано AI» или «Проверено» */}
          {displayBadges.length > 0 && (
            <span className="listing-card-tz4__photo-badge listing-card-tz4__photo-badge--left">
              {displayBadges.includes('ai') ? BADGE_LABELS.ai : displayBadges.includes('verified') ? BADGE_LABELS.verified : BADGE_LABELS[displayBadges[0]]}
            </span>
          )}
          {/* Избранное справа сверху */}
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
          {/* Снизу на фото: район, метро */}
          {(district || metro) && (
            <div className="listing-card-tz4__photo-footer">
              {district && <span>📍 {district}</span>}
              {metro && <span>🚇 {metro}</span>}
            </div>
          )}
          {hasMultiplePhotos && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); goPrev() }}
                className="listing-card__arrow listing-card__arrow--prev"
                aria-label="Предыдущее фото"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); goNext() }}
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
        </div>

        <div className="listing-card__info listing-card-tz4__info">
          {/* ТЗ-4: бейджи под фото (макс 2) */}
          {displayBadges.length > 0 && (
            <div className="listing-card-tz4__badges">
              {displayBadges.map((b) => (
                <span key={b} className="listing-card-tz4__badge">{BADGE_LABELS[b]}</span>
              ))}
            </div>
          )}

          {/* ТЗ-4: цена — главный акцент, формат "3 000 ₽ / ночь" */}
          <p className="listing-card__price-block listing-card-tz4__price-block">
            <span className="listing-card__price listing-card-tz4__price">{priceFormatted}</span>
            {price > 0 && Number.isFinite(price) && (
              <span className="listing-card__price-suffix listing-card-tz4__price-suffix">{priceSuffix}</span>
            )}
          </p>

          {/* Тип аренды */}
          <p className="listing-card-tz4__rental-type">{rentalLabel}</p>

          {/* Локация: Москва • Таганская */}
          <p className="listing-card__address listing-card-tz4__location">{locationText}</p>

          {/* Метрики: 2 комнаты · 45 м² · 4 гостей · 7 этаж */}
          {metricsText && <p className="listing-card-tz4__metrics">{metricsText}</p>}

          {/* AI пояснение — одна строка */}
          {!compact && aiLine && (
            <p className="listing-card-tz4__ai">
              <span className="listing-card-tz4__ai-label">AI рекомендует:</span> {aiLine}
            </p>
          )}

          {/* Рейтинг (если есть) */}
          {rating != null && Number(rating) > 0 && (
            <div className="listing-card__rating-row">
              <span className="listing-card__rating" aria-label={`Рейтинг ${rating}`}>
                <span className="listing-card__rating-star" aria-hidden>★</span>
                {Number(rating).toFixed(1)}
              </span>
            </div>
          )}

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

          {/* ТЗ-4: кнопка внизу — Смотреть (или Написать / Забронировать) */}
          {!compact && (
            <div className="listing-card-tz4__actions">
              <span className="listing-card-tz4__btn listing-card-tz4__btn--primary">Смотреть</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

export const ListingCard = memo(ListingCardComponent)

/** ТЗ-4: скелетон — структура как у карточки (фото, бейджи, цена, локация, метрики, AI, кнопка), без дёргания */
export function ListingCardSkeleton() {
  return (
    <div className="listing-card-skeleton listing-card-skeleton-tz4">
      <div className="listing-card-skeleton__photo listing-card-skeleton-tz4__photo" />
      <div className="listing-card-skeleton__info listing-card-skeleton-tz4__info">
        <div className="listing-card-skeleton-tz4__badges">
          <span className="listing-card-skeleton-tz4__badge" />
          <span className="listing-card-skeleton-tz4__badge" />
        </div>
        <div className="listing-card-skeleton__line listing-card-skeleton__line--price listing-card-skeleton-tz4__price" />
        <div className="listing-card-skeleton-tz4__line listing-card-skeleton-tz4__rental" />
        <div className="listing-card-skeleton__line listing-card-skeleton__line--address listing-card-skeleton-tz4__location" />
        <div className="listing-card-skeleton-tz4__line listing-card-skeleton-tz4__metrics" />
        <div className="listing-card-skeleton-tz4__line listing-card-skeleton-tz4__ai" />
        <div className="listing-card-skeleton-tz4__btn" />
      </div>
    </div>
  )
}
