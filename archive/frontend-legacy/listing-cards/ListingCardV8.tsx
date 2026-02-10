'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { 
  RU, 
  getVerdictFromScore, 
  formatPrice, 
  getReasonTypeFromText,
  type VerdictType,
  type DemandLevel 
} from '@/core/i18n/ru'
import type { LocusDecision, LocusReason } from '@/core/types/decision'

interface ListingCardV8Props {
  id: string
  
  // Фото
  photo?: string
  
  // Решение LOCUS (главное)
  decision: {
    score: number
    reasons: string[]
    demandLevel?: DemandLevel
    priceDiff?: number
    riskLevel?: 'low' | 'medium' | 'high'
  }
  
  // Цена и локация (вторичное)
  price: number
  city: string
  district?: string
  
  // Персонализация
  personalReasons?: string[]
  
  className?: string
}

/**
 * Получить цвета вердикта
 */
function getVerdictColors(verdict: VerdictType): { 
  bg: string
  border: string
  text: string
  icon: string 
} {
  switch (verdict) {
    case 'excellent':
      return { 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200', 
        text: 'text-emerald-700',
        icon: '✅'
      }
    case 'good':
      return { 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        text: 'text-blue-700',
        icon: '✓'
      }
    case 'average':
      return { 
        bg: 'bg-amber-50', 
        border: 'border-amber-200', 
        text: 'text-amber-700',
        icon: '•'
      }
    case 'bad':
    case 'risky':
      return { 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        text: 'text-red-700',
        icon: '⚠'
      }
    default:
      return { 
        bg: 'bg-gray-50', 
        border: 'border-gray-200', 
        text: 'text-gray-600',
        icon: '?'
      }
  }
}

/**
 * Получить иконку и цвет для причины
 */
function getReasonStyle(type: 'positive' | 'neutral' | 'negative'): {
  icon: string
  color: string
} {
  switch (type) {
    case 'positive':
      return { icon: '✓', color: 'text-emerald-600' }
    case 'negative':
      return { icon: '⚠', color: 'text-amber-600' }
    default:
      return { icon: '•', color: 'text-gray-500' }
  }
}

/**
 * ListingCardV8 — РЕШЕНИЕ, А НЕ КАРТОЧКА
 * 
 * Структура (строгая):
 * 
 * [ФОТО]
 * 
 * [ВЕРДИКТ] ← самый крупный текст
 * ✅ Хороший вариант
 * 
 * [ПРИЧИНЫ]
 * ✓ Цена ниже рынка
 * ✓ Район подходит
 * ⚠ Средний спрос
 * 
 * [ЦЕНА + ЛОКАЦИЯ] ← вторичное
 * 38 000 ₽ / мес
 * Москва, Центр
 * 
 * [КНОПКИ]
 * [Почему подходит →]
 * [Забронировать]
 * 
 * ❗ Цена НЕ может быть главным элементом.
 */
export function ListingCardV8({
  id,
  photo,
  decision,
  price,
  city,
  district,
  personalReasons,
  className,
}: ListingCardV8Props) {
  const [imgError, setImgError] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Определяем вердикт
  const verdictType = getVerdictFromScore(decision.score)
  const verdictText = RU.verdict[verdictType]
  const verdictColors = getVerdictColors(verdictType)

  // Конвертируем причины в объекты с типами
  const reasons: LocusReason[] = decision.reasons.slice(0, 3).map(text => ({
    text,
    type: getReasonTypeFromText(text)
  }))

  return (
    <article className={cn(
      'rounded-xl border bg-white overflow-hidden shadow-sm',
      'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
      verdictColors.border,
      className
    )}>
      {/* ═══════════════════════════════════════════════════════════════
          ФОТО
          ═══════════════════════════════════════════════════════════════ */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-gray-100">
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">🏠</span>
          </div>
        )}
        
        {/* Бейдж спроса */}
        {decision.demandLevel === 'high' && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-medium shadow">
            🔥 {RU.demand.high}
          </div>
        )}
        
        {/* Кнопка сохранения */}
        <button
          onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved) }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow transition"
          aria-label={isSaved ? 'Удалить из сохранённых' : 'Сохранить'}
        >
          <span className={cn('text-lg', isSaved ? 'text-red-500' : 'text-gray-400')}>
            {isSaved ? '❤️' : '🤍'}
          </span>
        </button>
      </Link>

      <div className="p-4">
        {/* ═══════════════════════════════════════════════════════════════
            ВЕРДИКТ (главный элемент — самый крупный текст)
            ═══════════════════════════════════════════════════════════════ */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl mb-3',
          verdictColors.bg, verdictColors.border, 'border'
        )}>
          <span className="text-xl">{verdictColors.icon}</span>
          <span className={cn('text-lg font-semibold', verdictColors.text)}>
            {verdictText}
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ПРИЧИНЫ (почему подходит)
            ═══════════════════════════════════════════════════════════════ */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">{RU.block.why_fits}:</p>
            <div className="space-y-1.5">
              {reasons.map((reason, idx) => {
                const style = getReasonStyle(reason.type)
                return (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className={cn('flex-shrink-0 font-bold', style.color)}>
                      {style.icon}
                    </span>
                    <span className={style.color}>
                      {reason.text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ПЕРСОНАЛИЗАЦИЯ (если есть)
            ═══════════════════════════════════════════════════════════════ */}
        {personalReasons && personalReasons.length > 0 && (
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 mb-4">
            <p className="text-xs font-medium text-blue-700 mb-1">
              {RU.block.for_you}:
            </p>
            <ul className="space-y-0.5">
              {personalReasons.slice(0, 2).map((r, idx) => (
                <li key={idx} className="text-xs text-blue-600 flex items-center gap-1">
                  <span>•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ЦЕНА + ЛОКАЦИЯ (вторичное)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-4">
          <div className="text-gray-700 font-medium">
            {formatPrice(price, 'month')}
          </div>
          <p className="text-sm text-gray-500">
            {city}
            {district && `, ${district}`}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            КНОПКИ
            ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-2">
          <Link
            href={`/listings/${id}`}
            className="block w-full text-center rounded-lg py-2.5 text-sm font-medium transition bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {RU.action.view_analysis} →
          </Link>
          <Link
            href={`/listings/${id}#book`}
            className="block w-full text-center rounded-lg py-2.5 text-sm font-medium transition bg-blue-600 text-white hover:bg-blue-700"
          >
            {RU.action.book}
          </Link>
        </div>
      </div>
    </article>
  )
}

/**
 * Скелетон карточки
 */
export function ListingCardV8Skeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-10 bg-gray-200 rounded-xl w-2/3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="space-y-2 pt-2">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}
