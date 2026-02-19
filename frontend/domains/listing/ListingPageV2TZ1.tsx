'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { useQuery } from '@tanstack/react-query'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { addPendingReminder } from '@/shared/reviews/reviewReminderStorage'
import { useAuthStore } from '@/domains/auth'
import { amenitiesToLabels, amenityKeysFromApi } from '@/core/i18n/ru'
import { scoring, type Listing, type UserParams } from '@/domains/ai/ai-engine'
import { cn } from '@/shared/utils/cn'
import {
  ListingGallery,
  ListingOwner,
  ListingCta,
  ListingBooking,
  ReviewWizard,
  ReviewCard,
} from '@/components/listing'

interface ListingPageV2TZ1Props {
  id: string
}

interface ListingResponse {
  listing?: {
    id: string
    title: string
    description: string
    city: string
    addressLine?: string
    pricePerNight: number
    bedrooms?: number
    area?: number
    floor?: number
    totalFloors?: number
    images?: Array<{ url: string; alt?: string }>
    photos?: Array<{ url: string }>
    amenities?: unknown
    owner?: { id: string; name: string; avatar: string | null; rating?: number | null; listingsCount?: number }
  }
  item?: ListingResponse['listing']
}

interface PublicOwnerProfile {
  id: string
  name: string
  avatar: string | null
  rating_avg: number | null
  reviews_count: number
}

interface RatingSummary {
  avg: number | null
  weightedAvg?: number | null
  count: number
  distribution: Record<number, number>
  percent?: number | null
}

const TRUST_BADGES = [
  { key: 'verified_docs', label: 'Проверено документами' },
  { key: 'owner', label: 'Собственник' },
  { key: 'agent', label: 'Агент' },
  { key: 'superhost', label: 'Супер-хозяин' },
] as const

