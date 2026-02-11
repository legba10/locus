'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import { LocusDecisionBlock, WhyFitsBlock, RisksBlock } from '@/components/LocusDecisionBlock'
import { LocusDecisionCore } from '@/shared/types/decision'
import { cn } from '@/shared/utils/cn'

interface ListingData {
  id: string
  title: string
  description: string
  city: string
  address?: string
  basePrice: number
  photos: Array<{ url: string }>
  amenities: Array<{ amenity: { label: string } }>
  rooms?: number
  beds?: number
  bathrooms?: number
}

interface ListingResponse {
  listing?: ListingData
  item?: ListingData
  decision?: LocusDecisionCore
  whyFits?: string[]
  risks?: string[]
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

// Gallery
function Gallery({ photos, title }: { photos: Array<{ url: string }>; title: string }) {
  const [idx, setIdx] = useState(0)

  if (!photos.length) {
    return (
      <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Нет фото
      </div>
    )
  }

  return (
    <div className="relative aspect-video rounded-xl bg-gray-100 overflow-hidden">
      <Image src={photos[idx].url} alt={title} fill className="object-cover" priority />
      {photos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => i > 0 ? i - 1 : photos.length - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center hover:bg-white shadow">←</button>
          <button onClick={() => setIdx(i => i < photos.length - 1 ? i + 1 : 0)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center hover:bg-white shadow">→</button>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
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
 * ListingPage — Decision-First Layout
 * 
 * BLOCK ORDER (STRICT):
 * 1. LocusDecisionBlock (main block)
 * 2. Price + booking
 * 3. Gallery
 * 4. Why fits (max 3 points)
 * 5. Risks (max 2 points)
 * 6. Description
 * 7. Amenities
 * 8. Map
 * 
 * RULE: Decision block must be visible without scroll.
 */
export function ListingPage({ id }: { id: string }) {
  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)

  if (isLoading) return <PageSkeleton />

  const item = data?.listing ?? data?.item
  if (error || !item) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700 mb-2">Не удалось загрузить</p>
        <Link href="/listings" className="text-blue-600 hover:underline">← К поиску</Link>
      </div>
    )
  }

  const { decision, whyFits, risks } = data ?? {}

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

      {/* BLOCK 1: Decision (must be visible without scroll) */}
      {decision && (
        <LocusDecisionBlock decision={decision} variant="full" />
      )}

      {/* BLOCK 2: Price + Booking */}
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {/* BLOCK 3: Gallery */}
          <Gallery photos={item.photos} title={item.title} />

          {/* BLOCK 4: Why fits (max 3) */}
          {whyFits && whyFits.length > 0 && (
            <WhyFitsBlock reasons={whyFits} />
          )}

          {/* BLOCK 5: Risks (max 2) */}
          {risks && risks.length > 0 && (
            <RisksBlock risks={risks} />
          )}

          {/* BLOCK 6: Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Описание</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* BLOCK 7: Amenities */}
          {item.amenities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Удобства</h2>
              <div className="flex flex-wrap gap-2">
                {item.amenities.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
                    {a.amenity.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* BLOCK 8: Map placeholder */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 h-48 flex items-center justify-center">
            <span className="text-gray-400">🗺️ Карта</span>
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="md:sticky md:top-4 md:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatPrice(item.basePrice)} ₽
              <span className="text-base font-normal text-gray-500"> / ночь</span>
            </p>

            {item.address && (
              <p className="text-sm text-gray-500 mb-4">{item.address}</p>
            )}

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

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              Забронировать
            </button>

            {item.beds && (
              <p className="text-center text-xs text-gray-400 mt-3">
                {item.rooms} комн. • {item.beds} спальн. • {item.bathrooms} санузел
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
