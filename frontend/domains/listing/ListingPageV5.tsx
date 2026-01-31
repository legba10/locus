'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import { Card, Button, DecisionBlockV2, Tag, Divider, type DecisionData } from '@/ui-system'
import { normalizeListing, normalizeDecision, type RawListing, type RawDecision } from '@/core/adapters'
import { cn } from '@/shared/utils/cn'

interface ListingResponse {
  listing?: RawListing
  item?: RawListing
  decision?: RawDecision
  personalizedReasons?: string[]
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

// Gallery
function Gallery({ photos, title }: { photos: Array<{ url: string }>; title: string }) {
  const [idx, setIdx] = useState(0)

  if (!photos.length) {
    return <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-5xl">🏠</div>
  }

  return (
    <div className="relative aspect-video rounded-xl bg-gray-100 overflow-hidden">
      <Image src={photos[idx].url} alt={title} fill className="object-cover" priority />
      {photos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => i > 0 ? i - 1 : photos.length - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white shadow text-lg">←</button>
          <button onClick={() => setIdx(i => i < photos.length - 1 ? i + 1 : 0)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white shadow text-lg">→</button>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {idx + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  )
}

// Skeleton
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48" />
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="aspect-video bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
    </div>
  )
}

/**
 * ListingPageV5 — Product Version V5
 * 
 * ORDER OF BLOCKS (STRICT):
 * 
 * 1️⃣ AI DECISION BLOCK (TOP PRIORITY) - must be visible without scroll
 * 2️⃣ Price & booking
 * 3️⃣ Photos
 * 4️⃣ Key facts
 * 5️⃣ Description
 * 6️⃣ Amenities
 * 7️⃣ Location
 * 
 * TOP SECTION (NEW):
 * 
 * [AI Analysis]
 * 
 * 82 / 100 — Good option
 * 
 * Why it fits:
 * ✓ Price below market by 12%
 * ✓ Matches your search history
 * ⚠ Medium competition
 * 
 * Tip:
 * 💡 Better to book within 24 hours
 */
export function ListingPageV5({ id }: { id: string }) {
  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)

  if (isLoading) return <PageSkeleton />

  const rawItem = data?.listing ?? data?.item
  if (error || !rawItem) {
    return (
      <Card variant="bordered" className="p-6 text-center">
        <p className="text-red-600 mb-2">Не удалось загрузить объявление</p>
        <Link href="/listings" className="text-blue-600 hover:underline">← К поиску</Link>
      </Card>
    )
  }

  // Normalize data
  const item = normalizeListing(rawItem)
  const rawDecision = data.decision ? normalizeDecision(data.decision) : null
  const personalizedReasons = data.personalizedReasons || []

  // If no decision from API, create one from normalized listing data
  const decision = rawDecision || (item.score > 0 ? {
    score: item.score,
    verdict: item.verdict,
    reasons: item.reasons || [],
    risks: [],
    priceDiff: item.priceDiff || 0,
    demandLevel: item.demandLevel,
    recommendation: item.score >= 70 ? 'Рекомендуем рассмотреть' : '',
  } : null)

  // Create DecisionData for DecisionBlockV2
  // Note: reasons and risks are passed as string arrays, the component converts them
  const decisionData: DecisionData = decision ? {
    score: decision.score,
    verdict: decision.verdict,
    reasons: decision.reasons,
    risks: decision.risks,
    priceDiff: decision.priceDiff,
    demandLevel: decision.demandLevel,
    recommendation: decision.recommendation,
    personalizedReasons,
  } : {
    score: 0,
    verdict: 'Оценка формируется',
    reasons: ['Анализируем данные объявления'],
    risks: [],
    priceDiff: 0,
    demandLevel: 'medium',
    recommendation: 'Данных недостаточно для полного анализа',
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Главная</Link>
        {' / '}
        <Link href="/listings" className="hover:text-gray-700">Поиск</Link>
        {' / '}
        <span className="text-gray-900">{item.city}</span>
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>

      {/* ═══════════════════════════════════════════════════════════════
          1️⃣ AI DECISION BLOCK (TOP PRIORITY)
          Must be visible without scroll
          ═══════════════════════════════════════════════════════════════ */}
      <DecisionBlockV2
        decision={decisionData}
        variant="page"
        title="Анализ LOCUS"
        className="mb-4"
      />

      {/* Product Metrics Visibility */}
      <div className="flex flex-wrap gap-2 mb-4">
        {decisionData.priceDiff !== undefined && decisionData.priceDiff < -5 && (
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
            Ниже рынка на {Math.abs(Math.round(decisionData.priceDiff))}%
          </span>
        )}
        {decisionData.priceDiff !== undefined && decisionData.priceDiff > 10 && (
          <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
            Выше рынка на {Math.round(decisionData.priceDiff)}%
          </span>
        )}
        {decisionData.demandLevel === 'high' && (
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
            🔥 Высокий спрос
          </span>
        )}
        {decisionData.demandLevel === 'low' && (
          <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
            Низкий спрос
          </span>
        )}
        {decisionData.score >= 80 && (
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
            ✓ Низкий риск
          </span>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* ═══════════════════════════════════════════════════════════════
              3️⃣ Photos
              ═══════════════════════════════════════════════════════════════ */}
          <Gallery photos={item.photos} title={item.title} />

          {/* ═══════════════════════════════════════════════════════════════
              4️⃣ Key facts
              ═══════════════════════════════════════════════════════════════ */}
          {(item.rooms || item.beds || item.bathrooms) && (
            <Card variant="bordered">
              <h2 className="font-semibold text-gray-900 mb-2">Основные параметры</h2>
              <div className="flex gap-4 text-sm text-gray-600">
                {item.rooms > 0 && <span>{item.rooms} комн.</span>}
                {item.beds > 0 && <span>{item.beds} спальн.</span>}
                {item.bathrooms > 0 && <span>{item.bathrooms} санузел</span>}
              </div>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              5️⃣ Description
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <h2 className="font-semibold text-gray-900 mb-2">Описание</h2>
            <p className="text-gray-600 whitespace-pre-wrap line-clamp-6">{item.description}</p>
          </Card>

          {/* ═══════════════════════════════════════════════════════════════
              6️⃣ Amenities
              ═══════════════════════════════════════════════════════════════ */}
          {item.amenities.length > 0 && (
            <Card variant="bordered">
              <h2 className="font-semibold text-gray-900 mb-3">Удобства</h2>
              <div className="flex flex-wrap gap-2">
                {item.amenities.map((amenity, i) => (
                  <Tag key={i} icon={amenity.icon}>
                    {amenity.label}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              7️⃣ Location
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <h2 className="font-semibold text-gray-900 mb-2">Расположение</h2>
            {item.address && (
              <p className="text-gray-600 mb-3">{item.address}, {item.city}</p>
            )}
            <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-lg">🗺️ Карта</span>
            </div>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            2️⃣ Price & Booking (Sidebar)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card variant="bordered">
            {/* Price */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(item.basePrice)} ₽</span>
              <span className="text-gray-500"> / ночь</span>
            </div>

            <Divider />

            {/* Booking Form */}
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
                <label className="text-xs text-gray-500">Гости</label>
                <select className="w-full text-sm mt-1 outline-none">
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button variant="primary" fullWidth size="lg">
              Забронировать
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
