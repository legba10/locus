'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Card, ScoreBadgeV2, ReasonList, DemandTag, Button } from '@/ui-system'
import { DecisionBlockV2, type DecisionData } from '@/ui-system/DecisionBlockV2'
import { cn } from '@/shared/utils/cn'

interface ListingCardV6Props {
  id: string
  
  // Основное
  photo?: string
  price: number
  city: string
  district?: string
  
  // AI Decision (обязательно)
  score: number
  verdict: string // "Good choice", "Fits", "Risky"
  reasons: string[] // max 3
  demandLevel?: 'low' | 'medium' | 'high'
  
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/**
 * ListingCardV6 — Product Version V6
 * 
 * NEW CARD STRUCTURE (MANDATORY):
 * 
 * [PHOTO]
 * 
 * [AI SCORE BADGE] - biggest element after photo
 * 82 / 100 — Good choice
 * 
 * [MAIN REASON] - highlighted (AI color)
 * ✓ Price below market
 * ✓ Convenient location
 * ⚠ Medium demand
 * 
 * [PRICE] - secondary, not primary
 * 38 000 ₽ / month
 * 
 * [LOCATION]
 * Moscow · Central district
 * 
 * [ACTION]
 * View analysis →
 * 
 * VISUAL RULES:
 * • Score badge must be biggest element after photo
 * • Reason block must be highlighted (AI color)
 * • Price is secondary, not primary
 * • Each card must look DIFFERENT (by score + reasons)
 */
export function ListingCardV6({
  id,
  photo,
  price,
  city,
  district,
  score,
  verdict,
  reasons,
  demandLevel,
  className,
}: ListingCardV6Props) {
  const [imgError, setImgError] = useState(false)

  // Create decision data
  const decision: DecisionData = {
    score,
    verdict,
    reasons,
    demandLevel,
  }

  return (
    <Card variant="bordered" padding="none" hoverable className={cn('overflow-hidden', className)}>
      {/* PHOTO */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-gray-100">
        {photo && !imgError ? (
          <Image
            src={photo}
            alt="Фото жилья"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            🏠
          </div>
        )}
      </Link>

      <div className="p-4">
        {/* AI SCORE BADGE - biggest element after photo */}
        <div className="mb-3">
          <ScoreBadgeV2 score={score} size="lg" showLabel />
          <p className="text-sm font-medium text-gray-700 mt-1">{verdict}</p>
        </div>

        {/* MAIN REASON - highlighted (AI color) */}
        {reasons.length > 0 && (
          <div className="mb-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <ReasonList 
              reasons={reasons.slice(0, 3).map(r => ({ text: r, type: 'positive' as const }))} 
              maxItems={3}
            />
          </div>
        )}

        {/* PRICE - secondary, not primary */}
        <div className="mb-2">
          <span className="text-lg font-semibold text-gray-700">{formatPrice(price)} ₽</span>
          <span className="text-gray-500 text-sm"> / мес</span>
        </div>

        {/* PRODUCT METRICS */}
        <div className="flex flex-wrap gap-2 mb-2">
          {demandLevel && (
            <DemandTag level={demandLevel} />
          )}
          {decision.priceDiff !== undefined && decision.priceDiff > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
              Ниже рынка
            </span>
          )}
          {decision.priceDiff !== undefined && decision.priceDiff < 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
              Выше рынка
            </span>
          )}
          {score >= 80 && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
              Низкий риск
            </span>
          )}
        </div>

        {/* LOCATION */}
        <p className="text-xs text-gray-500 mb-3">
          {city}
          {district && ` · ${district}`}
        </p>

        {/* ACTION */}
        <Link href={`/listings/${id}`}>
          <Button variant="outline" fullWidth>
            Смотреть анализ →
          </Button>
        </Link>
      </div>
    </Card>
  )
}

/**
 * ListingCardV6Skeleton
 */
export function ListingCardV6Skeleton() {
  return (
    <Card variant="bordered" padding="none" className="overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-16 bg-gray-200 rounded" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-10 bg-gray-200 rounded mt-2" />
      </div>
    </Card>
  )
}
