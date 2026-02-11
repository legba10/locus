'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { useAuthStore } from '@/domains/auth'
import { amenitiesToLabels, amenityKeysFromApi } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'
import { scoring, type Listing, type UserParams } from '@/domains/ai/ai-engine'
import {
  ListingGallery,
  ListingHeader,
  ListingOwner,
  ListingCta,
  ListingBooking,
  ReviewFormStepByStep,
} from '@/components/listing'

interface ListingPageV2Props {
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
    views?: number
    rating?: number
    reviewCount?: number
    lat?: number
    lng?: number
    owner?: {
      id: string
      name: string
      avatar: string | null
      rating?: number | null
      listingsCount?: number
    }
  }
  item?: typeof ListingResponse.prototype.listing
}

interface PublicOwnerProfile {
  id: string
  name: string
  avatar: string | null
  rating_avg: number | null
  reviews_count: number
  response_rate: number | null
  last_seen: string | null
}

interface RatingSummary {
  avg: number | null
  count: number
  distribution: Record<number, number>
}

export function ListingPageV2({ id }: ListingPageV2Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isGalleryOpen, setGalleryOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)
  const { data: reviewsData, isLoading: isReviewsLoading } = useFetch<{
    ok?: boolean
    items?: Array<{ id: string; authorId?: string; rating: number; text?: string | null; createdAt: string }>
  }>(['listing-reviews', id], `/api/reviews/listing/${encodeURIComponent(id)}?limit=10`)
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

  const photosLength = (itemFromData?.images || itemFromData?.photos || []).length

  useEffect(() => {
    if (!isGalleryOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setGalleryOpen(false)
      } else if (photosLength > 1 && e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveImage((i) => (i - 1 + photosLength) % photosLength)
      } else if (photosLength > 1 && e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveImage((i) => (i + 1) % photosLength)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isGalleryOpen, photosLength])

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="aspect-[16/10] bg-gray-200 rounded-[18px]" />
            <div className="h-48 bg-gray-200 rounded-[18px]" />
          </div>
        </div>
      </div>
    )
  }

  const item = data?.listing ?? data?.item
  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="text-center">
          <h3 className="text-[18px] font-semibold text-[#1C1F26] mb-2">Объявление не найдено</h3>
          <Link href="/listings" className="text-violet-600 hover:text-violet-700 text-[14px]">
            ← Вернуться к поиску
          </Link>
        </div>
      </div>
    )
  }

  const photos = (item.images || item.photos || []).map((p: any) => ({ url: p?.url ?? '', alt: p?.alt ?? item?.title ?? '' }))
  const listingData: Listing = {
    id: item.id ?? '',
    city: item.city ?? '',
    basePrice: Number((item as any).pricePerNight ?? (item as any).basePrice ?? 0),
    type: 'apartment',
    bedrooms: item.bedrooms,
    area: item.area,
    views: item.views,
    rating: item.rating,
    amenities: amenityKeysFromApi(item.amenities),
    description: item.description,
  }
  const userParams: UserParams = {}
  const aiScore = scoring(listingData, userParams)
  const amenities = amenitiesToLabels(item.amenities ?? undefined)
  const priceValue = Number((item as any).pricePerNight ?? (item as any).basePrice ?? 0)
  const viewsValue = (item as any).viewsCount ?? item.views ?? 0
  const owner = item.owner ?? { id: (item as any).ownerId || '', name: 'Пользователь', avatar: null, rating: null, rating_avg: null, reviews_count: 0, listingsCount: 0 }

  const handleWrite = async () => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listings/${id}`)}`)
      return
    }
    setWriteLoading(true)
    try {
      const conv = await apiFetchJson<{ id: string }>(`/chats/by-listing/${item.id}`, { method: 'POST' })
      router.push(`/chat/${conv.id}`)
    } catch {
      router.push(`/messages?listing=${item.id}`)
    } finally {
      setWriteLoading(false)
    }
  }

  const handleBook = () => {
    document.getElementById('listing-booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBookingConfirm = async (data: { checkIn: Date; checkOut: Date; guests: number }) => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listings/${id}`)}`)
      return
    }
    try {
      const res = await apiFetchJson<{ item?: unknown; conversationId?: string | null }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          listingId: item.id,
          checkIn: data.checkIn.toISOString(),
          checkOut: data.checkOut.toISOString(),
          guestsCount: data.guests,
        }),
      })
      if (res?.conversationId) {
        router.push(`/chat/${res.conversationId}`)
      }
    } catch {
      // Error shown by API or could set local state
    }
  }

  const ratingSummary = ratingSummaryData?.summary
  const ratingAvg = ratingSummary?.avg ?? null
  const ratingCount = ratingSummary?.count ?? 0
  const ratingDistribution = ratingSummary?.distribution ?? {}

  return (
    <div className="min-h-screen pb-20 md:pb-8" style={{ background: 'linear-gradient(180deg, #FAFAFC 0%, #F0F1F5 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6">
          <Link href="/listings" className="text-[13px] text-[#6B7280] hover:text-violet-600 inline-flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к поиску
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Основной контент: на мобильном — единственный столбец; CTA только в sticky-баре */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <ListingGallery
              photos={photos}
              title={item.title ?? ''}
              verified={aiScore.score >= 70}
              onOpenFullscreen={photos.length > 0 ? () => setGalleryOpen(true) : undefined}
            />
            <ListingHeader
              title={item.title ?? ''}
              city={item.city ?? ''}
              rating={item.rating ?? null}
              reviewCount={(item as any).reviewCount ?? null}
              rooms={item.bedrooms ?? null}
              area={item.area ?? null}
              floor={item.floor ?? null}
              totalFloors={item.totalFloors ?? null}
              typeLabel="Квартира"
            />
            {!owner.id ? (
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 animate-pulse">
                <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ) : (
              <ListingOwner
                owner={{
                  id: owner.id,
                  name: ownerPublicData?.profile?.name ?? owner.name,
                  avatar: ownerPublicData?.profile?.avatar ?? owner.avatar,
                  rating: ownerPublicData?.profile?.rating_avg ?? owner.rating ?? null,
                  reviewsCount: ownerPublicData?.profile?.reviews_count ?? (owner as any).reviews_count ?? null,
                  listingsCount: owner.listingsCount ?? null,
                  lastSeen: ownerPublicData?.profile?.last_seen ?? null,
                }}
                onWrite={handleWrite}
              />
            )}
            <div className={cn('bg-white rounded-2xl p-4 md:p-6', 'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100')}>
              <h2 className="text-[18px] font-bold text-[#1C1F26] mb-3">Удобства</h2>
              {amenities.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {(showAllAmenities ? amenities : amenities.slice(0, 8)).map((label, i) => (
                      <div key={i} className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-gray-50/80 border border-gray-100">
                        <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[13px] font-medium text-[#1C1F26]">{label}</span>
                      </div>
                    ))}
                  </div>
                  {amenities.length > 8 && (
                    <button type="button" onClick={() => setShowAllAmenities((p) => !p)} className="mt-4 text-[13px] font-medium text-violet-600">
                      {showAllAmenities ? 'Свернуть' : 'Показать все'}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-[14px] text-[#6B7280]">Удобства не указаны.</p>
              )}
            </div>
            {item.description && (
<div className={cn('bg-white rounded-2xl p-4 md:p-6', 'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100')}>
              <h2 className="text-[18px] font-bold text-[#1C1F26] mb-3">Описание</h2>
                <p className={cn('text-[15px] text-[#6B7280] leading-relaxed whitespace-pre-line', !isDescriptionExpanded && 'line-clamp-3')}>
                  {item.description}
                </p>
                <button type="button" onClick={() => setIsDescriptionExpanded((p) => !p)} className="mt-3 text-[13px] font-medium text-violet-600">
                  {isDescriptionExpanded ? 'Свернуть' : 'Развернуть'}
                </button>
              </div>
            )}
            <div className={cn('bg-white rounded-2xl p-4 md:p-6', 'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100')}>
              <h2 className="text-[18px] font-bold text-[#1C1F26] mb-3">Расположение</h2>
              {item.addressLine ? (
                <p className="text-[14px] text-[#6B7280]">{item.addressLine}</p>
              ) : (
                <p className="text-[13px] text-[#9CA3AF] flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Адрес доступен после бронирования
                </p>
              )}
              {item.lat && item.lng && (
                <div className="mt-3 h-40 md:h-52 rounded-xl overflow-hidden bg-gray-100">
                  <iframe
                    src={`https://yandex.ru/map-widget/v1/?ll=${item.lng},${item.lat}&z=15&pt=${item.lng},${item.lat}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Карта"
                  />
                </div>
              )}
            </div>
            <div id="listing-booking" className="lg:hidden">
              <ListingBooking listingId={item.id} pricePerNight={priceValue || 0} onConfirm={handleBookingConfirm} />
            </div>
            <div className={cn('bg-white rounded-2xl p-5 md:p-6', 'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100')}>
              <h2 className="text-[18px] font-bold text-[#1C1F26] mb-5">Отзывы</h2>
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-6 items-start">
                <div className="flex flex-col items-center md:items-start min-w-[100px]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-medium text-[#6B7280]">Рейтинг</span>
                    <span className="text-3xl font-bold text-[#1C1F26]">
                      {ratingAvg != null ? ratingAvg.toFixed(1) : '—'}
                    </span>
                    {ratingCount > 0 && (
                      <span className="text-[14px] text-violet-600 font-semibold tabular-nums">
                        {Math.round((ratingAvg ?? 0) * 20)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#6B7280] mt-1">
                    {ratingCount > 0 ? `на основе ${ratingCount} ${ratingCount === 1 ? 'отзыва' : ratingCount >= 2 && ratingCount <= 4 ? 'отзыва' : 'отзывов'}` : 'Отзывов пока нет'}
                  </p>
                </div>
                {ratingCount > 0 && (
                  <div className="w-full space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingDistribution[star] ?? 0
                      const pct = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="w-8 text-[13px] text-[#6B7280]">{star}</span>
                          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden min-w-[80px]">
                            <div
                              className="h-full rounded-full bg-violet-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-[13px] text-[#6B7280] tabular-nums">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-4 mb-6">
                {((reviewsData?.items ?? (reviewsData as any)?.data) ?? []).map((r: any) => (
                  <div key={r.id} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#1C1F26]">
                        <span className="text-amber-500">★</span> {r.rating}/5
                      </span>
                      <span className="text-[12px] text-[#9CA3AF]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ru-RU') : ''}
                      </span>
                    </div>
                    {r.text ? (
                      <p className="mt-2 text-[14px] text-[#4B5563] whitespace-pre-wrap leading-relaxed">{r.text}</p>
                    ) : (
                      <p className="mt-2 text-[13px] text-[#9CA3AF] italic">Без комментария</p>
                    )}
                  </div>
                ))}
                {!isReviewsLoading && ((reviewsData?.items ?? (reviewsData as any)?.data)?.length ?? 0) === 0 && (
                  <p className="text-[14px] text-[#6B7280] py-2">Отзывов пока нет. Будьте первым.</p>
                )}
              </div>
              <ReviewFormStepByStep
                listingId={id}
                userAlreadyReviewed={((reviewsData?.items ?? (reviewsData as any)?.data) ?? []).some((r: any) => r.authorId === user?.id)}
                onSubmitted={() => {
                  queryClient.invalidateQueries({ queryKey: ['listing-reviews', id] })
                  queryClient.invalidateQueries({ queryKey: ['listing-rating-summary', id] })
                }}
              />
            </div>
          </div>

          {/* Правая колонка: бронирование + цена и CTA — только на десктопе; на мобильном один sticky-бар без дублирования */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <ListingBooking listingId={item.id} pricePerNight={priceValue || 0} onConfirm={handleBookingConfirm} />
              <ListingCta
                price={priceValue}
                onWrite={handleWrite}
                onBook={handleBook}
                onSave={() => setIsFavorite((f) => !f)}
                isSaved={isFavorite}
                views={viewsValue}
                sticky
              />
            </div>
          </div>
        </div>
      </div>

      {/* Мобильный CTA: один бар внизу, без дублирования кнопок в контенте */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {priceValue > 0 && (
            <span className="hidden sm:inline text-[13px] font-semibold text-[#1C1F26] shrink-0">
              от {priceValue.toLocaleString('ru-RU')} ₽
            </span>
          )}
          <button
            type="button"
            onClick={handleWrite}
            disabled={writeLoading}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold text-[14px] shadow-lg shadow-violet-600/25 disabled:opacity-70"
          >
            {writeLoading ? '…' : 'Написать'}
          </button>
          <button
            type="button"
            onClick={handleBook}
            className="flex-1 py-3 rounded-xl border-2 border-violet-600 text-violet-600 font-semibold text-[14px] bg-white"
          >
            Забронировать
          </button>
          <button
            type="button"
            onClick={() => setIsFavorite((f) => !f)}
            className="p-3 rounded-xl border-2 border-gray-200 bg-white shrink-0"
            aria-label={isFavorite ? 'Убрать из избранного' : 'Сохранить'}
          >
            <svg className={cn('w-5 h-5', isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {isGalleryOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Галерея фото"
        >
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white text-xl font-light flex items-center justify-center"
            aria-label="Закрыть"
          >
            ×
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveImage((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                aria-label="Предыдущее фото"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => setActiveImage((i) => (i + 1) % photos.length)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                aria-label="Следующее фото"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <Image
            src={photos[activeImage]?.url ?? ''}
            alt={`${item.title ?? 'Объявление'} — фото ${activeImage + 1} из ${photos.length}`}
            width={1200}
            height={800}
            className="max-h-[85vh] w-auto object-contain px-12"
            unoptimized={(photos[activeImage]?.url ?? '').startsWith('http')}
          />
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn('w-2.5 h-2.5 rounded-full transition-all', activeImage === i ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60')}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
