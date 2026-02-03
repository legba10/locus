'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LocusDecisionBadge } from '@/components/LocusDecisionBlock'
import { PRICE_LABELS, getPriceColor } from '@/shared/types/decision'
import { cn } from '@/shared/utils/cn'
import type { Listing } from './listing-types'

export type ListingCardProps = {
  listing: Listing & { 
    photos?: { url: string; sortOrder?: number }[]
    viewsCount?: number
  }
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/**
 * ListingCard — Product Standard
 * 
 * STRUCTURE (STRICT ORDER):
 * 1. Photo
 * 2. Price (large)
 * 3. Decision score + verdict
 * 4. 1 reason (price signal)
 * 5. CTA button
 */
export function ListingCard({
  listing,
  className,
}: ListingCardProps) {
  const [imgError, setImgError] = useState(false)
  // Support both 'photos' (backend) and 'images' (legacy)
  const photo = listing.photos?.[0]?.url || listing.images?.[0]?.url
  const matchScore = listing.aiScores?.qualityScore ?? undefined
  const verdict = matchScore !== undefined ? 'neutral' : undefined
  const priceSignal = undefined
  const priceColor = priceSignal ? getPriceColor(priceSignal) : 'text-gray-500'

  return (
    <article className={cn(
      'rounded-xl border border-gray-200 bg-white overflow-hidden',
      'transition hover:shadow-md hover:border-gray-300',
      className
    )}>
      {/* 1. PHOTO */}
      <Link
        href={`/listings/${listing.id}`}
        aria-label={`Open listing: ${listing.title}`}
        className="block relative aspect-[4/3] bg-gray-100"
      >
        {photo && !imgError ? (
          <Image
            src={photo}
            alt="Фото жилья"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized={photo.startsWith('http')}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🏠
          </div>
        )}
      </Link>

      <div className="p-3">
        {/* Title */}
        <p className="mb-1 text-sm font-medium text-gray-900">{listing.title}</p>

        {/* 2. PRICE (large) */}
        <div className="mb-2">
          <span className="text-xl font-bold text-gray-900">{formatPrice(listing.pricePerNight)} ₽</span>
          <span className="text-gray-500 text-sm"> / ночь</span>
        </div>

        {/* 3. DECISION SCORE + VERDICT */}
        {matchScore !== undefined && verdict && (
          <div className="mb-2">
            <LocusDecisionBadge score={matchScore} verdict="neutral" />
          </div>
        )}

        {/* 4. 1 REASON (price signal) */}
        {priceSignal && (
          <p className={cn('text-sm mb-2', priceColor)}>
            {PRICE_LABELS[priceSignal]}
          </p>
        )}

        {/* City (subtle) */}
        {listing.city && (
          <p className="text-xs text-gray-400 mb-3">{listing.city}</p>
        )}

        {/* 5. CTA BUTTON */}
        <Link
          href={`/listings/${listing.id}`}
          className="block w-full text-center rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Подробнее
        </Link>
      </div>
    </article>
  )
}

/**
 * ListingCardSkeleton
 */
export function ListingCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-9 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  )
}
