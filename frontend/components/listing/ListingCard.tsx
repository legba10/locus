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
  /** ТЗ-7: тип объекта для строки «Квартира • 2 комн. • 45 м²» */
  propertyType?: 'apartment' | 'room' | 'studio' | 'house' | string
  /** ТЗ-7: количество отзывов для блока рейтинга (23) */
  reviewCount?: number | null
  /** ТЗ-7: быстрые иконки внизу — макс 3: wifi, parking, center, metro */
  amenities?: ('wifi' | 'parking' | 'center' | 'metro')[]
  /** ТЗ-20: для первой карточки в AI-выдаче — бейдж «AI рекомендует» с tooltip */
  aiRecommendTooltip?: string
}

const BADGE_LABELS: Record<ListingCardBadge, string> = {
  verified: 'Проверено LOCUS',
  ai: 'Подобрано AI',
  top: 'Топ вариант',
  new: 'Новое',
  discount: 'Скидка',
  rare: 'Редкое',
}

/** ТЗ-7: короткие подписи бейджей без эмодзи — на фото и в блоке (Проверено, AI подбор, Популярно) */
const BADGE_PHOTO_LABELS: Record<ListingCardBadge, string> = {
  verified: 'Проверено',
  ai: 'AI подбор',
  top: 'Популярно',
  new: 'Новое',
  discount: 'Скидка',
  rare: 'Редкое',
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  room: 'Комната',
  studio: 'Студия',
  house: 'Дом',
}

const RENTAL_LABELS: Record<string, string> = {
  night: 'Посуточно',
  month: 'Долгосрочно',
  room: 'Комната',
  studio: 'Студия',
}

const SWIPE_THRESHOLD = 50

