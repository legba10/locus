'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import type { Listing } from './listing-types'

export type ListingCardProps = {
  listing: Listing & {
    photos?: { url: string; sortOrder?: number }[]
    viewsCount?: number
    owner?: { id: string; name: string; avatar: string | null }
  }
  className?: string
}

/**
 * TZ-6: Карточка объявления — единый кликабельный блок.
 * Фото, заголовок, цена, адрес, владелец (avatar 24px + name). Без дублей кнопок и старых AI-блоков.
 */
export function ListingCard({
  listing,
  className,
}: ListingCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const listingWithLegacy = listing as typeof listing & { images?: { url: string }[] }
  const photo = listing.photos?.[0]?.url || listingWithLegacy.images?.[0]?.url
  const owner = (listing as { owner?: { id: string; name: string; avatar: string | null } }).owner
  const addressText = listing.city ?? ''

  const openListing = () => router.push(`/listings/${listing.id}`)

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Открыть объявление: ${listing.title || 'Без названия'}`}
      className={cn('listing-card', className)}
      onClick={openListing}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openListing()}
    >
      <div className="listing-card__image-wrap">
        {photo && !imgError ? (
          <Image
            src={photo}
            alt={listing.title || 'Фото жилья'}
            fill
            className="listing-card__image object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized={photo.startsWith('http')}
            onError={() => setImgError(true)}
          />
        ) : null}
      </div>

      <div className="listing-card__info">
        <h3 className="listing-card__title">{listing.title || 'Без названия'}</h3>
        <p className="listing-card__price">{formatPrice(listing.pricePerNight ?? 0, 'night')}</p>
        {addressText && <p className="listing-card__address">{addressText}</p>}
        {owner && (owner.name || owner.avatar) && (
          <div className="listing-card__owner">
            <div className="listing-card__owner-avatar">
              {owner.avatar ? (
                <Image src={owner.avatar} alt="" fill className="object-cover" sizes="24px" />
              ) : (
                <span className="listing-card__owner-initial">{(owner.name || 'Г').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="listing-card__owner-name">{owner.name || 'Владелец'}</span>
          </div>
        )}
      </div>
    </article>
  )
}

/**
 * TZ-6: skeleton — один цвет, aspect-ratio 4/3
 */
export function ListingCardSkeleton() {
  return (
    <div className="listing-card-skeleton">
      <div className="listing-card-skeleton__photo" />
      <div className="listing-card-skeleton__info">
        <div className="listing-card-skeleton__line listing-card-skeleton__line--title" />
        <div className="listing-card-skeleton__line listing-card-skeleton__line--price" />
        <div className="listing-card-skeleton__line listing-card-skeleton__line--address" />
        <div className="listing-card-skeleton__owner">
          <div className="listing-card-skeleton__avatar" />
          <div className="listing-card-skeleton__name" />
        </div>
      </div>
    </div>
  )
}
