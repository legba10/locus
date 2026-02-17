'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { addPendingReminder } from '@/shared/reviews/reviewReminderStorage'
import { useAuthStore } from '@/domains/auth'
import { amenitiesToLabels, amenityKeysFromApi } from '@/core/i18n/ru'
import { scoring, type Listing, type UserParams } from '@/domains/ai/ai-engine'
import { ListingLayoutTZ10 } from './listing-page'

interface ListingPageV3Props {
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

const MIN_METRIC_FILTER = 70

export function ListingPageV3({ id }: ListingPageV3Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [isGalleryOpen, setGalleryOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [additionalReviews, setAdditionalReviews] = useState<any[]>([])
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<'all' | '5' | 'with_text' | 'recent'>('all')
  const [metricFilter, setMetricFilter] = useState('all')

  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)
  const { data: reviewsData, isLoading: isReviewsLoading } = useFetch<{ items?: any[] }>(['listing-reviews', id], `/api/reviews/listing/${encodeURIComponent(id)}?limit=10`)
  const { data: ratingSummaryData } = useFetch<{ ok: boolean; summary: RatingSummary }>(['listing-rating-summary', id], `/api/reviews/listing/${encodeURIComponent(id)}/summary`)
  const { data: similarData } = useFetch<{ items?: any[] }>(['listings-similar', id], `/api/listings?limit=5`)

  const itemFromData = data?.listing ?? data?.item
  const ownerIdFromData = itemFromData?.owner?.id ?? (itemFromData as any)?.ownerId ?? ''
  const { data: ownerPublicData } = useQuery({
    queryKey: ['user-public', ownerIdFromData || ''],
    queryFn: () => apiFetchJson<{ profile: PublicOwnerProfile }>(`/api/users/${encodeURIComponent(ownerIdFromData)}/public`),
    enabled: Boolean(ownerIdFromData),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <div className="max-w-[720px] mx-auto px-4 py-4 md:py-6">
          <div className="space-y-4">
            <div className="h-[280px] rounded-b-[20px] skeleton-shimmer-tz12" />
            <div className="h-8 w-2/3 skeleton-shimmer-tz12 rounded-[12px]" />
            <div className="h-5 w-full skeleton-shimmer-tz12 rounded-[12px]" />
            <div className="h-5 w-3/4 skeleton-shimmer-tz12 rounded-[12px]" />
            <div className="h-24 skeleton-shimmer-tz12 rounded-[16px]" />
            <div className="h-20 skeleton-shimmer-tz12 rounded-[16px]" />
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
    description: item.description ?? '',
  }
  const userParams: UserParams = {}
  const aiScoreResult = scoring(listingData, userParams)
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
      if (res?.conversationId) router.push(`/chat/${res.conversationId}`)
    } catch {}
  }

  const ratingSummary = ratingSummaryData?.summary
  const ratingAvg = ratingSummary?.weightedAvg ?? ratingSummary?.avg ?? item.rating ?? null
  const ratingCount = ratingSummary?.count ?? 0
  const ratingDistribution = ratingSummary?.distribution ?? {}
  const reviewPercent = ratingSummary?.percent ?? (ratingCount > 0 && ratingDistribution ? Math.round((((ratingDistribution[4] ?? 0) + (ratingDistribution[5] ?? 0)) / ratingCount) * 100) : null)

  const baseReviews = reviewsData?.items ?? []
  const allReviews = [...baseReviews, ...additionalReviews]
  const byReviewFilter =
    reviewFilter === '5'
      ? allReviews.filter((r: any) => r.rating === 5)
      : reviewFilter === 'with_text'
        ? allReviews.filter((r: any) => r.text && String(r.text).trim())
        : allReviews
  const filteredReviews =
    metricFilter === 'all'
      ? byReviewFilter
      : byReviewFilter.filter((r: any) => {
          const sm = r.structuredMetrics ?? (r.metrics ? Object.fromEntries((r.metrics as Array<{ metricKey: string; value: number }>).map((m) => [m.metricKey, m.value])) : null)
          if (!sm) return false
          const v = metricFilter === 'cleanliness' ? sm.cleanliness : metricFilter === 'value' ? sm.value : metricFilter === 'owner' ? sm.communication : sm.location
          return v != null && v >= MIN_METRIC_FILTER
        })
  const hasMoreReviews = baseReviews.length + additionalReviews.length >= 10 && baseReviews.length + additionalReviews.length < (ratingCount || 0)
  const loadMoreReviews = async () => {
    if (reviewsLoadingMore) return
    setReviewsLoadingMore(true)
    try {
      const res = await apiFetchJson<{ items?: any[] }>(`/api/reviews/listing/${encodeURIComponent(id)}?limit=10&skip=${baseReviews.length + additionalReviews.length}`)
      setAdditionalReviews((prev) => [...prev, ...(res?.items ?? [])])
    } finally {
      setReviewsLoadingMore(false)
    }
  }

  const ownerMerged = {
    id: owner.id,
    name: ownerPublicData?.profile?.name ?? owner.name,
    avatar: ownerPublicData?.profile?.avatar ?? owner.avatar,
    rating: ownerPublicData?.profile?.rating_avg ?? owner.rating ?? null,
    reviewsCount: ownerPublicData?.profile?.reviews_count ?? (owner as any).reviews_count ?? null,
    listingsCount: (owner as any).listingsCount ?? 0,
    lastSeen: (owner as any).lastSeen ?? null,
  }

  const specItems: string[] = []
  if (item.bedrooms != null && item.bedrooms > 0) {
    specItems.push(item.bedrooms === 1 ? '1 комната' : `${item.bedrooms} комнаты`)
  }
  if (item.area != null && item.area > 0) specItems.push(`${item.area} м²`)
  if (item.floor != null && item.floor > 0) {
    specItems.push(
      item.totalFloors != null && item.totalFloors > 0
        ? `${item.floor} из ${item.totalFloors} этаж`
        : `${item.floor} этаж`
    )
  }
  const amenityLabels = Array.isArray(item.amenities) ? item.amenities.map((a: any) => a?.amenity?.label ?? a?.key ?? '').filter(Boolean) : []
  if (amenityLabels.some((l) => /кухн|kitchen/i.test(l))) specItems.push('есть кухня')
  if (amenityLabels.some((l) => /сануз|bath|туалет/i.test(l))) specItems.push('есть санузел')

  return (
    <ListingLayoutTZ10
      listingId={id}
      title={item.title ?? ''}
      city={item.city ?? ''}
      district={item.district ?? item.addressLine ?? null}
      price={priceValue}
      rooms={item.bedrooms ?? null}
      area={item.area ?? null}
      floor={item.floor ?? null}
      totalFloors={item.totalFloors ?? null}
      description={item.description ?? ''}
      specItems={specItems}
      photos={photos}
      owner={ownerMerged}
      onWrite={handleWrite}
      onBookingConfirm={handleBookingConfirm}
    />
  )
}
