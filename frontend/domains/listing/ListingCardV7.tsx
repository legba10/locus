'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

interface DecisionReason {
  text: string
  type: 'positive' | 'warning' | 'negative'
}

interface ListingCardV7Props {
  id: string
  
  // Основное
  photo?: string
  price: number
  city: string
  district?: string
  
  // AI Decision (обязательно)
  score: number
  verdict: string
  reasons: string[]
  demandLevel?: 'low' | 'medium' | 'high'
  priceDiff?: number
  riskLevel?: 'low' | 'medium' | 'high'
  
  // Relevance (персонализация)
  relevanceReasons?: string[]
  
  className?: string
}

function formatPrice(amount: number) {
  if (amount === 0) return 'Цена уточняется'
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/**
 * Get color classes based on score
 */
function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
  if (score >= 65) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  if (score >= 50) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
  if (score > 0) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' }
}

/**
 * Get demand label and color
 */
function getDemandInfo(level: 'low' | 'medium' | 'high'): { label: string; color: string } {
  switch (level) {
    case 'high': return { label: 'Высокий спрос', color: 'text-emerald-600' }
    case 'low': return { label: 'Низкий спрос', color: 'text-amber-600' }
    default: return { label: 'Средний спрос', color: 'text-gray-500' }
  }
}

/**
 * Parse reason to determine type
 */
function parseReason(reason: string): DecisionReason {
  const lowerReason = reason.toLowerCase()
  
  // Positive indicators
  if (
    lowerReason.includes('ниже рынка') ||
    lowerReason.includes('высокий спрос') ||
    lowerReason.includes('низкий риск') ||
    lowerReason.includes('качественн') ||
    lowerReason.includes('отличн') ||
    lowerReason.includes('хорош')
  ) {
    return { text: reason, type: 'positive' }
  }
  
  // Warning indicators
  if (
    lowerReason.includes('средний') ||
    lowerReason.includes('выше рынка') ||
    lowerReason.includes('стандартн')
  ) {
    return { text: reason, type: 'warning' }
  }
  
  // Negative indicators
  if (
    lowerReason.includes('низкий спрос') ||
    lowerReason.includes('высокий риск') ||
    lowerReason.includes('требует')
  ) {
    return { text: reason, type: 'negative' }
  }
  
  return { text: reason, type: 'positive' }
}

/**
 * ListingCardV7 — Product Card (Phase 6)
 * 
 * Structure (strict):
 * 
 * [PHOTO]
 * 
 * [DecisionBadge]
 * Пример: "Хороший выбор" | score 82
 * 
 * [DecisionReasons]
 * ✓ Цена ниже рынка
 * ✓ Удобный район
 * ⚠ Средний спрос
 * 
 * [RelevanceBlock]
 * Подходит вам:
 * • Вы искали жильё в этом районе
 * • Цена в вашем диапазоне
 * 
 * [PriceBlock]
 * 38 000 ₽ / мес (secondary)
 * 
 * [ActionBlock]
 * [Подробнее] [Сохранить]
 * 
 * Visual rules:
 * • DecisionBadge = biggest element after photo
 * • Reasons = colored semantic tags
 * • Price = muted color
 * • Card must look like AI recommendation, not ad
 */
export function ListingCardV7({
  id,
  photo,
  price,
  city,
  district,
  score,
  verdict,
  reasons,
  demandLevel = 'medium',
  priceDiff,
  riskLevel,
  relevanceReasons,
  className,
}: ListingCardV7Props) {
  const [imgError, setImgError] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  const scoreColors = getScoreColor(score)
  const demandInfo = getDemandInfo(demandLevel)
  const parsedReasons = reasons.slice(0, 3).map(parseReason)

  return (
    <article className={cn(
      'rounded-xl border bg-white overflow-hidden shadow-sm',
      'transition-all duration-200 hover:shadow-md hover:border-gray-300',
      scoreColors.border,
      className
    )}>
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">🏠</span>
          </div>
        )}
        
        {/* Demand badge on photo */}
        {demandLevel === 'high' && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-emerald-500 text-white text-xs font-medium shadow">
            🔥 Высокий спрос
          </div>
        )}
        
        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved) }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow transition"
        >
          <span className={cn('text-lg', isSaved ? 'text-red-500' : 'text-gray-400')}>
            {isSaved ? '❤️' : '🤍'}
          </span>
        </button>
      </Link>

      <div className="p-4">
        {/* DecisionBadge - biggest element after photo */}
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-xl mb-3',
          scoreColors.bg, scoreColors.border, 'border'
        )}>
          <span className={cn('text-2xl font-bold', scoreColors.text)}>
            {score > 0 ? score : '—'}
          </span>
          <div className="flex flex-col">
            <span className={cn('text-sm font-medium', scoreColors.text)}>
              {verdict}
            </span>
            {score > 0 && (
              <span className="text-xs text-gray-400">из 100</span>
            )}
          </div>
        </div>

        {/* DecisionReasons - colored semantic tags */}
        {parsedReasons.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {parsedReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className={cn(
                  'flex-shrink-0 mt-0.5',
                  reason.type === 'positive' && 'text-emerald-500',
                  reason.type === 'warning' && 'text-amber-500',
                  reason.type === 'negative' && 'text-red-500'
                )}>
                  {reason.type === 'positive' && '✓'}
                  {reason.type === 'warning' && '⚠'}
                  {reason.type === 'negative' && '✕'}
                </span>
                <span className={cn(
                  reason.type === 'positive' && 'text-emerald-700',
                  reason.type === 'warning' && 'text-amber-700',
                  reason.type === 'negative' && 'text-red-700'
                )}>
                  {reason.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* RelevanceBlock - personalization */}
        {relevanceReasons && relevanceReasons.length > 0 && (
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 mb-3">
            <p className="text-xs font-medium text-blue-700 mb-1">Подходит вам:</p>
            <ul className="space-y-0.5">
              {relevanceReasons.slice(0, 2).map((r, idx) => (
                <li key={idx} className="text-xs text-blue-600 flex items-center gap-1">
                  <span>•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Product Metrics */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {priceDiff !== undefined && priceDiff < -5 && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              Ниже рынка
            </span>
          )}
          {priceDiff !== undefined && priceDiff > 10 && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
              Выше рынка
            </span>
          )}
          {riskLevel === 'low' && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              Низкий риск
            </span>
          )}
          <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium border', 
            demandLevel === 'high' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
            demandLevel === 'medium' && 'bg-gray-50 text-gray-600 border-gray-200',
            demandLevel === 'low' && 'bg-amber-50 text-amber-700 border-amber-200'
          )}>
            {demandInfo.label}
          </span>
        </div>

        {/* PriceBlock - secondary, not primary */}
        <div className="mb-2">
          <span className="text-lg font-semibold text-gray-700">{formatPrice(price)} ₽</span>
          <span className="text-gray-400 text-sm"> / мес</span>
        </div>

        {/* Location */}
        <p className="text-sm text-gray-500 mb-4">
          {city}
          {district && ` · ${district}`}
        </p>

        {/* ActionBlock */}
        <Link
          href={`/listings/${id}`}
          className={cn(
            'block w-full text-center rounded-lg py-2.5 text-sm font-medium transition',
            'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          Смотреть анализ →
        </Link>
      </div>
    </article>
  )
}

/**
 * ListingCardV7Skeleton
 */
export function ListingCardV7Skeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-12 bg-gray-200 rounded-xl w-2/3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  )
}
