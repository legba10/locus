'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import type { ListingDetailResponse } from '@/domains/listing/listing-api'
import type { ListingIntelligence } from '@/domains/listing/listing-types'
import { Button } from '@/shared/ui/Button'
import { InsightPanel } from '@/shared/ui/insight/InsightPanel'
import { InsightBadge } from '@/shared/ui/insight/InsightBadge'
import { cn } from '@/shared/utils/cn'

// Types for AI Insight
interface AIInsight {
  score: number
  scoreLabel: string
  pros: string[]
  risks: string[]
  priceRecommendation: number
  pricePosition: 'below_market' | 'market' | 'above_market'
  priceDiff: number
  demandLevel: 'low' | 'medium' | 'high'
  bookingProbability: number
  tips: string[]
  summary: string
}

// Format price
function formatPrice(amount: number, currency: string = 'RUB') {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

// Transform intelligence to insight format
function transformToInsight(intelligence?: ListingIntelligence, price?: number): AIInsight | null {
  if (!intelligence) return null
  
  const positionMap: Record<string, 'below_market' | 'market' | 'above_market'> = {
    'below_market': 'below_market',
    'at_market': 'market',
    'above_market': 'above_market',
    'market': 'market',
  }
  
  return {
    score: intelligence.qualityScore,
    scoreLabel: intelligence.qualityScore >= 80 ? 'excellent' : intelligence.qualityScore >= 60 ? 'good' : intelligence.qualityScore >= 40 ? 'average' : 'needs_improvement',
    pros: intelligence.explanation?.bullets?.filter((b: string) => !b.includes('-') && !b.includes('риск')) ?? [],
    risks: intelligence.explanation?.bullets?.filter((b: string) => b.includes('-') || b.toLowerCase().includes('риск')) ?? [],
    priceRecommendation: intelligence.recommendedPrice,
    pricePosition: positionMap[intelligence.marketPosition] ?? 'market',
    priceDiff: Math.round(intelligence.priceDeltaPercent),
    demandLevel: intelligence.demandScore >= 70 ? 'high' : intelligence.demandScore >= 40 ? 'medium' : 'low',
    bookingProbability: Math.round(intelligence.bookingProbability * 100),
    tips: intelligence.explanation?.suggestions ?? [],
    summary: intelligence.explanation?.text ?? 'Анализ объявления',
  }
}

// Photo Gallery
function PhotoGallery({ photos, title }: { photos: Array<{ url: string; alt?: string }>; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-2">🏠</div>
          <p className="text-sm">Нет фотографий</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={photos[selectedIndex].url}
          alt={photos[selectedIndex].alt || title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition"
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition"
            >
              <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        {/* Photo counter */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
          {selectedIndex + 1} / {photos.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <button
              key={photo.url}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                'relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition',
                i === selectedIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image src={photo.url} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Amenities list
function AmenitiesList({ amenities }: { amenities: string[] }) {
  const icons: Record<string, string> = {
    wifi: '📶',
    kitchen: '🍳',
    parking: '🚗',
    pets: '🐾',
    balcony: '🌅',
    'air conditioning': '❄️',
    heating: '🔥',
    tv: '📺',
    washer: '🧺',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {amenities.map((amenity) => (
        <div key={amenity} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <span className="text-xl">{icons[amenity.toLowerCase()] || '✓'}</span>
          <span className="text-sm text-gray-700">{amenity}</span>
        </div>
      ))}
    </div>
  )
}

// Loading skeleton
function ListingDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="aspect-[16/9] rounded-xl bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    </div>
  )
}

// Main component
export function ListingDetailClient({ id }: { id: string }) {
  const { data, isLoading, error } = useFetch<ListingDetailResponse>(['listing', id], `/api/listings/${id}`)
  const item = data?.listing ?? data?.item

  if (isLoading) {
    return <ListingDetailSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-lg font-semibold text-red-800">Не удалось загрузить объявление</h3>
        <p className="text-red-600 mt-1">Попробуйте обновить страницу</p>
        <Link href="/search" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Вернуться к поиску
        </Link>
      </div>
    )
  }

  if (!item) return null

  const photos = item.photos?.length ? item.photos : item.images
  const insight = transformToInsight(item.intelligence, item.pricePerNight)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Главная</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-gray-700">Поиск</Link>
        <span>/</span>
        <span className="text-gray-900">{item.city}</span>
      </nav>

      {/* Title section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{item.title}</h1>
            {insight && <InsightBadge score={insight.score} size="md" />}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              📍 {item.city}
            </span>
            <span className="flex items-center gap-1">
              ⭐ {item.rating.toFixed(1)} ({item.reviewCount} отзывов)
            </span>
            {item.capacityGuests && (
              <span>👥 до {item.capacityGuests} гостей</span>
            )}
          </div>
        </div>
        <button className="rounded-full border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500 transition">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Photo gallery */}
      <PhotoGallery photos={photos} title={item.title} />

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* AI Insight Panel */}
          {insight && (
            <InsightPanel insight={insight} currentPrice={item.pricePerNight} />
          )}

          {/* Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Описание</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Amenities */}
          {item.amenities && item.amenities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Удобства</h2>
              <AmenitiesList amenities={item.amenities} />
            </div>
          )}

          {/* Property details */}
          {(item.bedrooms || item.beds || item.bathrooms) && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">О жилье</h2>
              <div className="grid grid-cols-3 gap-4">
                {item.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{item.bedrooms}</p>
                    <p className="text-sm text-gray-500">спальни</p>
                  </div>
                )}
                {item.beds && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{item.beds}</p>
                    <p className="text-sm text-gray-500">кровати</p>
                  </div>
                )}
                {item.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{item.bathrooms}</p>
                    <p className="text-sm text-gray-500">ванные</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Booking card (sticky) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(item.pricePerNight, item.currency)}
                <span className="text-base font-normal text-gray-500"> / ночь</span>
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 p-3">
                  <label className="text-xs text-gray-500">Заезд</label>
                  <input
                    type="date"
                    className="mt-1 w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <label className="text-xs text-gray-500">Выезд</label>
                  <input
                    type="date"
                    className="mt-1 w-full bg-transparent text-sm text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <label className="text-xs text-gray-500">Гости</label>
                <select className="mt-1 w-full bg-transparent text-sm text-gray-900 focus:outline-none">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button className="w-full mb-3">Забронировать</Button>
            
            <p className="text-center text-xs text-gray-400">
              Вы пока ничего не платите
            </p>

            <hr className="my-4 border-gray-200" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{formatPrice(item.pricePerNight, item.currency)} × 5 ночей</span>
                <span>{formatPrice(item.pricePerNight * 5, item.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Сервисный сбор</span>
                <span>{formatPrice(Math.round(item.pricePerNight * 5 * 0.1), item.currency)}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Итого</span>
                <span>{formatPrice(Math.round(item.pricePerNight * 5 * 1.1), item.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
