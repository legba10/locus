'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/shared/utils/cn'
import { Gallery } from './Gallery'
import { StickyActions } from './StickyActions'
import { OwnerCard } from './OwnerCard'
import { AIMetrics } from './AIMetrics'
import { Amenities } from './Amenities'
import { ReviewCard } from './ReviewCard'
import { ListingCard } from '@/components/listing'
import { ListingBooking } from '@/components/listing'
import { ReviewWizard } from '@/components/listing'

export interface ListingLayoutProps {
  listingId: string
  title: string
  city: string
  price: number
  rooms: number | null
  area: number | null
  floor: number | null
  totalFloors: number | null
  aiScore: number
  photos: Array<{ url: string; alt?: string }>
  description: string
  amenities: string[]
  addressLine?: string
  lat?: number
  lng?: number
  owner: {
    id: string
    name: string
    avatar: string | null
    rating?: number | null
    reviewsCount?: number | null
  }
  ratingAvg: number | null
  reviewPercent: number | null
  ratingCount: number
  ratingDistribution: Record<number, number>
  reviews: Array<{
    id: string
    rating: number
    text: string | null
    createdAt: string
    author?: { id: string; profile?: { name: string | null; avatarUrl: string | null } | null }
    metrics?: Array<{ metricKey: string; value: number }>
  }>
  similarListings: Array<{
    id: string
    photo?: string
    title?: string
    price: number
    city: string
    district?: string
    score?: number
  }>
  isFavorite: boolean
  onFavoriteToggle: () => void
  onWrite: () => void
  onBook: () => void
  writeLoading: boolean
  onBookingConfirm: (data: { checkIn: Date; checkOut: Date; guests: number }) => void
  reviewFilter: 'all' | '5' | 'with_text' | 'recent'
  setReviewFilter: (f: 'all' | '5' | 'with_text' | 'recent') => void
  metricFilter: string
  setMetricFilter: (m: string) => void
  loadMoreReviews: () => void
  hasMoreReviews: boolean
  reviewsLoadingMore: boolean
  isReviewsLoading: boolean
  onReviewSubmitted: () => void
  userAlreadyReviewed: boolean
  isGalleryOpen: boolean
  setGalleryOpen: (open: boolean) => void
  activeImage: number
  setActiveImage: React.Dispatch<React.SetStateAction<number>>
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

export function ListingLayout(props: ListingLayoutProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const {
    listingId,
    title,
    city,
    price,
    rooms,
    area,
    floor,
    totalFloors,
    aiScore,
    photos,
    description,
    amenities,
    addressLine,
    lat,
    lng,
    owner,
    ratingAvg,
    reviewPercent,
    ratingCount,
    ratingDistribution,
    reviews,
    similarListings,
    isFavorite,
    onFavoriteToggle,
    onWrite,
    onBook,
    writeLoading,
    onBookingConfirm,
    reviewFilter,
    setReviewFilter,
    metricFilter,
    setMetricFilter,
    loadMoreReviews,
    hasMoreReviews,
    reviewsLoadingMore,
    isReviewsLoading,
    onReviewSubmitted,
    userAlreadyReviewed,
    isGalleryOpen,
    setGalleryOpen,
    activeImage,
    setActiveImage,
  } = props

  const chars: string[] = []
  if (rooms) chars.push(`${rooms} комн.`)
  if (area) chars.push(`${area} м²`)
  if (floor != null) chars.push(totalFloors ? `${floor}/${totalFloors} эт.` : `${floor} эт.`)
  const characteristics = chars.join(' · ')

  /* TZ-28: Вертикальная сетка: фото → 12px → заголовок → 6px → город+рейтинг → 12px → цена → 16px → описание. */
  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-[88px] md:pb-8">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="md:rounded-[24px] md:border md:border-[var(--border)] md:bg-[var(--bg-card)] md:p-6 md:shadow-[var(--shadow-card)] overflow-hidden">
        {/* 1. Галерея */}
        <div className="mb-3">
          <Gallery
            photos={photos}
            title={title}
            showBack
            isFavorite={isFavorite}
            onFavoriteClick={onFavoriteToggle}
            onOpenFullscreen={photos.length > 0 ? () => setGalleryOpen(true) : undefined}
          />
        </div>

        <div className="grid md:grid-cols-[1fr_360px] gap-6 md:items-start">
          <div className="space-y-4 md:space-y-5">
            {/* 2. Заголовок — 12px после фото */}
            <h1 className="text-[22px] md:text-[26px] font-bold text-[var(--text-main)] leading-tight">{title}</h1>

            {/* 3. Город + рейтинг — 6px после заголовка */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[var(--text-secondary)]">
              <span>{city}</span>
              {ratingAvg != null && ratingCount > 0 && (
                <span className="text-amber-600 font-medium">★ {ratingAvg.toFixed(1)} ({ratingCount})</span>
              )}
            </div>

            {/* 4. Цена — 12px после мета */}
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-[24px] md:text-[28px] font-bold text-[var(--text-main)]">{formatPrice(price)} ₽ <span className="text-[14px] font-normal text-[var(--text-secondary)]">/ ночь</span></p>
              {aiScore > 0 && (
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold text-[13px]">Подходит на {aiScore}%</span>
              )}
            </div>

            {/* 5. Краткие характеристики */}
            {characteristics && <p className="text-[14px] text-[var(--text-secondary)]">{characteristics}</p>}

            {/* 6. Строка карты: 📍 Город · 5 мин до метро · Показать на карту → modal (TZ-28) */}
            {(addressLine || (lat != null && lng != null)) && (
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              >
                <span aria-hidden>📍</span>
                <span>{city}</span>
                <span className="text-[var(--accent)] font-medium">Показать на карте</span>
              </button>
            )}

            <div className="md:hidden" aria-hidden />

            {/* 7. Описание — 16px после цены/характеристик */}
            {description && (
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5">
                <h2 className="text-[16px] font-bold text-[var(--text-main)] mb-2">Описание</h2>
                <p className={cn('text-[15px] text-[var(--text-main)] leading-relaxed whitespace-pre-line', !isDescriptionExpanded && 'line-clamp-3')} style={{ lineHeight: 1.6 }}>
                  {description}
                </p>
                <button type="button" onClick={() => setIsDescriptionExpanded((p) => !p)} className="mt-2 text-[14px] font-semibold text-[var(--accent)]">
                  {isDescriptionExpanded ? 'Свернуть' : 'Показать полностью'}
                </button>
              </div>
            )}

            {/* 8. Удобства */}
            <Amenities items={amenities} />

            {/* 9. AI-оценка — компактно, макс 12px между строками (TZ-28) */}
            <AIMetrics listingId={listingId} />

            {/* 10. Владелец */}
            {owner.id && (
              <OwnerCard owner={owner} onWrite={onWrite} />
            )}

            {/* ТЗ-8: Бронирование в потоке (мобильный) — ровный блок, отступы 12–16px */}
            <div id="listing-booking" className="md:hidden mt-5">
              <ListingBooking listingId={listingId} pricePerNight={price} onConfirm={onBookingConfirm} />
            </div>

            {/* 11. Отзывы */}
            <div id="reviews-section" className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-[20px] font-bold text-[var(--text-main)]">Отзывы</h2>
                <a href="#review-form" className="min-h-[44px] px-5 py-2.5 rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold inline-flex items-center justify-center">
                  Оставить отзыв
                </a>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-glass)] p-5 mb-6">
                <p className="text-[13px] text-[var(--text-secondary)] mb-1">Общий рейтинг</p>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-amber-500 text-[28px] leading-none">★</span>
                  <span className="text-3xl font-bold text-[var(--text-main)]">{ratingAvg != null ? ratingAvg.toFixed(1) : '—'}</span>
                  {reviewPercent != null && <span className="text-[16px] font-semibold text-[var(--accent)] tabular-nums">{reviewPercent}% положительных</span>}
                  <span className="text-[14px] text-[var(--text-secondary)]">
                    {ratingCount > 0 ? `на основе ${ratingCount} ${ratingCount === 1 ? 'отзыва' : ratingCount >= 2 && ratingCount <= 4 ? 'отзыва' : 'отзывов'}` : 'Отзывов пока нет'}
                  </span>
                </div>
                {ratingCount > 0 && (
                  <div className="mt-4 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingDistribution[star] ?? 0
                      const pct = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="w-8 text-[13px] text-[var(--text-secondary)]">{star}★</span>
                          <div className="flex-1 h-3 rounded-full bg-[var(--bg-glass)] overflow-hidden min-w-[60px]">
                            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="w-10 text-right text-[13px] text-[var(--text-secondary)] tabular-nums">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {(['all', '5', 'with_text', 'recent'] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setReviewFilter(f)} className={cn('min-h-[36px] px-3 rounded-[10px] text-[13px] font-medium transition-colors', reviewFilter === f ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-glass)] text-[var(--text-secondary)]')}>
                    {f === 'all' ? 'Все' : f === '5' ? 'Только 5★' : f === 'with_text' ? 'С текстом' : 'Последние'}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {['all', 'cleanliness', 'value', 'owner', 'location'].map((m) => (
                  <button key={m} type="button" onClick={() => setMetricFilter(m)} className={cn('min-h-[36px] px-3 rounded-[10px] text-[13px] font-medium transition-colors', metricFilter === m ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-glass)] text-[var(--text-secondary)]')}>
                    {m === 'all' ? 'По метрикам: все' : m === 'cleanliness' ? 'Чистота' : m === 'value' ? 'Цена/качество' : m === 'owner' ? 'Хозяин' : 'Район'}
                  </button>
                ))}
              </div>
              <p className="text-[16px] font-bold text-[var(--text-main)] mb-4">Отзывы пользователей</p>
              <div className="space-y-4 mb-6">
                {isReviewsLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="rounded-[20px] border border-[var(--border)] p-5 skeleton-glass h-24" />
                  ))
                ) : reviews.length === 0 ? (
                  <p className="text-[14px] text-[var(--text-secondary)] py-4">Отзывов пока нет. Будьте первым.</p>
                ) : (
                  reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                )}
              </div>
              {hasMoreReviews && (
                <button type="button" onClick={loadMoreReviews} disabled={reviewsLoadingMore} className="min-h-[44px] px-5 rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] text-[14px] font-medium text-[var(--text-main)] disabled:opacity-50">
                  {reviewsLoadingMore ? 'Загрузка…' : 'Показать ещё'}
                </button>
              )}
              <div id="review-form" className="mt-6">
                <ReviewWizard listingId={listingId} ownerId={owner.id} userAlreadyReviewed={userAlreadyReviewed} onSubmitted={onReviewSubmitted} />
              </div>
            </div>