function WifiIcon() {
  return (
    <svg className="listing-card-tz7__amenity-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  )
}
function ParkingIcon() {
  return (
    <svg className="listing-card-tz7__amenity-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 7v10M9 7h4a2 2 0 010 4H9M9 11h4" />
    </svg>
  )
}
function CenterIcon() {
  return (
    <svg className="listing-card-tz7__amenity-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function MetroIcon() {
  return (
    <svg className="listing-card-tz7__amenity-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="16" rx="2" />
      <path d="M4 9h16M9 3v6M15 3v6M9 15h6M12 3v18" />
    </svg>
  )
}

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
  propertyType,
  reviewCount,
  amenities = [],
  aiRecommendTooltip,
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
  /** ТЗ-7: под ценой мелко «от X ₽ за месяц» при початочной аренде */
  const priceMonthlyLine =
    rentalType === 'night' &&
    price > 0 &&
    Number.isFinite(price)
      ? `от ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(price * 30))} ${RU.price.currency} за месяц`
      : null

  const displayBadges = badges.slice(0, 2)
  /** ТЗ-10: Москва · Сокол */
  const locationText = [city, district].filter(Boolean).join(' · ') || city
  /** ТЗ-7: одна строка — город · комнаты · гости (Берлин · 2 комнаты · до 4 гостей) */
  const infoLineParts: string[] = [city]
  if (rooms != null && rooms > 0) infoLineParts.push(`${rooms} ${rooms === 1 ? 'комната' : 'комнаты'}`)
  if (guests != null && guests > 0) infoLineParts.push(`до ${guests} гостей`)
  const infoLine = infoLineParts.join(' · ')
  const aiLine = Array.isArray(aiReasons)
    ? aiReasons.slice(0, 2).join('. ')
    : typeof aiReasons === 'string'
      ? aiReasons
      : null
  /** ТЗ-10: характеристики — гости, комнаты, м² (без этажа в одной строке) */
  const chars: string[] = []
  if (guests != null && guests > 0) chars.push(`${guests} гост${guests === 1 ? 'ь' : 'ей'}`)
  if (rooms != null && rooms > 0) chars.push(`${rooms} ${rooms === 1 ? 'комната' : 'комнаты'}`)
  if (area != null && area > 0) chars.push(`${area} м²`)
  const characteristicsText = chars.join(' · ')
  const metrics: string[] = []
  if (rooms != null && rooms > 0) metrics.push(`${rooms} ${rooms === 1 ? 'комната' : 'комн.'}`)
  if (area != null && area > 0) metrics.push(`${area} м²`)
  if (guests != null && guests > 0) metrics.push(`${guests} гостей`)
  if (floor != null && floor > 0) metrics.push(`${floor} этаж`)
  const metricsText = metrics.join(' · ')
  const showOwner = owner?.name || owner?.avatar
  const propertyTypeLabel = propertyType ? (PROPERTY_TYPE_LABELS[propertyType] || PROPERTY_TYPE_LABELS.apartment) : 'Квартира'
  const typeLineParts: string[] = [propertyTypeLabel]
  if (rooms != null && rooms > 0) typeLineParts.push(`${rooms} ${rooms === 1 ? 'комната' : 'комнаты'}`)
  if (area != null && area > 0) typeLineParts.push(`${area} м²`)
  const typeLine = typeLineParts.join(' • ')
  const addressText = district ? `${city}, ${district}` : city
  const displayAmenities = amenities.slice(0, 3)
  /** ТЗ-10: бейджи на фото — pill; ТЗ-20: для первой карточки AI — «AI рекомендует» + tooltip */
  const getBadgeLabel = (b: ListingCardBadge) => (b === 'ai' && aiRecommendTooltip ? 'AI рекомендует' : BADGE_PHOTO_LABELS[b])
  const photoBadgesList = displayBadges.map((b) => ({ label: getBadgeLabel(b), title: b === 'ai' ? aiRecommendTooltip : undefined }))

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
          'listing-card listing-card-tz4 listing-card-tz7 listing-card-tz10',
          highlight && 'listing-card-glow',
          compact && 'listing-card-tz4--compact',
          className
        )}
      >
        {/* ТЗ-4: фото — слева сверху бейдж (Проверено/Подобрано AI), справа избранное, снизу район + метро */}
        <div
          className="listing-card__image-wrap listing-card-tz7__image-wrap"
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
          {/* ТЗ-7: бейдж слева сверху на фото — короткие: Проверено, Подобрано AI, Новое, Топ */}
          {photoBadgesList.length > 0 && (
            <div className="listing-card-tz10__photo-badges">
              {photoBadgesList.map((item, i) => (
                <span key={i} className="listing-card-tz10__photo-pill" title={item.title}>{item.label}</span>
              ))}
            </div>
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

        <div className="listing-card__info listing-card-tz4__info listing-card-tz7__info listing-card-tz10__info">
          <div className="listing-card-tz7__price-row listing-card-tz10__price-row">
            <p className="listing-card__price-block listing-card-tz4__price-block listing-card-tz7__price-block listing-card-tz10__price-block">
              <span className="listing-card__price listing-card-tz4__price listing-card-tz7__price listing-card-tz10__price">{priceFormatted}</span>
              {price > 0 && Number.isFinite(price) && (
                <span className="listing-card__price-suffix listing-card-tz4__price-suffix listing-card-tz10__price-suffix">{priceSuffix}</span>
              )}
            </p>
            {(rating != null && Number(rating) > 0) ? (
              <span className="listing-card-tz7__rating listing-card-tz10__rating" aria-label={`Рейтинг ${rating}`}>
                <span className="listing-card__rating-star" aria-hidden>★</span>
                {Number(rating).toFixed(1)}
                {reviewCount != null && reviewCount > 0 && (
                  <span className="listing-card-tz7__review-count">({reviewCount})</span>
                )}
              </span>
            ) : (
              <span className="listing-card-tz10__new">Новое объявление</span>
            )}
          </div>
          {price > 0 && priceMonthlyLine && (
            <p className="listing-card-tz10__price-monthly">{priceMonthlyLine}</p>
          )}
          {price > 0 && !priceMonthlyLine && (
            <p className="listing-card-tz10__min-nights">
              {rentalType === 'month' ? 'долгосрочно' : 'от 1 ночи'}
            </p>
          )}
          <h3 className="listing-card-tz10__title" title={title}>{title}</h3>
          <p className="listing-card-tz10__location listing-card-tz7__info-line">{infoLine}</p>
          {displayBadges.length > 0 && (
            <div className="listing-card-tz7__badges listing-card-tz10__badges" aria-hidden>
              {displayBadges.map((b) => (
                <span key={b} className="listing-card-tz10__badge-pill" title={b === 'ai' ? aiRecommendTooltip : undefined}>{getBadgeLabel(b)}</span>
              ))}
            </div>
          )}
          {characteristicsText && (
            <p className="listing-card-tz10__characteristics">{characteristicsText}</p>
          )}

          <p className="listing-card-tz7__type-line listing-card-tz10__type-line" aria-hidden>{typeLine}</p>
          <p className="listing-card__address listing-card-tz4__location listing-card-tz7__address listing-card-tz10__address" aria-hidden>{addressText}</p>

          {/* AI пояснение — одна строка */}
          {!compact && aiLine && (
            <p className="listing-card-tz4__ai listing-card-tz7__ai listing-card-tz10__ai">
              {aiLine}
            </p>
          )}

          {/* ТЗ-7: низ — хост (аватар + имя) + быстрые иконки (макс 3) */}
          <div className="listing-card-tz7__footer">
            {showOwner && (
              <div className="listing-card__owner listing-card-tz7__owner">
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
            {displayAmenities.length > 0 && (
              <div className="listing-card-tz7__amenities" aria-hidden>
                {displayAmenities.map((a) => (
                  <span key={a} className="listing-card-tz7__amenity" title={a === 'wifi' ? 'Wi-Fi' : a === 'parking' ? 'Парковка' : a === 'center' ? 'Центр' : 'Метро'}>
                    {a === 'wifi' && <WifiIcon />}
                    {a === 'parking' && <ParkingIcon />}
                    {a === 'center' && <CenterIcon />}
                    {a === 'metro' && <MetroIcon />}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!compact && (
            <div className="listing-card-tz4__actions listing-card-tz7__actions">
              <span className="listing-card-tz4__btn listing-card-tz4__btn--primary">Смотреть</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

export const ListingCard = memo(ListingCardComponent)

/** ТЗ-10: скелетон — 4:3 фото, структура как у карточки (цена, название, район, характеристики) */
export function ListingCardSkeleton() {
  return (
    <div className="listing-card-skeleton listing-card-skeleton-tz4 listing-card-skeleton-tz10">
      <div className="listing-card-skeleton__photo listing-card-skeleton-tz4__photo" />
      <div className="listing-card-skeleton__info listing-card-skeleton-tz4__info">
        <div className="listing-card-skeleton__line listing-card-skeleton__line--price listing-card-skeleton-tz4__price" />
        <div className="listing-card-skeleton-tz4__line listing-card-skeleton-tz4__rental" />
        <div className="listing-card-skeleton__line listing-card-skeleton__line--address listing-card-skeleton-tz4__location" />
        <div className="listing-card-skeleton-tz4__line listing-card-skeleton-tz4__metrics" />
        <div className="listing-card-skeleton-tz4__line listing-card-skeleton-tz4__ai" />
      </div>
    </div>
  )
}
