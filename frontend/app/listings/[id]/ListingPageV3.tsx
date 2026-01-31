'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import { LocusScoreBadge } from '@/shared/ui/locus/LocusScoreBadge'
import { LocusInsightBlock } from '@/shared/ui/locus/LocusInsightBlock'
import { LocusPriceBlock } from '@/shared/ui/locus/LocusPriceBlock'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/utils/cn'

interface ListingInsight {
  score: number
  verdict: string
  priceDiff: number
  pros: string[]
  cons: string[]
  risks: string[]
  demand: 'low' | 'medium' | 'high'
  bookingProbability: number
  recommendedPrice: number
  tips: string[]
}

interface ListingData {
  id: string
  title: string
  description: string
  city: string
  addressLine?: string
  lat?: number
  lng?: number
  basePrice: number
  currency: string
  photos: Array<{ url: string }>
  amenities: Array<{ amenity: { label: string } }>
  rooms?: number
  beds?: number
  bathrooms?: number
  capacityGuests?: number
  rating?: number
  reviewCount?: number
  insight?: ListingInsight
}

interface ListingResponse {
  listing?: ListingData
  item?: ListingData
}

function formatPrice(amount: number, currency: string = 'RUB') {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

// Галерея фото
function PhotoGallery({ photos, title }: { photos: Array<{ url: string }>; title: string }) {
  const [selected, setSelected] = useState(0)

  if (!photos.length) {
    return (
      <div className="aspect-[16/9] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-2">🏠</div>
          <p className="text-sm">Нет фото</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={photos[selected].url}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setSelected((i) => (i > 0 ? i - 1 : photos.length - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            >
              ←
            </button>
            <button
              onClick={() => setSelected((i) => (i < photos.length - 1 ? i + 1 : 0))}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            >
              →
            </button>
          </>
        )}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
          {selected + 1} / {photos.length}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg',
                i === selected ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image src={p.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Skeleton
function ListingPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="aspect-[16/9] bg-gray-200 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * ListingPageV3 — страница объявления
 * 
 * Блоки:
 * 1. Фото
 * 2. Цена + бронирование
 * 3. AI-анализ
 * 4. Описание
 * 5. Удобства
 * 6. Карта
 */
export function ListingPageV3({ id }: { id: string }) {
  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)
  const item = data?.listing ?? data?.item

  if (isLoading) return <ListingPageSkeleton />

  if (error || !item) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-lg font-semibold text-red-800">Не удалось загрузить</h3>
        <Link href="/listings" className="mt-4 inline-block text-blue-600 hover:underline">
          ← К поиску
        </Link>
      </div>
    )
  }

  const insight = item.insight

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Главная</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-gray-700">Поиск</Link>
        <span>/</span>
        <span className="text-gray-900">{item.city}</span>
      </nav>

      {/* Заголовок */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{item.title}</h1>
            {insight && <LocusScoreBadge score={insight.score} size="md" />}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>📍 {item.city}</span>
            {item.rating && (
              <span>⭐ {item.rating.toFixed(1)} ({item.reviewCount} отзывов)</span>
            )}
            {item.capacityGuests && (
              <span>👥 до {item.capacityGuests} гостей</span>
            )}
          </div>
        </div>
      </div>

      {/* Блок 1: Фото */}
      <PhotoGallery photos={item.photos} title={item.title} />

      {/* Контент */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Блок 3: AI-анализ */}
          {insight && (
            <LocusInsightBlock
              score={insight.score}
              verdict={insight.verdict}
              priceText={
                insight.priceDiff < -5 ? `Ниже рынка на ${Math.abs(insight.priceDiff)}%` :
                insight.priceDiff > 5 ? `Выше рынка на ${insight.priceDiff}%` :
                'Цена по рынку'
              }
              recommendation={
                insight.score >= 80 ? 'Отличный вариант! Рекомендуем.' :
                insight.score >= 60 ? 'Хороший вариант.' :
                'Изучите детали.'
              }
              pros={insight.pros}
              cons={insight.cons}
              risks={insight.risks}
              demand={insight.demand}
              bookingProbability={insight.bookingProbability}
              tips={insight.tips}
            />
          )}

          {/* Блок 4: Описание */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Описание</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Блок 5: Удобства */}
          {item.amenities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Удобства</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {item.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500">✓</span>
                    {a.amenity.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* О жилье */}
          {(item.rooms || item.beds || item.bathrooms) && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">О жилье</h2>
              <div className="grid grid-cols-3 gap-4">
                {item.rooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{item.rooms}</p>
                    <p className="text-sm text-gray-500">комнат</p>
                  </div>
                )}
                {item.beds && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{item.beds}</p>
                    <p className="text-sm text-gray-500">кроватей</p>
                  </div>
                )}
                {item.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{item.bathrooms}</p>
                    <p className="text-sm text-gray-500">ванных</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Блок 6: Карта */}
          {item.lat && item.lng && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Местоположение</h2>
              <div className="aspect-[16/9] rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                🗺️ Карта ({item.lat.toFixed(4)}, {item.lng.toFixed(4)})
              </div>
              {item.addressLine && (
                <p className="mt-3 text-sm text-gray-600">📍 {item.addressLine}</p>
              )}
            </div>
          )}
        </div>

        {/* Блок 2: Бронирование (sticky) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(item.basePrice, item.currency)}
                <span className="text-base font-normal text-gray-500"> / ночь</span>
              </p>
            </div>

            {/* Цена vs рынок */}
            {insight && (
              <LocusPriceBlock
                currentPrice={item.basePrice}
                recommendedPrice={insight.recommendedPrice}
                priceDiff={insight.priceDiff}
                position={
                  insight.priceDiff < -5 ? 'below_market' :
                  insight.priceDiff > 5 ? 'above_market' : 'market'
                }
                currency={item.currency}
                className="mb-4"
              />
            )}

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 p-3">
                  <label className="text-xs text-gray-500">Заезд</label>
                  <input type="date" className="mt-1 w-full bg-transparent text-sm" />
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <label className="text-xs text-gray-500">Выезд</label>
                  <input type="date" className="mt-1 w-full bg-transparent text-sm" />
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <label className="text-xs text-gray-500">Гости</label>
                <select className="mt-1 w-full bg-transparent text-sm">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button className="w-full mb-3">Забронировать</Button>
            <p className="text-center text-xs text-gray-400">Вы пока ничего не платите</p>
          </div>
        </div>
      </div>
    </div>
  )
}
