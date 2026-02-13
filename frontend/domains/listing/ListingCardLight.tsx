'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import { isValidImageUrl } from '@/shared/utils/imageUtils'
import { apiFetch } from '@/shared/utils/apiFetch'
import { track } from '@/shared/analytics/events'

interface ListingCardLightProps {
  id: string
  photo?: string
  title?: string
  price: number
  city: string
  address?: string
  district?: string
  rooms?: number
  area?: number
  floor?: number
  totalFloors?: number
  views?: number
  isNew?: boolean
  isVerified?: boolean
  isFavorite?: boolean
  score?: number
  verdict?: string
  reasons?: string[]
  tags?: string[]
  rating?: number | null
  reviewPercent?: number | null
  cleanliness?: number | null
  noise?: number | null
  highlight?: boolean
  className?: string
}

/**
 * ListingCardLight — ТЗ-5: карточка объявления
 * [фото] [цена 24px] [город] [метрики AI] [панель ❤️ 💬 Открыть]
 * Фото: 180px mobile / 220px desktop, radius 18px. Карточка: flex column, height 100%.
 */
function ListingCardLightComponent({
  id,
  photo,
  title,
  price,
  city,
  district,
  isFavorite = false,
  score = 0,
  highlight = false,
  className,
}: ListingCardLightProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [isSaved, setIsSaved] = useState(isFavorite)
  const [isToggling, setIsToggling] = useState(false)

  const handleFavoriteToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isToggling) return
    setIsToggling(true)
    const newState = !isSaved
    setIsSaved(newState)
    if (newState) track('favorite_add', { listingId: id })
    try {
      await apiFetch(`/favorites/${id}/toggle`, { method: 'POST' })
    } catch (err) {
      setIsSaved(!newState)
      console.error('Failed to toggle favorite:', err)
    } finally {
      setIsToggling(false)
    }
  }, [id, isSaved, isToggling])

  const openListing = () => {
    if (typeof window !== 'undefined') {
      const viewed = Number(localStorage.getItem('locus_viewed_count') || '0') + 1
      localStorage.setItem('locus_viewed_count', String(viewed))
      localStorage.setItem('locus_last_activity', String(Date.now()))
      window.dispatchEvent(new Event('locus:listing-viewed'))
    }
    track('listing_view', { listingId: id, listingTitle: title, listingCity: city, listingPrice: price })
    router.push(`/listings/${id}`)
  }

  const imageUrl = photo && isValidImageUrl(photo) ? photo : null
  const locationString = district ? `${city} · ${district}` : city
  const showAi = score > 0

  return (
    <article
      className={cn(
        'listing-card-tz5 flex flex-col h-full rounded-[18px] overflow-hidden',
        'bg-[var(--card)] border border-[var(--border)]',
        'transition-all duration-200 ease-out',
        highlight && 'listing-card-glow',
        className
      )}
    >
      {/* Фото: 180px mobile, 220px desktop, radius 18px */}
      <Link
        href={`/listings/${id}`}
        className="listing-photo-tz5 block relative w-full flex-shrink-0 overflow-hidden rounded-t-[18px] bg-[var(--bg-glass)]"
        onClick={(e) => { e.preventDefault(); openListing(); }}
      >
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={title || 'Фото жилья'}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.03]"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] text-[12px] gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            </svg>
            <span>Фото отсутствует</span>
          </div>
        )}
        <button
          onClick={handleFavoriteToggle}
          disabled={isToggling}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full',
            'bg-[var(--bg-glass)] backdrop-blur-[var(--blur-soft)]',
            'transition-all duration-200 hover:scale-105',
            isSaved && 'text-red-500',
            isToggling && 'opacity-50 cursor-wait'
          )}
          aria-label={isSaved ? 'Удалить из избранного' : 'В избранное'}
        >
          <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </Link>

      {/* Контент: цена, город, AI — flex растягивается */}
      <div className="flex flex-col flex-1 min-h-0 p-4">
        <p className="text-[24px] font-bold text-[var(--text-main)] leading-tight mb-1">
          {formatPrice(price, 'month')}
        </p>
        <p className="text-[14px] text-[var(--text-secondary)] line-clamp-1 mb-2">
          {locationString}
        </p>
        {showAi && (
          <p className="text-[13px] font-semibold text-[var(--accent)] mb-3">
            Подходит на {score}%
          </p>
        )}
      </div>

      {/* Нижняя панель: ❤️ 💬 Открыть */}
      <div className="flex items-center gap-2 p-3 pt-0 border-t border-[var(--border)] flex-shrink-0">
        <button
          onClick={handleFavoriteToggle}
          disabled={isToggling}
          className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-main)] transition-colors"
          aria-label="В избранное"
        >
          <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          type="button"
          className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-main)] transition-colors"
          aria-label="Написать"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={openListing}
          className="ml-auto rounded-[12px] px-4 py-2 text-[14px] font-semibold bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-90 transition-opacity"
        >
          Открыть
        </button>
      </div>
    </article>
  )
}

export const ListingCardLight = memo(ListingCardLightComponent)

/** ТЗ-5: glass skeleton вместо серого */
export function ListingCardLightSkeleton() {
  return (
    <div className={cn(
      'listing-card-tz5 flex flex-col h-full rounded-[18px] overflow-hidden',
      'glass border border-[var(--border)]'
    )}>
      <div className="listing-photo-tz5 w-full flex-shrink-0 rounded-t-[18px] skeleton-glass" />
      <div className="flex flex-col flex-1 min-h-0 p-4 gap-2">
        <div className="h-7 w-28 rounded-lg skeleton-glass" />
        <div className="h-4 w-36 rounded-lg skeleton-glass" />
      </div>
      <div className="flex items-center gap-2 p-3 pt-0 border-t border-[var(--border)] flex-shrink-0">
        <div className="h-8 w-8 rounded-full skeleton-glass" />
        <div className="h-8 w-16 rounded-[12px] ml-auto skeleton-glass" />
      </div>
    </div>
  )
}
