'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import { LocusDecisionBlock } from '@/shared/ui/locus/LocusDecisionBlock'
import { cn } from '@/shared/utils/cn'

interface ListingData {
  id: string
  title: string
  description: string
  city: string
  basePrice: number
  photos: Array<{ url: string }>
  amenities: Array<{ amenity: { label: string } }>
  rooms?: number
  beds?: number
  bathrooms?: number
}

interface LocusDecision {
  score: number
  verdict: string
  summary: string
  pros: string[]
  risks: string[]
  pricePosition: string
  recommendation: string
}

interface ListingResponse {
  item: ListingData
  decision?: LocusDecision
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

// Галерея (минимальная)
function Gallery({ photos, title }: { photos: Array<{ url: string }>; title: string }) {
  const [idx, setIdx] = useState(0)

  if (!photos.length) {
    return <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-4xl">🏠</div>
  }

  return (
    <div className="relative aspect-video rounded-xl bg-gray-100 overflow-hidden">
      <Image src={photos[idx].url} alt={title} fill className="object-cover" priority />
      {photos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => i > 0 ? i - 1 : photos.length - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white">←</button>
          <button onClick={() => setIdx(i => i < photos.length - 1 ? i + 1 : 0)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white">→</button>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {idx + 1}/{photos.length}
          </div>
        </>
      )}
    </div>
  )
}

// Блок "Почему это жильё вам подходит"
function WhyThisBlock({ decision }: { decision: LocusDecision }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="font-semibold text-gray-900 mb-3">Почему это жильё вам подходит</h2>
      
      {/* Оценка и вердикт */}
      <LocusDecisionBlock
        score={decision.score}
        verdict={decision.verdict}
        reasons={decision.pros.slice(0, 2)}
        tip={decision.recommendation}
        size="md"
      />

      {/* Риски (если есть) */}
      {decision.risks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-amber-700">
            ⚠ {decision.risks[0]}
          </div>
        </div>
      )}

      {/* Цена относительно рынка */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
        {decision.pricePosition}
      </div>

      {/* Главный вывод */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-blue-900">Главный вывод</div>
        <div className="text-blue-800">{decision.summary}</div>
      </div>
    </div>
  )
}

// Skeleton
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48" />
      <div className="aspect-video bg-gray-200 rounded-xl" />
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
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
 * ListingPageFinal — страница объявления v2
 * 
 * Блоки (строго в этом порядке):
 * 1. Основная информация (фото, цена, адрес)
 * 2. Блок "Почему это жильё вам подходит"
 * 3. Описание жилья
 * 4. Удобства
 * 5. Блок бронирования
 */
export function ListingPageFinal({ id }: { id: string }) {
  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)

  if (isLoading) return <PageSkeleton />

  if (error || !data?.item) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Не удалось загрузить</p>
        <Link href="/listings" className="mt-2 inline-block text-blue-600 hover:underline">← К поиску</Link>
      </div>
    )
  }

  const item = data.item
  const decision = data.decision

  return (
    <div className="space-y-4">
      {/* Навигация */}
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Главная</Link>
        {' / '}
        <Link href="/listings" className="hover:text-gray-700">Поиск</Link>
        {' / '}
        <span className="text-gray-900">{item.city}</span>
      </nav>

      {/* Блок 1: Основная информация */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
        <p className="text-gray-500">{item.city}</p>
      </div>

      {/* Фото */}
      <Gallery photos={item.photos} title={item.title} />

      {/* Контент */}
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {/* Блок 2: Почему подходит */}
          {decision && <WhyThisBlock decision={decision} />}

          {/* Блок 3: Описание */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Описание</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Блок 4: Удобства */}
          {item.amenities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Удобства</h2>
              <div className="flex flex-wrap gap-2">
                {item.amenities.map((a, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                    {a.amenity.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Блок 5: Бронирование */}
        <div className="md:sticky md:top-4 md:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatPrice(item.basePrice)} ₽
              <span className="text-base font-normal text-gray-500"> / ночь</span>
            </p>

            {decision && (
              <p className="text-sm text-gray-500 mb-4">{decision.pricePosition}</p>
            )}

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-gray-200 rounded-lg p-2">
                  <label className="text-xs text-gray-500">Заезд</label>
                  <input type="date" className="w-full text-sm mt-1" />
                </div>
                <div className="border border-gray-200 rounded-lg p-2">
                  <label className="text-xs text-gray-500">Выезд</label>
                  <input type="date" className="w-full text-sm mt-1" />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-2">
                <label className="text-xs text-gray-500">Гости</label>
                <select className="w-full text-sm mt-1">
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
