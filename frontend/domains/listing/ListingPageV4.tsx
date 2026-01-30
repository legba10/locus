'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import { Card, Button, DecisionBlock, PersonalizedFitBlock, Tag, Divider, type LocusDecision } from '@/ui-system'
import { normalizeListing, normalizeDecision, type RawListing, type RawDecision } from '@/core/adapters'
import { cn } from '@/shared/utils/cn'

interface ListingResponse {
  item: RawListing
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
      <div className="aspect-video bg-gray-200 rounded-xl" />
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
    </div>
  )
}

/**
 * ListingPageV4 — Product Logic
 * 
 * Строгий порядок блоков:
 * 
 * 1. Основное (Фото, Цена, Адрес, Кнопки действий)
 * 2. ГЛАВНЫЙ БЛОК — "Почему это жильё вам подходит"
 * 3. Краткое описание
 * 4. Удобства
 * 5. Локация
 */
export function ListingPageV4({ id }: { id: string }) {
  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)

  if (isLoading) return <PageSkeleton />

  if (error || !data?.item) {
    return (
      <Card variant="bordered" className="p-6 text-center">
        <p className="text-red-600 mb-2">Не удалось загрузить объявление</p>
        <Link href="/listings" className="text-blue-600 hover:underline">← К поиску</Link>
      </Card>
    )
  }

  // Normalize data - UI never depends on "perfect data"
  const item = normalizeListing(data.item)
  const decision = data.decision ? normalizeDecision(data.decision) : null
  const personalizedReasons = data.personalizedReasons || []

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

      {/* ═══════════════════════════════════════════════════════════════
          БЛОК 1 — Основное
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>

          {/* Фото */}
          <Gallery photos={item.photos} title={item.title} />

          {/* ═══════════════════════════════════════════════════════════════
              БЛОК 2 — ГЛАВНЫЙ БЛОК ПРОДУКТА
              "Почему это жильё вам подходит"
              ═══════════════════════════════════════════════════════════════ */}
          {decision && (
            <DecisionBlock 
              decision={{
                score: decision.score,
                verdict: decision.verdict,
                explanation: decision.recommendation || `Оценка: ${decision.score}/100`,
                pros: decision.reasons,
                risks: decision.risks,
                priceDiff: decision.priceDiff,
                demandLevel: decision.demandLevel,
                recommendation: decision.recommendation,
              }} 
              variant="full"
              title="Почему это жильё вам подходит"
            />
          )}

          {/* Подходит именно вам */}
          {personalizedReasons && personalizedReasons.length > 0 && (
            <PersonalizedFitBlock reasons={personalizedReasons} />
          )}

          {/* ═══════════════════════════════════════════════════════════════
              БЛОК 3 — Краткое описание
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <h2 className="font-semibold text-gray-900 mb-2">Описание</h2>
            <p className="text-gray-600 whitespace-pre-wrap line-clamp-6">{item.description}</p>
          </Card>

          {/* ═══════════════════════════════════════════════════════════════
              БЛОК 4 — Удобства
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
              БЛОК 5 — Локация
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

        {/* Sidebar — Цена + Бронирование */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card variant="bordered">
            {/* Цена */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(item.basePrice)} ₽</span>
              <span className="text-gray-500"> / ночь</span>
            </div>

            {/* Параметры */}
            {(item.rooms || item.beds || item.bathrooms) && (
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                {item.rooms && <span>{item.rooms} комн.</span>}
                {item.beds && <span>{item.beds} спальн.</span>}
                {item.bathrooms && <span>{item.bathrooms} санузел</span>}
              </div>
            )}

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