            {/* 10. Похожие объявления */}
            {similarListings.length > 0 && (
              <section>
                <h2 className="text-[24px] font-bold text-[var(--text-main)] mb-4">Похожие объявления</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarListings.slice(0, 4).map((s) => (
                    <ListingCard key={s.id} id={s.id} photo={s.photo} title={s.title ?? 'Без названия'} price={s.price} city={s.city} district={s.district} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Правая колонка (ПК) — блок бронирования 360px */}
          <div className="listing-layout-booking-wrap-tz8 hidden md:block w-full min-w-0 md:max-w-[360px]">
            <ListingBooking listingId={listingId} pricePerNight={price} onConfirm={onBookingConfirm} />
          </div>
        </div>
        </div>
      </div>

      {/* TZ-28: Модал карты — 70–80% высоты, крестик закрытия */}
      {mapOpen && lat != null && lng != null && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" role="dialog" aria-modal="true" aria-label="Карта">
          <div className="relative w-full h-[75vh] sm:h-[70vh] sm:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-xl">
            <button type="button" onClick={() => setMapOpen(false)} className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[var(--text-main)] flex items-center justify-center shadow" aria-label="Закрыть">×</button>
            <iframe
              src={`https://yandex.ru/map-widget/v1/?ll=${lng},${lat}&z=15&pt=${lng},${lat}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Карта"
            />
          </div>
        </div>
      )}

      {/* Mobile: StickyActions внизу */}
      <div className="md:hidden">
        <StickyActions price={price} onWrite={onWrite} onBook={onBook} onSave={onFavoriteToggle} isSaved={isFavorite} writeLoading={writeLoading} />
      </div>

      {/* Fullscreen галерея — overlay с классом open для затемнения, z-index и overflow для корректного отображения */}
      {isGalleryOpen && photos.length > 0 && (
        <div className="fixed inset-0 overlay open flex items-center justify-center overflow-hidden" style={{ zIndex: 'var(--z-overlay)' }} role="dialog" aria-modal="true" aria-label="Галерея">
          <button type="button" onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Закрыть">×</button>
          {photos.length > 1 && (
            <>
              <button type="button" onClick={() => setActiveImage((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Предыдущее">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button type="button" onClick={() => setActiveImage((i) => (i + 1) % photos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Следующее">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <Image src={photos[activeImage]?.url ?? ''} alt={`${title} — фото ${activeImage + 1}`} width={1200} height={800} className="relative z-[1] max-h-[85vh] w-auto object-contain px-12" unoptimized={(photos[activeImage]?.url ?? '').startsWith('http')} />
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {photos.map((_, i) => (
                <button key={i} type="button" onClick={() => setActiveImage(i)} className={cn('w-2.5 h-2.5 rounded-full transition-all', activeImage === i ? 'bg-white scale-110' : 'bg-white/40')} aria-label={`Фото ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
