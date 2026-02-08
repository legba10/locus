'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { useQueryClient } from '@tanstack/react-query'
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

export function ListingPageV2({ id }: ListingPageV2Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isGalleryOpen, setGalleryOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)
  const { data: reviewsData, isLoading: isReviewsLoading } = useFetch<{
    items: Array<{ id: string; rating: number; text?: string | null; createdAt: string }>
  }>(['listing-reviews', id], `/api/reviews/listing/${encodeURIComponent(id)}?limit=10`)

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

  const photos = (item.images || item.photos || []).map((p: any) => ({ url: p.url, alt: p.alt ?? item.title }))
  const listingData: Listing = {
    id: item.id,
    city: item.city,
    basePrice: item.pricePerNight,
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
  const amenities = amenitiesToLabels(item.amenities)
  const priceValue = Number(item.pricePerNight ?? 0)
  const viewsValue = (item as any).viewsCount ?? item.views ?? 0
  const owner = item.owner ?? { id: (item as any).ownerId || '', name: 'Владелец', avatar: null, rating: null, listingsCount: 0 }

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

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Link href="/listings" className="text-[14px] text-[#6B7280] hover:text-[#1C1F26] inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к поиску
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ListingGallery
              photos={photos}
              title={item.title}
              verified={aiScore.score >= 70}
              onOpenFullscreen={photos.length > 0 ? () => setGalleryOpen(true) : undefined}
            />
            <ListingHeader
              title={item.title}
              city={item.city}
              rating={item.rating ?? null}
              reviewCount={(item as any).reviewCount ?? null}
              rooms={item.bedrooms ?? null}
              area={item.area ?? null}
              floor={item.floor ?? null}
              totalFloors={item.totalFloors ?? null}
              typeLabel="Квартира"
            />
            <ListingOwner owner={owner} onWrite={handleWrite} />
            <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
              <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Удобства</h2>
              {amenities.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {(showAllAmenities ? amenities : amenities.slice(0, 8)).map((label, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-[12px] bg-gray-50 border border-gray-200">
                        <svg className="w-5 h-5 text-violet-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[14px] font-medium text-[#1C1F26]">{label}</span>
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
              <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
                <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Описание</h2>
                <p className={cn('text-[15px] text-[#6B7280] leading-relaxed whitespace-pre-line', !isDescriptionExpanded && 'line-clamp-3')}>
                  {item.description}
                </p>
                <button type="button" onClick={() => setIsDescriptionExpanded((p) => !p)} className="mt-3 text-[13px] font-medium text-violet-600">
                  {isDescriptionExpanded ? 'Свернуть' : 'Развернуть'}
                </button>
              </div>
            )}
            <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
              <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Расположение</h2>
              {item.addressLine && <p className="text-[14px] text-[#6B7280] mb-4">{item.addressLine}</p>}
              <div className="aspect-video rounded-[12px] bg-gray-100 overflow-hidden">
                {item.lat && item.lng ? (
                  <iframe
                    src={`https://yandex.ru/map-widget/v1/?ll=${item.lng},${item.lat}&z=15&pt=${item.lng},${item.lat}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[14px] text-gray-400">Адрес доступен после бронирования</div>
                )}
              </div>
            </div>
            <div id="listing-booking">
              <ListingBooking listingId={item.id} pricePerNight={priceValue || 0} />
            </div>
            <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
              <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">
                Отзывы {(item as any).reviewCount ? `(${(item as any).reviewCount})` : ''}
              </h2>
              <div className="space-y-3 mb-6">
                {(reviewsData?.items ?? []).map((r) => (
                  <div key={r.id} className="rounded-[14px] border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-500 font-semibold">★ {r.rating}/5</span>
                      <span className="text-[12px] text-[#9CA3AF]">{new Date(r.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {r.text && <p className="mt-2 text-[14px] text-[#4B5563] whitespace-pre-wrap">{r.text}</p>}
                  </div>
                ))}
                {!isReviewsLoading && (reviewsData?.items?.length ?? 0) === 0 && (
                  <p className="text-[14px] text-[#6B7280]">Отзывов пока нет. Будьте первым.</p>
                )}
              </div>
              <ReviewFormStepByStep
                listingId={id}
                onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['listing-reviews', id] })}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-6">
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

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 px-4 py-3 safe-area-pb">
        <div className="flex gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={handleWrite}
            disabled={writeLoading}
            className="flex-1 py-3 rounded-[14px] bg-violet-600 text-white font-semibold text-[14px] disabled:opacity-70"
          >
            {writeLoading ? '…' : 'Написать'}
          </button>
          <button
            type="button"
            onClick={handleBook}
            className="flex-1 py-3 rounded-[14px] border-2 border-violet-600 text-violet-600 font-semibold text-[14px]"
          >
            Забронировать
          </button>
          <button
            type="button"
            onClick={() => setIsFavorite((f) => !f)}
            className="p-3 rounded-[14px] border-2 border-gray-200"
          >
            <svg className={cn('w-5 h-5', isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {isGalleryOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center">
          <button type="button" onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl" aria-label="Закрыть">
            ×
          </button>
          <Image
            src={photos[activeImage]?.url ?? ''}
            alt={item.title}
            width={1200}
            height={800}
            className="max-h-[90vh] w-auto object-contain"
            unoptimized={(photos[activeImage]?.url ?? '').startsWith('http')}
          />
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn('w-2.5 h-2.5 rounded-full transition-all', activeImage === i ? 'bg-white' : 'bg-white/40')}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
