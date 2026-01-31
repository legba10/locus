'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import { Card, Button, Divider } from '@/ui-system'
import { normalizeListing, type RawListing } from '@/core/adapters'
import { cn } from '@/shared/utils/cn'
import { 
  RU, 
  getVerdictFromScore, 
  formatPrice, 
  getReasonTypeFromText,
  getDemandText,
  type VerdictType 
} from '@/core/i18n/ru'

interface ListingResponse {
  listing?: RawListing
  item?: RawListing
  decision?: {
    score: number
    verdict: string
    reasons: string[]
    risks?: string[]
    priceDiff?: number
    demandLevel?: 'low' | 'medium' | 'high'
    recommendation?: string
  }
  personalizedReasons?: string[]
}

/**
 * Получить цвета вердикта
 */
function getVerdictColors(verdict: VerdictType) {
  switch (verdict) {
    case 'excellent':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '✅' }
    case 'good':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '✓' }
    case 'average':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '•' }
    case 'bad':
    case 'risky':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '⚠' }
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: '?' }
  }
}

// Галерея фото
function Gallery({ photos, title }: { photos: Array<{ url: string }>; title: string }) {
  const [idx, setIdx] = useState(0)

  if (!photos.length) {
    return (
      <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-5xl">
        🏠
      </div>
    )
  }

  return (
    <div className="relative aspect-video rounded-xl bg-gray-100 overflow-hidden">
      <Image src={photos[idx].url} alt={title} fill className="object-cover" priority unoptimized={photos[idx].url.startsWith('http')} />
      {photos.length > 1 && (
        <>
          <button 
            onClick={() => setIdx(i => i > 0 ? i - 1 : photos.length - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white shadow text-lg"
          >
            ←
          </button>
          <button 
            onClick={() => setIdx(i => i < photos.length - 1 ? i + 1 : 0)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white shadow text-lg"
          >
            →
          </button>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {idx + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  )
}

// Скелетон
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="aspect-video bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
    </div>
  )
}

/**
 * ListingPageV6 — DECISION FIRST
 * 
 * Структура страницы (строгая):
 * 
 * 1️⃣ БЛОК РЕШЕНИЯ (первым, до фото!)
 *    "Почему это жильё подходит вам"
 *    ✅ Цена ниже рынка на 12%
 *    ✅ Подходит под ваш бюджет
 *    ⚠ Средний спрос
 *    
 *    Рекомендация LOCUS:
 *    Можно бронировать сейчас
 * 
 * 2️⃣ Цена и бронирование
 * 3️⃣ Фотографии
 * 4️⃣ Описание
 * 5️⃣ Удобства
 * 6️⃣ Расположение
 */
export function ListingPageV6({ id }: { id: string }) {
  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)

  if (isLoading) return <PageSkeleton />

  const rawItem = data?.listing ?? data?.item
  if (error || !rawItem) {
    return (
      <Card variant="bordered" className="p-6 text-center">
        <p className="text-red-600 mb-2">{RU.common.error}</p>
        <Link href="/listings" className="text-blue-600 hover:underline">
          ← {RU.common.back}
        </Link>
      </Card>
    )
  }

  // Нормализуем данные
  const item = normalizeListing(rawItem)
  const decision = data.decision
  const personalizedReasons = data.personalizedReasons || []

  // Определяем вердикт
  const score = decision?.score ?? item.score ?? 0
  const verdictType = getVerdictFromScore(score)
  const verdictText = RU.verdict[verdictType]
  const verdictColors = getVerdictColors(verdictType)

  // Собираем причины
  const reasons = (decision?.reasons ?? item.reasons ?? []).slice(0, 4)
  const risks = (decision?.risks ?? []).slice(0, 2)

  // Рекомендация
  const recommendation = decision?.recommendation || (
    score >= 75 ? RU.recommendation.book_now :
    score >= 50 ? RU.recommendation.consider :
    RU.recommendation.compare
  )

  return (
    <div className="space-y-4">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Главная</Link>
        {' / '}
        <Link href="/listings" className="hover:text-gray-700">{RU.search.title}</Link>
        {' / '}
        <span className="text-gray-900">{item.city}</span>
      </nav>

      {/* Заголовок */}
      <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>

      {/* ═══════════════════════════════════════════════════════════════
          1️⃣ БЛОК РЕШЕНИЯ (ПЕРВЫМ — ДО ФОТО!)
          "Почему это жильё подходит вам"
          ═══════════════════════════════════════════════════════════════ */}
      <div className={cn(
        'rounded-xl border p-5',
        verdictColors.bg, verdictColors.border
      )}>
        {/* Вердикт */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{verdictColors.icon}</span>
          <div>
            <h2 className={cn('text-xl font-bold', verdictColors.text)}>
              {verdictText}
            </h2>
            {score > 0 && (
              <p className="text-sm text-gray-500">
                {RU.block.locus_analysis}
              </p>
            )}
          </div>
        </div>

        {/* Причины */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {RU.block.why_fits}:
            </p>
            <div className="space-y-2">
              {reasons.map((reason, idx) => {
                const type = getReasonTypeFromText(reason)
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <span className={cn(
                      'font-bold',
                      type === 'positive' && 'text-emerald-600',
                      type === 'negative' && 'text-amber-600',
                      type === 'neutral' && 'text-gray-500'
                    )}>
                      {type === 'positive' ? '✅' : type === 'negative' ? '⚠' : '•'}
                    </span>
                    <span className="text-gray-700">{reason}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Риски */}
        {risks.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {RU.block.risks}:
            </p>
            <div className="space-y-1">
              {risks.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-700">
                  <span>⚠</span>
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Персонализация */}
        {personalizedReasons.length > 0 && (
          <div className="p-3 rounded-lg bg-white/50 border border-white/80 mb-4">
            <p className="text-sm font-medium text-blue-800 mb-1">
              {RU.block.for_you}:
            </p>
            <ul className="space-y-1">
              {personalizedReasons.slice(0, 3).map((r, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                  <span>•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Рекомендация */}
        <div className="pt-3 border-t border-gray-200/50">
          <p className="text-sm text-gray-500 mb-1">{RU.block.locus_recommends}:</p>
          <p className={cn('font-semibold', verdictColors.text)}>
            {recommendation}
          </p>
        </div>
      </div>

      {/* Сетка: контент + бронирование */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* ═══════════════════════════════════════════════════════════════
              3️⃣ Фотографии
              ═══════════════════════════════════════════════════════════════ */}
          <Gallery photos={item.photos} title={item.title} />

          {/* ═══════════════════════════════════════════════════════════════
              4️⃣ Параметры
              ═══════════════════════════════════════════════════════════════ */}
          {(item.rooms || item.beds || item.bathrooms) && (
            <Card variant="bordered">
              <h2 className="font-semibold text-gray-900 mb-2">Параметры</h2>
              <div className="flex gap-4 text-sm text-gray-600">
                {item.rooms > 0 && <span>{item.rooms} комн.</span>}
                {item.beds > 0 && <span>{item.beds} спальн.</span>}
                {item.bathrooms > 0 && <span>{item.bathrooms} санузел</span>}
              </div>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              5️⃣ Описание
              ═══════════════════════════════════════════════════════════════ */}
          {item.description && (
            <Card variant="bordered">
              <h2 className="font-semibold text-gray-900 mb-2">{RU.common.description}</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              6️⃣ Удобства
              ═══════════════════════════════════════════════════════════════ */}
          {item.amenities.length > 0 && (
            <Card variant="bordered">
              <h2 className="font-semibold text-gray-900 mb-3">{RU.common.amenities}</h2>
              <div className="flex flex-wrap gap-2">
                {item.amenities.map((amenity, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  >
                    {amenity.icon} {amenity.label}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              7️⃣ Расположение
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <h2 className="font-semibold text-gray-900 mb-2">{RU.common.location}</h2>
            {item.address && (
              <p className="text-gray-600 mb-3">{item.address}, {item.city}</p>
            )}
            <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-lg">🗺️ Карта</span>
            </div>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            2️⃣ Цена и бронирование (sidebar)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:sticky lg:top-4 lg:self-start" id="book">
          <Card variant="bordered">
            {/* Цена */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(item.basePrice, 'night')}
              </span>
            </div>

            {/* Метрики */}
            <div className="flex flex-wrap gap-2 mb-4">
              {decision?.demandLevel && (
                <span className={cn(
                  'px-2 py-1 rounded-lg text-xs font-medium',
                  decision.demandLevel === 'high' && 'bg-emerald-50 text-emerald-700',
                  decision.demandLevel === 'medium' && 'bg-gray-100 text-gray-600',
                  decision.demandLevel === 'low' && 'bg-amber-50 text-amber-700'
                )}>
                  {getDemandText(decision.demandLevel)}
                </span>
              )}
              {decision?.priceDiff !== undefined && decision.priceDiff < -5 && (
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                  {RU.reason.price_below_market}
                </span>
              )}
            </div>

            <Divider />

            {/* Форма бронирования */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-gray-200 rounded-lg p-2">
                  <label className="text-xs text-gray-500">Заезд</label>
                  <input type="date" className="w-full text-sm mt-1 outline-none" />
                </div>
                <div className="border border-gray-200 rounded-lg p-2">
                  <label className="text-xs text-gray-500">Выезд</label>
                  <input type="date" className="w-full text-sm mt-1 outline-none" />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-2">
                <label className="text-xs text-gray-500">{RU.common.guests}</label>
                <select className="w-full text-sm mt-1 outline-none">
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button variant="primary" fullWidth size="lg">
              {RU.action.book}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Бесплатная отмена в течение 24ч
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