export function ListingPageV2TZ1({ id }: ListingPageV2TZ1Props) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [isGalleryOpen, setGalleryOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [additionalReviews, setAdditionalReviews] = useState<any[]>([])
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false)

  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)
  const { data: reviewsData } = useFetch<{ items?: any[] }>(['listing-reviews', id], `/api/reviews/listing/${encodeURIComponent(id)}?limit=10`)
  const { data: ratingSummaryData } = useFetch<{ ok: boolean; summary: RatingSummary }>(
    ['listing-rating-summary', id],
    `/api/reviews/listing/${encodeURIComponent(id)}/summary`
  )

  const itemFromData = data?.listing ?? data?.item
  const ownerIdFromData = itemFromData?.owner?.id ?? (itemFromData as any)?.ownerId ?? ''
  const { data: ownerPublicData } = useQuery({
    queryKey: ['user-public', ownerIdFromData || ''],
    queryFn: () => apiFetchJson<{ profile: PublicOwnerProfile }>(`/api/users/${encodeURIComponent(ownerIdFromData)}/public`),
    enabled: Boolean(ownerIdFromData),
  })

  const photos = (itemFromData?.images || itemFromData?.photos || []).map((p: any) => ({
    url: p?.url ?? '',
    alt: p?.alt ?? itemFromData?.title ?? '',
  }))
  const photosLength = photos.length

  useEffect(() => {
    if (!isGalleryOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isGalleryOpen])

  useEffect(() => {
    if (!isGalleryOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGalleryOpen(false)
      else if (photosLength > 1 && e.key === 'ArrowLeft') setActiveImage((i) => (i - 1 + photosLength) % photosLength)
      else if (photosLength > 1 && e.key === 'ArrowRight') setActiveImage((i) => (i + 1) % photosLength)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isGalleryOpen, photosLength])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <div className="max-w-[720px] mx-auto px-4 py-4 md:py-6">
          <div className="space-y-4">
            <div className="aspect-[16/10] rounded-[18px] skeleton-shimmer-tz12" />
            <div className="h-8 w-2/3 skeleton-shimmer-tz12 rounded-[12px]" />
            <div className="h-24 skeleton-shimmer-tz12 rounded-[16px]" />
          </div>
        </div>
      </div>
    )
  }

  const item = data?.listing ?? data?.item
  if (error || !item) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-[18px] font-semibold text-[var(--text-main)] mb-2">Объявление не найдено</h3>
          <Link href="/listings" className="text-[var(--accent)] hover:opacity-90 text-[14px]">← Вернуться к поиску</Link>
        </div>
      </div>
    )
  }

  const listingData: Listing = {
    id: item.id ?? '',
    city: item.city ?? '',
    basePrice: Number((item as any).pricePerNight ?? (item as any).basePrice ?? 0),
    type: 'apartment',
    bedrooms: item.bedrooms,
    area: item.area,
    views: (item as any).views,
    rating: (item as any).rating,
    amenities: amenityKeysFromApi(item.amenities),
    description: item.description ?? '',
  }
  const aiScoreResult = scoring(listingData, {} as UserParams)
  const aiScore = aiScoreResult?.score ?? 0
  const amenities = amenitiesToLabels(item.amenities ?? undefined)
  const priceValue = Number((item as any).pricePerNight ?? (item as any).basePrice ?? 0)
  const owner = item.owner ?? { id: (item as any).ownerId || '', name: 'Пользователь', avatar: null, rating: null, listingsCount: 0 }

  const handleWrite = async () => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listings/${id}`)}`)
      return
    }
    setWriteLoading(true)
    try {
      const conv = await apiFetchJson<{ id: string }>(`/chats/by-listing/${item.id}`, { method: 'POST' })
      router.push(`/messages?chat=${conv.id}`)
    } catch {
      router.push(`/messages?listing=${item.id}`)
    } finally {
      setWriteLoading(false)
    }
  }

  const handleBook = () => document.getElementById('listing-booking')?.scrollIntoView({ behavior: 'smooth' })

  const handleBookingConfirm = async (data: { checkIn: Date; checkOut: Date; guests: number }) => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listings/${id}`)}`)
      return
    }
    try {
      const res = await apiFetchJson<{ item?: { id?: string; listingId?: string; checkOut?: string }; conversationId?: string | null }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          listingId: item.id,
          checkIn: data.checkIn.toISOString(),
          checkOut: data.checkOut.toISOString(),
          guestsCount: data.guests,
        }),
      })
      const booking = res?.item
      if (booking?.id && booking?.listingId && booking?.checkOut) {
        addPendingReminder({
          bookingId: booking.id,
          listingId: booking.listingId,
          checkOut: typeof booking.checkOut === 'string' ? booking.checkOut : new Date(booking.checkOut).toISOString(),
        })
      }
      if (res?.conversationId) router.push(`/messages?chat=${res.conversationId}`)
    } catch {}
  }

  const ratingSummary = ratingSummaryData?.summary
  const ratingAvg = ratingSummary?.weightedAvg ?? ratingSummary?.avg ?? (item as any).rating ?? null
  const ratingCount = ratingSummary?.count ?? 0
  const baseReviews = reviewsData?.items ?? []
  const allReviews = [...baseReviews, ...additionalReviews]
  const ownerMerged = {
    id: owner.id,
    name: ownerPublicData?.profile?.name ?? owner.name,
    avatar: ownerPublicData?.profile?.avatar ?? owner.avatar,
    rating: ownerPublicData?.profile?.rating_avg ?? owner.rating ?? null,
    reviewsCount: ownerPublicData?.profile?.reviews_count ?? (owner as any).reviews_count ?? null,
    listingsCount: (owner as any).listingsCount ?? 0,
    lastSeen: (ownerPublicData?.profile as any)?.last_seen ?? null,
  }

  const aiBullets = [
    aiScore >= 70 ? 'Цена ниже рынка' : 'Цена по рынку',
    'Район безопасный',
    'Ликвидность высокая',
  ]

  const activeTrustBadges = [
    aiScore >= 70 && 'verified_docs',
    true && 'owner',
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-[var(--bg-main)]">
      <div className="max-w-[720px] mx-auto px-4 py-4 md:py-6">
        <div className="mb-4">
          <Link href="/listings" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--accent)] inline-flex items-center gap-1.5 font-medium">
            ← Назад к поиску
          </Link>
        </div>

        {/* 1. Галерея: основная + полноэкран, планировка, видео, 3D (плейсхолдеры) */}
        <section className="mb-6">
          <div className="rounded-[18px] overflow-hidden bg-[var(--bg-input)]">
            <ListingGallery
              photos={photos}
              title={item.title ?? ''}
              verified={aiScore >= 70}
              variant="detail"
              onOpenFullscreen={photos.length > 0 ? () => setGalleryOpen(true) : undefined}
            />
          </div>
          <div className="flex gap-2 mt-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="flex-shrink-0 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[13px] font-medium text-[var(--text-primary)]"
            >
              Полноэкран
            </button>
            <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-[var(--bg-input)] text-[13px] text-[var(--text-muted)]">
              Планировка
            </span>
            <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-[var(--bg-input)] text-[13px] text-[var(--text-muted)]">
              Видео
            </span>
            <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-[var(--bg-input)] text-[13px] text-[var(--text-muted)]">
              3D тур
            </span>
          </div>
        </section>

        {/* 2. Инфо: цена, адрес, метро, карта, хозяин, рейтинг */}
        <section className="mb-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] p-4 md:p-6">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-4">Инфо</h2>
          <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {priceValue > 0 ? `${priceValue.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
            <span className="text-base font-normal text-[var(--text-muted)]"> / мес</span>
          </p>
          {item.addressLine && <p className="text-[14px] text-[var(--text-secondary)]">{item.addressLine}</p>}
          {item.city && <p className="text-[14px] text-[var(--text-secondary)]">{item.city}</p>}
          <p className="text-[14px] text-[var(--text-muted)] mt-1">Метро: 5 мин</p>
          {ratingAvg != null && (
            <p className="mt-2 text-[14px] text-amber-600 font-medium">★ {ratingAvg.toFixed(1)} ({ratingCount} отзывов)</p>
          )}
          <div className="mt-4 h-40 rounded-xl overflow-hidden bg-[var(--bg-input)] flex items-center justify-center">
            {(item as any).lat && (item as any).lng ? (
              <iframe
                src={`https://yandex.ru/map-widget/v1/?ll=${(item as any).lng},${(item as any).lat}&z=15&pt=${(item as any).lng},${(item as any).lat}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Карта"
              />
            ) : (
              <span className="text-[var(--text-muted)] text-sm">Карта</span>
            )}
          </div>
          <div className="mt-4">
            <ListingOwner
              owner={{
                id: ownerMerged.id,
                name: ownerMerged.name ?? 'Пользователь',
                avatar: ownerMerged.avatar ?? null,
                rating: ownerMerged.rating ?? null,
                reviewsCount: ownerMerged.reviewsCount ?? null,
                listingsCount: ownerMerged.listingsCount ?? null,
                lastSeen: ownerMerged.lastSeen ?? null,
              }}
              onWrite={handleWrite}
            />
          </div>
        </section>

        {/* 3. AI-блок */}
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-[var(--bg-card)] border border-violet-100 dark:border-violet-800/50 p-4 md:p-6">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">AI анализ</h2>
          <ul className="space-y-2">
            {aiBullets.map((text, i) => (
              <li key={i} className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                <span className="text-violet-500">—</span> {text}
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Статусы доверия */}
        <section className="mb-6 flex flex-wrap gap-2">
          {TRUST_BADGES.filter((b) => activeTrustBadges.includes(b.key)).map((b) => (
            <span
              key={b.key}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] text-[13px] font-medium text-[var(--text-primary)]"
            >
              <span className="text-emerald-500">✓</span> {b.label}
            </span>
          ))}
        </section>

        {/* Быстрые действия + бронирование */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsFavorite((f) => !f)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium border border-[var(--border-main)]',
              isFavorite ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[var(--bg-card)] text-[var(--text-primary)]'
            )}
          >
            ❤️ {isFavorite ? 'В избранном' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={handleWrite}
            disabled={writeLoading}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-primary)]"
          >
            💬 Написать
          </button>
          <button
            type="button"
            onClick={handleBook}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium bg-[var(--accent)] text-[var(--button-primary-text)]"
          >
            📅 Забронировать
          </button>
        </div>

        <div id="listing-booking" className="mb-6">
          <ListingBooking listingId={item.id} pricePerNight={priceValue || 0} onConfirm={handleBookingConfirm} />
        </div>

        {/* Описание, удобства */}
        {item.description && (
          <section className="mb-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] p-4 md:p-6">
            <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Описание</h2>
            <p className="text-[14px] text-[var(--text-secondary)] whitespace-pre-line">{item.description}</p>
          </section>
        )}
        {amenities.length > 0 && (
          <section className="mb-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] p-4 md:p-6">
            <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Удобства</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((label, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] text-[13px] text-[var(--text-secondary)]">
                  {label}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Отзывы */}
        <section className="mb-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] p-4 md:p-6">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-4">Отзывы</h2>
          {allReviews.length === 0 ? (
            <p className="text-[14px] text-[var(--text-muted)]">Отзывов пока нет.</p>
          ) : (
            <div className="space-y-4">
              {allReviews.slice(0, 5).map((r: any) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
          <div className="mt-4">
            <ReviewWizard
              listingId={id}
              ownerId={owner?.id}
              userAlreadyReviewed={allReviews.some((r: any) => (r.authorId ?? r.author?.id) === user?.id)}
              onSubmitted={() => {
                setAdditionalReviews([])
              }}
            />
          </div>
        </section>
      </div>

      {/* Полноэкранная галерея */}
      {isGalleryOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Галерея"
        >
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
            aria-label="Закрыть"
          >
            ×
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveImage((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                aria-label="Предыдущее"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => setActiveImage((i) => (i + 1) % photos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                aria-label="Следующее"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <Image
            src={photos[activeImage]?.url ?? ''}
            alt={`${item.title ?? 'Объявление'} — ${activeImage + 1} из ${photos.length}`}
            width={1200}
            height={800}
            className="max-h-[85vh] w-auto object-contain px-12"
            unoptimized={(photos[activeImage]?.url ?? '').startsWith('http')}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={cn('w-2.5 h-2.5 rounded-full transition-all', activeImage === i ? 'bg-white scale-110' : 'bg-white/40')}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
