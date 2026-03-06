'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { addPendingReminder } from '@/shared/reviews/reviewReminderStorage'
import { useAuthStore, usePermissions } from '@/domains/auth'
import { amenitiesToLabels, amenityKeysFromApi } from '@/core/i18n/ru'
import { scoring, type Listing } from '@/domains/ai/ai-engine'
import { cn } from '@/shared/utils/cn'
import { AiHostPanel } from '@/components/ai/AiHostPanel'
import { playSound } from '@/lib/system/soundManager'
import { ListingOwner, ListingBooking } from '@/components/listing'
import { AIMetricsCardTZ9, ListingReviewsBlockTZ9 } from '@/domains/listing/listing-page'
import { ListingCard } from '@/components/listing'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { analyzeListing, type ListingAnalyzerResult } from '@/lib/ai/listingAnalyzer'

interface ListingPageTZ8Props {
  id: string
  /** TZ-75: server-fetched listing to avoid useEffect initial load and hydration */
  initialListing?: ListingResponse | null
}

interface ListingResponse {
  listing?: ListingItem
  item?: ListingItem
}

interface ListingItem {
  id: string
  title?: string
  description?: string
  city?: string
  addressLine?: string
  lat?: number
  lng?: number
  pricePerNight?: number
  basePrice?: number
  bedrooms?: number
  area?: number
  floor?: number
  totalFloors?: number
  images?: Array<{ url: string; alt?: string }>
  photos?: Array<{ url: string }>
  amenities?: unknown
  owner?: { id: string; name: string; avatar: string | null; rating?: number | null; listingsCount?: number }
  ownerId?: string
  updatedAt?: string
}

interface ListingStatsResponse {
  listing_id: string
  views: number
  favorites: number
  messages: number
  bookings: number
  updated_at: string
  activity: Array<{ date: string; views: number; clicks: number; favorites: number }>
  sources: Array<{ key: string; label: string; value: number }>
}

/** ТЗ-35 + ТЗ-48: Desktop сетка 60/40, mobile фото 280px */
const GALLERY_HEIGHT_PC = 420
const GALLERY_HEIGHT_MOBILE = 280
const PHOTOS_DISPLAY = 12

/** ТЗ-48: Строгая система статусов. Никогда не показывать «На модерации» при status === active (PUBLISHED). */
type ListingStatusCanonical = 'DRAFT' | 'MODERATION' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'
const LISTING_STATUS_LABEL: Record<ListingStatusCanonical, string> = {
  DRAFT: 'Черновик',
  MODERATION: 'На модерации',
  PUBLISHED: 'Активно',
  REJECTED: 'Отклонено',
  ARCHIVED: 'Скрыто',
}
function getListingStatusLabel(status: ListingStatusCanonical): string {
  return LISTING_STATUS_LABEL[status] ?? status
}

/** ТЗ-3: Lazy load — рендерит children только при появлении во viewport. */
function LazyBox({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e?.isIntersecting) setInView(true) }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref}>{inView ? children : (fallback ?? <div className="min-h-[120px] rounded-[16px] bg-[var(--bg-input)] animate-pulse" />)}</div>
}

export function ListingPageTZ8({ id, initialListing }: ListingPageTZ8Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [isGalleryOpen, setGalleryOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false)
  /** ТЗ-12: Mobile — нижняя панель; по тапу «Забронировать» открывается календарь (bottom sheet) */
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [aiMetricsExpanded, setAiMetricsExpanded] = useState(false)
  const [adminStatusLoading, setAdminStatusLoading] = useState(false)
  const [ownerPanelTab, setOwnerPanelTab] = useState<'edit' | 'calendar' | 'promo' | 'analytics'>('edit')
  const [ownerViewAsUser, setOwnerViewAsUser] = useState(false)
  const [analyticsDays, setAnalyticsDays] = useState<7 | 30>(30)
  const [aiRecoModalOpen, setAiRecoModalOpen] = useState(false)
  const [analysisRefreshKey, setAnalysisRefreshKey] = useState(0)
  const [aiHostOpen, setAiHostOpen] = useState(false)

  const { data, isLoading, error } = useFetch<ListingResponse>(
    ['listing', id],
    `/api/listings/${id}`,
    initialListing != null ? { initialData: initialListing } : {}
  )
  const { data: reviewsData } = useFetch<{ items?: any[] }>(['listing-reviews', id], `/api/reviews/listing/${encodeURIComponent(id)}?limit=10`)
  const { data: ratingSummaryData } = useFetch<{
    ok: boolean
    summary: { avg: number | null; weightedAvg?: number | null; count: number; distribution?: Record<number, number>; percent?: number | null }
  }>(['listing-rating-summary', id], `/api/reviews/listing/${encodeURIComponent(id)}/summary`)
  const { data: similarData } = useFetch<{ items?: any[] }>(['listings-similar', id], `/api/listings?limit=8`)

  const itemFromData = data?.listing ?? data?.item
  const ownerIdFromData = itemFromData?.owner?.id ?? (itemFromData as any)?.ownerId ?? ''
  const permissions = usePermissions({ listingOwnerId: ownerIdFromData || undefined })
  const { data: ownerPublicData } = useQuery({
    queryKey: ['user-public', ownerIdFromData || ''],
    queryFn: () => apiFetchJson<{ profile: { name?: string; avatar?: string | null; rating_avg?: number | null; reviews_count?: number } }>(`/api/users/${encodeURIComponent(ownerIdFromData)}/public`),
    enabled: Boolean(ownerIdFromData),
  })

  const photos = (itemFromData?.images || itemFromData?.photos || []).slice(0, PHOTOS_DISPLAY).map((p: any) => ({ url: p?.url ?? '', alt: p?.alt ?? itemFromData?.title ?? '' }))
  const photosLength = photos.length
  const priceValue = Number((itemFromData as any)?.pricePerNight ?? (itemFromData as any)?.basePrice ?? 0)
  const pricePerMonth = priceValue > 0 ? Math.round(priceValue * 30) : 0
  const amenities = amenitiesToLabels(itemFromData?.amenities ?? undefined)
  const owner = itemFromData?.owner ?? { id: (itemFromData as any)?.ownerId || '', name: 'Пользователь', avatar: null, rating: null, listingsCount: 0 }
  const ownerMerged = {
    id: owner.id,
    name: ownerPublicData?.profile?.name ?? owner.name,
    avatar: ownerPublicData?.profile?.avatar ?? owner.avatar,
    rating: ownerPublicData?.profile?.rating_avg ?? owner.rating ?? null,
    reviewsCount: ownerPublicData?.profile?.reviews_count ?? (owner as any).reviews_count ?? null,
    listingsCount: (owner as any).listingsCount ?? 0,
    lastSeen: null,
  }

  const listingData: Listing = {
    id: itemFromData?.id ?? '',
    city: itemFromData?.city ?? '',
    basePrice: priceValue,
    type: 'apartment',
    bedrooms: itemFromData?.bedrooms,
    area: itemFromData?.area,
    views: (itemFromData as any)?.views,
    rating: (itemFromData as any)?.rating,
    amenities: amenityKeysFromApi(itemFromData?.amenities),
    description: itemFromData?.description ?? '',
  }
  const aiScoreResult = scoring(listingData, {} as any)
  const aiScore = aiScoreResult?.score ?? 0
  const aiReasons = aiScoreResult?.reasons ?? ['Под ваш бюджет', 'В этом районе']

  useEffect(() => {
    if (!isGalleryOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
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

  const handleWrite = async () => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listings/${id}`)}`)
      return
    }
    void incrementListingMetric('messages')
    setWriteLoading(true)
    try {
      const conv = await apiFetchJson<{ id: string }>(`/chats/by-listing/${itemFromData?.id}`, { method: 'POST' })
      router.push(`/messages?chat=${conv.id}`)
    } catch {
      router.push(`/messages?listing=${itemFromData?.id}`)
    } finally {
      setWriteLoading(false)
    }
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
          listingId: itemFromData?.id,
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
      void incrementListingMetric('bookings')
    } catch {}
  }

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev)
    void incrementListingMetric('favorites')
  }, [incrementListingMetric])

  const scrollToBooking = useCallback(() => {
    document.getElementById('listing-booking')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  /** ТЗ-12: Mobile — по кнопке «Забронировать»: не авторизован → логин, иначе открыть bottom sheet с календарём */
  const handleMobileBookClick = useCallback(() => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listings/${id}`)}`)
      return
    }
    setBookingSheetOpen(true)
  }, [isAuthenticated, router, id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="h-12 w-48 rounded-[12px] bg-[var(--bg-input)] animate-pulse mb-6" />
          <div className="h-[420px] rounded-[16px] bg-[var(--bg-input)] animate-pulse" />
        </div>
      </div>
    )
  }

  const item = data?.listing ?? data?.item
  if (error || !item) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Объявление не найдено</h3>
        <Link href="/listings" className="text-[var(--accent)] hover:opacity-90 text-[14px]">← Вернуться к поиску</Link>
        </div>
      </div>
    )
  }

  const typeLabel = item.bedrooms ? `${item.bedrooms}-комнатная квартира` : 'Квартира'
  const locationLine = [item.city, (item as any).district ?? item.addressLine].filter(Boolean).join(' • ') || item.city || ''
  const metroText = '5 мин до метро'
  const similarListings = (similarData?.items ?? []).filter((s: any) => s.id !== item.id).slice(0, 6)
  const ratingSummary = ratingSummaryData?.summary
  const ratingAvg = ratingSummary?.weightedAvg ?? ratingSummary?.avg ?? (item as any).rating ?? null
  const ratingCount = ratingSummary?.count ?? 0
  const recommendPercent = ratingSummary?.percent ?? null
  const distribution: Record<number, number> = ratingSummary?.distribution ?? { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as Record<number, number>
  const baseReviews = reviewsData?.items ?? []
  /** TZ-66: кнопки по ролям через usePermissions (user: Написать/Забронировать/В избранное; landlord+owner: Редактировать/Календарь/Продвижение/Аналитика; admin: Модерация/Статус/Удалить) */
  const isOwnerMode = permissions.canEditListing && !ownerViewAsUser
  const canUseHostAi = permissions.canEditListing
  const canSeeAnalytics = permissions.canEditListing
  /** TZ-60: админ видит реальный статус; APPROVED = PUBLISHED (одобрено) */
  const listingStatusRaw = String((item as any)?.statusCanonical ?? (item as any)?.status ?? '').toUpperCase()
  const listingStatusCanonical: ListingStatusCanonical =
    listingStatusRaw === 'PUBLISHED' || listingStatusRaw === 'APPROVED' || listingStatusRaw === 'ACTIVE'
      ? 'PUBLISHED'
      : listingStatusRaw === 'REJECTED'
        ? 'REJECTED'
        : listingStatusRaw === 'ARCHIVED' || listingStatusRaw === 'BLOCKED'
          ? 'ARCHIVED'
          : listingStatusRaw === 'MODERATION' || listingStatusRaw === 'PENDING_REVIEW' || listingStatusRaw === 'AWAITING_PAYMENT'
            ? 'MODERATION'
            : 'DRAFT'
  const moderationNote = (item as any)?.moderation_note ?? (item as any)?.moderationNote ?? (item as any)?.moderationComment ?? ''
  const isPendingModeration = listingStatusCanonical === 'MODERATION'
  const isRejected = listingStatusCanonical === 'REJECTED'
  const isDraft = listingStatusCanonical === 'DRAFT'
  const isPublished = listingStatusCanonical === 'PUBLISHED'
  const analyticsTabRequested = searchParams.get('tab') === 'analytics'
  const listingStats = {
    views: Number((item as any)?.viewsCount ?? (item as any)?.views ?? 0),
    favorites: Number((item as any)?.favoritesCount ?? 0),
    bookings: Number((item as any)?.bookingsCount ?? 0),
    clicks: Number((item as any)?.clicksCount ?? 0),
  }

  const { data: listingStatsData } = useFetch<ListingStatsResponse>(
    ['listing-stats', id, analyticsDays],
    `/api/listings/${encodeURIComponent(id)}/stats?days=${analyticsDays}`,
    { enabled: canSeeAnalytics, retry: false }
  )

  const incrementListingMetric = useCallback(
    async (metric: 'views' | 'favorites' | 'messages' | 'bookings') => {
      try {
        await apiFetchJson(`/api/listings/${encodeURIComponent(id)}/stats/increment`, {
          method: 'POST',
          body: JSON.stringify({ metric }),
        })
        if (canSeeAnalytics) {
          await queryClient.invalidateQueries({ queryKey: ['listing-stats', id] })
        }
      } catch {}
    },
    [canSeeAnalytics, id, queryClient]
  )

  useEffect(() => {
    if (!canSeeAnalytics) return
    if (analyticsTabRequested) {
      setOwnerPanelTab('analytics')
      if (permissions.canEditListing) setOwnerViewAsUser(false)
    }
  }, [analyticsTabRequested, canSeeAnalytics, permissions.canEditListing])

  useEffect(() => {
    if (typeof window === 'undefined' || !item?.id) return
    const key = `locus_listing_view_ts_${item.id}`
    const now = Date.now()
    const lastTs = Number(window.localStorage.getItem(key) || 0)
    if (!Number.isFinite(lastTs) || now - lastTs >= 30 * 60 * 1000) {
      window.localStorage.setItem(key, String(now))
      incrementListingMetric('views')
    }
  }, [item?.id, incrementListingMetric])

  const handleAdminStatusChange = useCallback(
    async (status: 'published' | 'rejected' | 'archived') => {
      if (adminStatusLoading) return
      setAdminStatusLoading(true)
      try {
        await apiFetchJson(`/api/listings/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            moderation_note: status === 'rejected' ? 'Отклонено модератором' : undefined,
          }),
        })
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['listing', id] }),
          queryClient.invalidateQueries({ queryKey: ['profile-listings'] }),
        ])
        if (status === 'published' || status === 'archived') playSound('success')
        if (status === 'rejected') playSound('error')
      } catch {
        playSound('error')
      } finally {
        setAdminStatusLoading(false)
      }
    },
    [adminStatusLoading, id, queryClient]
  )

  const handleOwnerPublish = useCallback(async () => {
    try {
      await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}/publish`, { method: 'POST' })
      await queryClient.invalidateQueries({ queryKey: ['listing', id] })
      playSound('success')
    } catch {
      playSound('error')
    }
  }, [id, item.id, queryClient])

  const handleOwnerUnpublish = useCallback(async () => {
    try {
      await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}/unpublish`, { method: 'POST' })
      await queryClient.invalidateQueries({ queryKey: ['listing', id] })
      playSound('success')
    } catch {
      playSound('error')
    }
  }, [id, item.id, queryClient])

  /** Редизайн v2: 1 Галерея 2 Trust (название, рейтинг, цена доминирует) 3 AI сжатый 4 Описание 5 Удобства 6 Владелец 7 Отзывы+AI 8 Карта. Фиксированный CTA снизу. */
  const district = (item as any).district ?? (item as any).addressLine ?? ''
  const guestsCount = (item as any).capacityGuests ?? (item as any).maxGuests ?? 2
  const roomsCount = item.bedrooms ?? 1
  const showAnalyticsPanel = canSeeAnalytics && (ownerPanelTab === 'analytics' || (permissions.isAdmin && analyticsTabRequested))
  const hostAiPayload = {
    id: String(item.id),
    title: item.title ?? '',
    description: item.description ?? '',
    photosCount: photos.length,
    price: Number(priceValue),
    city: item.city ?? '',
    district: String((item as any).district ?? ''),
    floor: (item as any).floor ?? null,
    amenities: amenities.map((x) => String(x)),
    metroDistanceMin: (item as any).metroDistanceMin ?? null,
  }
  const aiAnalysis: ListingAnalyzerResult = useMemo(() => {
    const hasKitchenPhoto = photos.some((p) =>
      /(kitchen|кухн)/i.test(String(p?.alt ?? '')) || /(kitchen|кухн)/i.test(String(p?.url ?? ''))
    )
    return analyzeListing({
      title: item?.title,
      description: item?.description,
      basePrice: priceValue,
      photosCount: photos.length,
      hasKitchenPhoto,
      views: listingStatsData?.views ?? listingStats.views,
      messages: listingStatsData?.messages ?? listingStats.clicks,
    })
  }, [
    analysisRefreshKey,
    item?.title,
    item?.description,
    item?.updatedAt,
    photos,
    priceValue,
    listingStatsData?.views,
    listingStatsData?.messages,
    listingStats.views,
    listingStats.clicks,
  ])

  useEffect(() => {
    if (!showAnalyticsPanel) return
    setAnalysisRefreshKey((k) => k + 1)
  }, [showAnalyticsPanel, item?.updatedAt])

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8 listing-page">
      <div className="listing-container max-w-6xl mx-auto py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
          <div className="min-w-0 flex flex-col gap-4">
            {/* 1. Галерея — TZ-60: border-radius 24px, без рамок */}
            <section className="-mx-4 md:mx-0 gallery-tz60">
              <GalleryTZ8
                photos={photos}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onOpenFullscreen={photosLength > 0 ? () => setGalleryOpen(true) : undefined}
              />
            </section>

            {permissions.canEditListing && (
              <section className="sticky top-[76px] md:top-[80px] z-20 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/95 backdrop-blur p-3">
                {isOwnerMode ? (
                  <>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <button type="button" onClick={() => { setOwnerPanelTab('edit'); router.push(`/listing/${item.id}`) }} className={cn('h-10 rounded-[10px] text-[13px] font-medium', ownerPanelTab === 'edit' ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)]')}>Редактировать</button>
                      <button type="button" onClick={() => { setOwnerPanelTab('calendar'); router.push(`/listing/${item.id}`) }} className={cn('h-10 rounded-[10px] text-[13px] font-medium', ownerPanelTab === 'calendar' ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)]')}>Календарь</button>
                      <button type="button" onClick={() => { setOwnerPanelTab('promo'); router.push(`/listing/${item.id}`) }} className={cn('h-10 rounded-[10px] text-[13px] font-medium', ownerPanelTab === 'promo' ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)]')}>Продвижение</button>
                      <button type="button" onClick={() => { setOwnerPanelTab('analytics'); router.push(`/listing/${item.id}?tab=analytics`) }} className={cn('h-10 rounded-[10px] text-[13px] font-medium', ownerPanelTab === 'analytics' ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)]')}>Аналитика</button>
                      <button type="button" onClick={() => setAiHostOpen(true)} className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)]">AI-помощник</button>
                      <button type="button" onClick={() => setOwnerViewAsUser(true)} className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)]">Как пользователь</button>
                    </div>
                    <div className="mt-3 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
                      {ownerPanelTab === 'edit' && (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[13px] text-[var(--text-secondary)]">Управление фото, описанием, ценой, адресом и удобствами.</p>
                          <Link href={`/listing/edit/${item.id}`} className="h-9 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold inline-flex items-center">Открыть</Link>
                        </div>
                      )}
                      {ownerPanelTab === 'calendar' && (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[13px] text-[var(--text-secondary)]">Занятые/свободные даты и цена по дням.</p>
                          <Link href="/profile/calendar" className="h-9 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold inline-flex items-center">Открыть</Link>
                        </div>
                      )}
                      {ownerPanelTab === 'promo' && (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[13px] text-[var(--text-secondary)]">Поднять, выделить и AI‑рекомендации (mock).</p>
                          <Link href="/profile/promo" className="h-9 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold inline-flex items-center">Открыть</Link>
                        </div>
                      )}
                      {ownerPanelTab === 'analytics' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[12px]">
                            <div className="rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-main)] px-2 py-1.5">👁 {listingStats.views}</div>
                            <div className="rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-main)] px-2 py-1.5">🖱 {listingStats.clicks}</div>
                            <div className="rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-main)] px-2 py-1.5">❤ {listingStats.favorites}</div>
                            <div className="rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-main)] px-2 py-1.5">📅 {listingStats.bookings}</div>
                            <div className="rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-main)] px-2 py-1.5">⭐ {ratingCount}</div>
                          </div>
                          <Link href="/profile/analytics" className="h-9 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold inline-flex items-center">Открыть аналитику</Link>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] text-[var(--text-secondary)]">Режим просмотра как пользователь.</p>
                    <button type="button" onClick={() => setOwnerViewAsUser(false)} className="h-9 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold">Вернуться в режим владельца</button>
                  </div>
                )}
              </section>
            )}

            {showAnalyticsPanel && (
              <ListingAnalyticsPanel
                isAdmin={permissions.isAdmin}
                days={analyticsDays}
                onDaysChange={setAnalyticsDays}
                stats={listingStatsData}
                fallbackStats={listingStats}
                onReset={permissions.isAdmin ? async () => {
                  await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}/stats/reset`, { method: 'POST' })
                  await queryClient.invalidateQueries({ queryKey: ['listing-stats', id] })
                } : undefined}
                onOpenRecommendations={() => setAiRecoModalOpen(true)}
                ai={aiAnalysis}
                onRefreshAnalysis={() => setAnalysisRefreshKey((k) => k + 1)}
              />
            )}

            {/* 2. Trust block — TZ-60: main-info, цена крупная, карта компактно */}
            <section className="lg:hidden main-info">
              <h1 className="text-[18px] font-bold text-[var(--text-primary)] leading-tight">
                {typeLabel}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                <span>{[item.city, district].filter(Boolean).join(' · ') || item.city || '—'}</span>
                {(item as any).lat && (item as any).lng && (
                  <button
                    type="button"
                    onClick={() => setMapModalOpen(true)}
                    className="listing-map-trigger"
                  >
                    📍 Показать на карте
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2">
                {ratingAvg != null && (
                  <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-amber-600">
                    ★ {ratingAvg.toFixed(1)}
                    {ratingCount > 0 && <span className="text-[var(--text-muted)] font-normal">({ratingCount} отзывов)</span>}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[var(--text-muted)] mt-2">
                {guestsCount} гостей · {roomsCount} комнаты · {(item as any).metro || metroText}
              </p>
              <div className="mt-5 pt-4 border-t border-[var(--border-main)]">
                <p className="main-info__price">
                  {priceValue > 0 ? `${priceValue.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                  <span className="text-[16px] font-normal text-[var(--text-muted)]"> / ночь</span>
                </p>
                {pricePerMonth > 0 && <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">{pricePerMonth.toLocaleString('ru-RU')} ₽ / месяц</p>}
                {priceValue > 0 && <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Комиссия 7% включена</p>}
              </div>
            </section>

            {/* ТЗ-48: статус только по канону; при active не показываем блок «На модерации» */}
            {isOwnerMode && !isPublished && (
              <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-3">
                <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                  {getListingStatusLabel(listingStatusCanonical)}
                </p>
                {isRejected && moderationNote && (
                  <p className="text-[13px] text-[var(--text-secondary)] mt-1">Причина: {moderationNote}</p>
                )}
              </section>
            )}

            {/* 4. AI анализ — после цены, перед описанием */}
            {aiReasons.length > 0 && (
              <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
                <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">AI анализ</h2>
                <ul className="space-y-2">
                  {aiReasons.slice(0, 5).map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                      <span className="text-[var(--accent)]">•</span> {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 5. Описание — свернуто 5 строк */}
            {item.description && (
              <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
                <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Описание</h2>
                <p className={cn('text-[14px] text-[var(--text-secondary)] whitespace-pre-line', !descExpanded && 'line-clamp-5')}>
                  {item.description}
                </p>
                {item.description.length > 200 && (
                  <button type="button" onClick={() => setDescExpanded((e) => !e)} className="mt-2 text-[14px] font-medium text-[var(--accent)] hover:underline">
                    {descExpanded ? 'Свернуть' : 'Показать полностью'}
                  </button>
                )}
              </section>
            )}

            {/* ТЗ-6: Удобства — 2 колонки mobile, 4 desktop. «Показать все» → модал. */}
            {amenities.length > 0 && (
              <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
                <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-4">Удобства</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {amenities.slice(0, 8).map((label, i) => (
                    <div key={i} className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                      <span className="text-[var(--accent)] shrink-0">✓</span> {label}
                    </div>
                  ))}
                </div>
                {amenities.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setAmenitiesModalOpen(true)}
                    className="mt-3 text-[14px] font-medium text-[var(--accent)] hover:underline"
                  >
                    Все удобства ({amenities.length})
                  </button>
                )}
              </section>
            )}
            {/* Модал удобств: 2 колонки, иконки + текст */}
            {amenities.length > 0 && amenitiesModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setAmenitiesModalOpen(false)} role="dialog" aria-modal="true" aria-label="Удобства">
                <div className="bg-[var(--bg-card)] rounded-[16px] border border-[var(--border-main)] max-h-[80vh] w-full max-w-md overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-[var(--border-main)]">
                    <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Удобства</h3>
                    <button type="button" onClick={() => setAmenitiesModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-secondary)]" aria-label="Закрыть">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {amenities.map((label, i) => (
                        <div key={i} className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                          <span className="text-[var(--accent)] shrink-0">✓</span> {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Владелец — после удобств */}
            <section className="lg:hidden rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
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
                showRespondsFast
              />
            </section>

            {/* 8. AI-метрики квартиры — после владельца */}
            <AIMetricsCardTZ9 listingId={item.id} />

            {/* 9. Отзывы */}
            <LazyBox>
              <ListingReviewsBlockTZ9
                listingId={id}
                ownerId={owner?.id}
                reviews={baseReviews}
                ratingAvg={ratingAvg}
                ratingCount={ratingCount}
                recommendPercent={recommendPercent}
                distribution={distribution}
                userAlreadyReviewed={baseReviews.some((r: any) => (r.authorId ?? r.author?.id) === user?.id)}
                currentUserId={user?.id}
                onSubmitted={() => {}}
              />
            </LazyBox>

            {/* TZ-35: карта вынесена в кнопку рядом с городом + modal (50vh) */}

            {/* ТЗ-3: Lazy load похожих объявлений */}
            {similarListings.length > 0 && (
              <LazyBox>
                <section>
                  <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Похожие объявления</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 scrollbar-none">
                    {similarListings.map((s: any) => (
                      <div key={s.id} className="flex-shrink-0 w-[280px]">
                        <ListingCard
                          id={s.id}
                          photo={s.photos?.[0]?.url ?? s.photo}
                          photos={s.photos}
                          title={s.title ?? 'Без названия'}
                          price={s.basePrice ?? s.price ?? 0}
                          city={s.city}
                          district={s.district}
                          rooms={s.bedrooms}
                          area={s.area}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </LazyBox>
            )}
          </div>

          {/* ТЗ-3: Правая колонка desktop — sticky top 80px. CTA: гость → Войти; владелец → Редактировать; иначе форма брони. */}
          <div className="hidden lg:block">
            {/* ТЗ-48: вертикальный стек — Цена, Адрес, Рейтинг, затем кнопки действий */}
            <div id="listing-booking" className="sticky top-20 space-y-5">
              <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5 space-y-3">
                <p className="text-[24px] font-bold text-[var(--text-primary)]">
                  {priceValue > 0 ? `${priceValue.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                  <span className="text-[16px] font-normal text-[var(--text-muted)]"> / ночь</span>
                </p>
                {pricePerMonth > 0 && <p className="text-[14px] text-[var(--text-secondary)]">{pricePerMonth.toLocaleString('ru-RU')} ₽ / месяц</p>}
                <p className="text-[14px] text-[var(--text-secondary)]">{[item.city, district].filter(Boolean).join(' · ') || item.city || '—'}</p>
                {(item as any).lat && (item as any).lng && (
                  <button type="button" onClick={() => setMapModalOpen(true)} className="listing-map-trigger">
                    📍 Показать на карте
                  </button>
                )}
                {ratingAvg != null && (
                  <p className="text-[14px] font-semibold text-amber-600">★ {ratingAvg.toFixed(1)}{ratingCount > 0 ? ` (${ratingCount})` : ''}</p>
                )}
                {priceValue > 0 && <p className="text-[12px] text-[var(--text-muted)]">Комиссия 7%. Итог при бронировании.</p>}
              </div>
              {permissions.isAdmin ? (
                <div className="space-y-2">
                  {isPendingModeration ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={adminStatusLoading}
                        onClick={() => handleAdminStatusChange('published')}
                        className="h-11 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] flex items-center justify-center hover:opacity-95 disabled:opacity-60"
                      >
                        Одобрить
                      </button>
                      <button
                        type="button"
                        disabled={adminStatusLoading}
                        onClick={() => handleAdminStatusChange('rejected')}
                        className="h-11 rounded-[12px] border border-red-500/30 bg-red-500/10 text-red-600 font-semibold text-[14px] flex items-center justify-center disabled:opacity-60"
                      >
                        Отклонить
                      </button>
                    </div>
                  ) : isPublished ? (
                    <button
                      type="button"
                      disabled={adminStatusLoading}
                      onClick={() => handleAdminStatusChange('archived')}
                      className="w-full h-11 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] font-medium flex items-center justify-center disabled:opacity-60"
                    >
                      Снять с публикации
                    </button>
                  ) : (
                    <div className="h-11 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-secondary)] text-[14px] font-medium flex items-center justify-center">
                      {getListingStatusLabel(listingStatusCanonical)}
                    </div>
                  )}
                  <Link href={`/listing/edit/${item.id}`} className="block w-full h-12 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] flex items-center justify-center hover:opacity-95">
                    Редактировать
                  </Link>
                  <Link href="/admin/moderation" className="w-full h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[13px] font-medium text-[var(--text-primary)] flex items-center justify-center">
                    Модерация
                  </Link>
                  <Link href="/admin/reports" className="w-full h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[13px] font-medium text-[var(--text-primary)] flex items-center justify-center">
                    Жалобы
                  </Link>
                  <button
                    type="button"
                    onClick={() => router.push(`/listing/${item.id}?tab=analytics`)}
                    className="w-full h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[13px] font-medium text-[var(--text-primary)]"
                  >
                    Статистика
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiHostOpen(true)}
                    className="w-full h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[13px] font-medium text-[var(--text-primary)]"
                  >
                    AI-помощник
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}/unpublish`, { method: 'POST' })
                        await queryClient.invalidateQueries({ queryKey: ['listing', id] })
                      }}
                      className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)]"
                    >
                      Скрыть
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Удалить объявление?')) return
                        await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
                        router.push('/profile/listings')
                      }}
                      className="h-10 rounded-[10px] border border-red-500/30 bg-red-500/10 text-[13px] font-medium text-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ) : isOwnerMode ? (
                <div className="space-y-2">
                  <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-secondary)]">
                    {getListingStatusLabel(listingStatusCanonical)}
                    {isRejected && moderationNote ? `: ${moderationNote}` : ''}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/listing/edit/${item.id}`} className="h-11 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] flex items-center justify-center hover:opacity-95">
                      {isRejected ? 'Исправить' : 'Редактировать'}
                    </Link>
                    {isDraft || isRejected ? (
                      <button type="button" onClick={handleOwnerPublish} className="h-11 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] font-medium text-[14px]">
                        {isRejected ? 'Отправить заново' : 'На модерацию'}
                      </button>
                    ) : isPendingModeration ? (
                      <button type="button" onClick={handleOwnerUnpublish} className="h-11 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] font-medium text-[14px]">
                        Отменить
                      </button>
                    ) : (
                      <Link href="/profile/calendar" className="h-11 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] font-medium text-[14px] flex items-center justify-center">
                        Календарь
                      </Link>
                    )}
                  </div>
                  {isPublished && (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Link href={`/listing/edit/${item.id}`} className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] text-[var(--text-primary)] flex items-center justify-center">Редактировать</Link>
                        <Link href="/profile/calendar" className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] text-[var(--text-primary)] flex items-center justify-center">Календарь</Link>
                        <Link href="/profile/promo" className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] text-[var(--text-primary)] flex items-center justify-center">Продвижение</Link>
                        <Link href="/profile/analytics" className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] text-[var(--text-primary)] flex items-center justify-center">Аналитика</Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}/unpublish`, { method: 'POST' })
                            await queryClient.invalidateQueries({ queryKey: ['listing', id] })
                          }}
                          className="h-10 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)]"
                        >
                          Скрыть
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm('Удалить объявление?')) return
                            await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
                            router.push('/profile/listings')
                          }}
                          className="h-10 rounded-[10px] border border-red-500/30 bg-red-500/10 text-[13px] font-medium text-red-600"
                        >
                          Удалить
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : !isAuthenticated() ? (
                <Link href={`/auth/login?redirect=${encodeURIComponent(`/listings/${id}`)}`} className="block w-full h-12 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] flex items-center justify-center hover:opacity-95">
                  Войти чтобы забронировать
                </Link>
              ) : (
                <ListingBooking
                  listingId={item.id}
                  pricePerNight={priceValue || 0}
                  onConfirm={handleBookingConfirm}
                />
              )}
              {/* TZ-66: user — Написать, Забронировать, В избранное; guest не видит */}
              {!isOwnerMode && !permissions.isAdmin && !permissions.isGuest && (
                <>
                  {permissions.canWrite && (
                    <button type="button" onClick={handleWrite} className="w-full h-12 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold text-[14px] hover:bg-[var(--bg-secondary)] transition-colors">
                      Написать
                    </button>
                  )}
                  {permissions.canFavorite && (
                    <button type="button" onClick={handleToggleFavorite} className="w-full h-12 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] flex items-center justify-center gap-2 text-[var(--text-primary)] font-semibold text-[14px] hover:bg-[var(--bg-secondary)] transition-colors" aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}>
                      <svg className={cn('w-5 h-5 transition-all duration-200', isFavorite && 'fill-red-500 text-red-500 scale-110')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      {isFavorite ? 'В избранном' : 'В избранное'}
                    </button>
                  )}
                </>
              )}
              <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
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
                  showRespondsFast
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TZ-60: Фиксированный блок действий — выше bottom-nav (80px), 1 primary (Забронировать). */}
      <div className="listing-actions md:hidden">
        {permissions.isAdmin ? (
          <>
            {isPendingModeration ? (
              <>
                <button type="button" disabled={adminStatusLoading} onClick={() => handleAdminStatusChange('published')} className="h-11 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[13px] flex items-center justify-center disabled:opacity-60">
                  Одобрить
                </button>
                <button type="button" disabled={adminStatusLoading} onClick={() => handleAdminStatusChange('rejected')} className="h-11 px-3 rounded-[10px] border border-red-500/30 bg-red-500/10 text-red-600 font-semibold text-[13px] flex items-center justify-center disabled:opacity-60">
                  Отклонить
                </button>
              </>
            ) : isPublished ? (
              <button type="button" disabled={adminStatusLoading} onClick={() => handleAdminStatusChange('archived')} className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-semibold text-[13px] flex items-center justify-center disabled:opacity-60">
                Снять с публикации
              </button>
            ) : (
              <div className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-secondary)] font-semibold text-[13px] flex items-center justify-center">
                {getListingStatusLabel(listingStatusCanonical)}
              </div>
            )}
            <Link href={`/listing/edit/${item.id}`} className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-semibold text-[13px] flex items-center justify-center">
              Ред.
            </Link>
            <button
              type="button"
              onClick={() => router.push(`/listing/${item.id}?tab=analytics`)}
              className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center"
            >
              Аналитика
            </button>
            <button
              type="button"
              onClick={() => setAiHostOpen(true)}
              className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center"
            >
              AI
            </button>
            <button
              type="button"
              onClick={async () => {
                await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}/unpublish`, { method: 'POST' })
                await queryClient.invalidateQueries({ queryKey: ['listing', id] })
              }}
              className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center"
            >
              Скрыть
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm('Удалить объявление?')) return
                await apiFetchJson(`/api/listings/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
                router.push('/profile/listings')
              }}
              className="h-11 px-3 rounded-[10px] border border-red-500/30 bg-red-500/10 text-red-600 font-medium text-[13px] flex items-center justify-center"
            >
              Удалить
            </button>
          </>
        ) : isOwnerMode ? (
          <>
            {isDraft || isRejected || isPendingModeration ? (
              <>
                <Link href={`/listing/edit/${item.id}`} className="h-11 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[13px] flex items-center justify-center">
                  {isRejected ? 'Исправить' : 'Редактировать'}
                </Link>
                {(isDraft || isRejected) ? (
                  <button type="button" onClick={handleOwnerPublish} className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center">
                    {isRejected ? 'Отправить заново' : 'На модерацию'}
                  </button>
                ) : (
                  <button type="button" onClick={handleOwnerUnpublish} className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center">
                    Отменить
                  </button>
                )}
              </>
            ) : (
              <>
                <Link href={`/listing/edit/${item.id}`} className="h-11 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[13px] flex items-center justify-center">
                  Редактировать
                </Link>
                <Link href="/profile/analytics" className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center">
                  Аналитика
                </Link>
                <Link href="/profile/promo" className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center">
                  Продвижение
                </Link>
                <Link href="/profile/calendar" className="h-11 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] font-medium text-[13px] flex items-center justify-center">
                  Календарь
                </Link>
              </>
            )}
          </>
        ) : !permissions.isGuest ? (
          <>
            {permissions.canFavorite && (
              <button
                type="button"
                onClick={handleToggleFavorite}
                className="w-11 h-11 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)]"
                aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
              >
                <svg className={cn('w-5 h-5', isFavorite && 'fill-red-500 text-red-500')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            )}
            {permissions.canWrite && (
              <button
                type="button"
                onClick={handleWrite}
                className="flex-1 h-11 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] font-medium text-[14px]"
              >
                Написать
              </button>
            )}
            {permissions.canBook && (
              <button
                type="button"
                onClick={handleMobileBookClick}
                className="flex-1 h-11 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                Забронировать
              </button>
            )}
          </>
        ) : null}
      </div>

      {mapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-label="Карта" onClick={() => setMapModalOpen(false)}>
          <div className="w-full max-w-2xl rounded-[16px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-main)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-main)]">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">Карта</h3>
              <button type="button" onClick={() => setMapModalOpen(false)} className="w-9 h-9 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)]" aria-label="Закрыть карту">✕</button>
            </div>
            <div className="h-[50vh] bg-[var(--bg-input)]">
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
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[14px]">Нет координат</div>
              )}
            </div>
          </div>
        </div>
      )}
      {canUseHostAi && (
        <AiHostPanel
          open={aiHostOpen}
          onClose={() => setAiHostOpen(false)}
          listing={hostAiPayload}
          isAdmin={permissions.isAdmin}
        />
      )}

      {aiRecoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-label="AI рекомендации" onClick={() => setAiRecoModalOpen(false)}>
          <div className="w-full max-w-lg rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">AI рекомендации</h3>
              <button type="button" onClick={() => setAiRecoModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)]">✕</button>
            </div>
            <ul className="space-y-2 text-[14px] text-[var(--text-secondary)]">
              <li>• Добавьте 5+ качественных фото с дневным светом.</li>
              <li>• Уточните преимущества района и транспорт.</li>
              <li>• Укажите гибкие условия заселения для роста конверсии.</li>
            </ul>
            <p className="mt-3 text-[13px] text-[var(--text-muted)]">Авто-редактирование подготовлено как mock и пока не меняет данные объявления.</p>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" className="h-9 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold">Предложить авто-редактирование</button>
              <button type="button" onClick={() => setAiRecoModalOpen(false)} className="h-9 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px]">Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {/* ТЗ-12: Bottom sheet с календарём и «Написать владельцу» (только mobile) */}
      {bookingSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Бронирование">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBookingSheetOpen(false)} aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-[var(--bg-card)] border-t border-[var(--border-main)] shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--border-main)] bg-[var(--bg-card)] z-10">
              <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Бронирование</h3>
              <button type="button" onClick={() => setBookingSheetOpen(false)} className="w-10 h-10 rounded-full hover:bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-secondary)]" aria-label="Закрыть">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              <ListingBooking
                listingId={item.id}
                pricePerNight={priceValue || 0}
                onConfirm={(data) => {
                  handleBookingConfirm(data)
                  setBookingSheetOpen(false)
                }}
              />
              <div className="mt-4 pt-4 border-t border-[var(--border-main)]">
                <button type="button" onClick={() => { setBookingSheetOpen(false); handleWrite(); }} className="w-full h-12 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold text-[14px]">
                  Написать владельцу
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen галерея */}
      {isGalleryOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Галерея">
          <button type="button" onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Закрыть">×</button>
          {photos.length > 1 && (
            <>
              <button type="button" onClick={() => setActiveImage((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Предыдущее">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => setActiveImage((i) => (i + 1) % photos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center" aria-label="Следующее">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <img
            src={photos[activeImage]?.url ?? ''}
            alt={`${item.title ?? ''} — ${activeImage + 1} из ${photos.length}`}
            className="max-h-[85vh] w-auto object-contain px-12"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, i) => (
              <button key={i} type="button" onClick={() => setActiveImage(i)} className={cn('w-2.5 h-2.5 rounded-full transition-all', activeImage === i ? 'bg-white scale-110' : 'bg-white/40')} aria-label={`Фото ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ListingAnalyticsPanel({
  isAdmin,
  days,
  onDaysChange,
  stats,
  fallbackStats,
  onReset,
  onOpenRecommendations,
  ai,
  onRefreshAnalysis,
}: {
  isAdmin: boolean
  days: 7 | 30
  onDaysChange: (d: 7 | 30) => void
  stats?: ListingStatsResponse
  fallbackStats: { views: number; favorites: number; bookings: number; clicks: number }
  onReset?: () => Promise<void>
  onOpenRecommendations: () => void
  ai: ListingAnalyzerResult
  onRefreshAnalysis: () => void
}) {
  const [aiCollapsed, setAiCollapsed] = useState(true)
  const [aiDetailsOpen, setAiDetailsOpen] = useState(false)
  const cards = [
    { label: 'Просмотры', value: stats?.views ?? fallbackStats.views },
    { label: 'Переходы в сообщение', value: stats?.messages ?? fallbackStats.clicks },
    { label: 'Добавления в избранное', value: stats?.favorites ?? fallbackStats.favorites },
    { label: 'Бронирования', value: stats?.bookings ?? fallbackStats.bookings },
  ]
  const activity = stats?.activity ?? []
  const sources = stats?.sources ?? [
    { key: 'search', label: 'Поиск', value: 42 },
    { key: 'home', label: 'Главная', value: 27 },
    { key: 'ai', label: 'AI подбор', value: 21 },
    { key: 'favorites', label: 'Избранное', value: 10 },
  ]

  return (
    <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-bold text-[var(--text-primary)]">Аналитика</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onDaysChange(7)} className={cn('h-8 px-3 rounded-[10px] text-[12px] font-medium', days === 7 ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)]')}>7д</button>
          <button type="button" onClick={() => onDaysChange(30)} className={cn('h-8 px-3 rounded-[10px] text-[12px] font-medium', days === 30 ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-primary)]')}>30д</button>
          <button type="button" onClick={onRefreshAnalysis} className="h-8 px-3 rounded-[10px] text-[12px] font-medium border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)]">Обновить анализ</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
            <p className="text-[12px] text-[var(--text-muted)]">{c.label}</p>
            <p className="text-[20px] font-bold text-[var(--text-primary)] mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">График активности</p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" name="Просмотры" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicks" name="Клики" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="favorites" name="Избранное" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">AI рекомендации</p>
          <button type="button" onClick={() => setAiCollapsed((v) => !v)} className="md:hidden h-8 px-2 rounded-[8px] text-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)]">
            {aiCollapsed ? 'Показать' : 'Свернуть'}
          </button>
        </div>
        <div className={cn('space-y-2 mt-2', aiCollapsed ? 'hidden md:block' : 'block')}>
          <p className="text-[14px] text-[var(--text-secondary)]">AI оценка: <span className="font-semibold text-[var(--text-primary)]">{ai.score.toFixed(1)} / 10</span></p>
          <p className="text-[14px] text-[var(--text-secondary)]">Вероятность бронирования: <span className="font-semibold text-[var(--text-primary)]">{ai.conversionChance}%</span></p>
          <ul className="space-y-1 text-[13px] text-[var(--text-secondary)]">
            {ai.tips.map((tip, idx) => (
              <li key={`${idx}-${tip}`}>— {tip}</li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button type="button" onClick={onOpenRecommendations} className="h-9 px-3 rounded-[10px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold">Применить улучшения</button>
            <button type="button" onClick={() => setAiDetailsOpen(true)} className="h-9 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px] font-medium">Подробнее</button>
            {isAdmin && (
              <button type="button" onClick={onOpenRecommendations} className="h-9 px-3 rounded-[10px] border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[13px] font-medium">
                Принудительно улучшить
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">Источники трафика</p>
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.key} className="flex items-center justify-between text-[13px] text-[var(--text-secondary)]">
                <span>{s.label}</span>
                <span className="font-semibold text-[var(--text-primary)]">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && onReset && (
        <button type="button" onClick={onReset} className="h-9 px-3 rounded-[10px] border border-red-500/30 bg-red-500/10 text-red-600 text-[13px] font-medium">
          Сбросить статистику
        </button>
      )}

      {aiDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center" onClick={() => setAiDetailsOpen(false)} role="dialog" aria-modal="true" aria-label="AI подробный отчет">
          <div className="w-full md:max-w-2xl h-[100vh] md:h-auto md:max-h-[85vh] overflow-y-auto rounded-none md:rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">AI подробный отчет</h3>
              <button type="button" onClick={() => setAiDetailsOpen(false)} className="w-8 h-8 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)]">✕</button>
            </div>
            <div className="space-y-3 text-[14px] text-[var(--text-secondary)]">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Рекомендации по тексту</p>
                <p>Проверьте длину описания, добавьте преимущества района и правила заселения.</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Рекомендации по фото</p>
                <p>Добавьте фото кухни, ванной и общий план помещений (минимум 5 фото).</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Рекомендации по цене</p>
                <p>Оптимизируйте цену относительно похожих предложений для роста конверсии.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/** ТЗ-3: Галерея. Mobile: 60vh, overlay назад/избранное/share. Desktop: сетка 420px. */
function GalleryTZ8({
  photos,
  isFavorite,
  onToggleFavorite,
  onOpenFullscreen,
}: {
  photos: Array<{ url: string; alt?: string }>
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onOpenFullscreen?: () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const count = photos.length
  const mainUrl = photos[activeIndex]?.url ?? photos[0]?.url

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return
    const dx = touchStart - e.changedTouches[0].clientX
    if (Math.abs(dx) > 50) setActiveIndex((i) => (dx > 0 ? (i + 1) % count : (i - 1 + count) % count))
    setTouchStart(null)
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ url: window.location.href, title: document.title }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  return (
    <div className="rounded-[16px] overflow-hidden bg-[var(--bg-input)]">
      {/* ТЗ-11: Desktop — сетка 60/40 */}
      <div className="hidden md:grid md:grid-cols-5 gap-1" style={{ height: GALLERY_HEIGHT_PC }}>
        <button
          type="button"
          onClick={onOpenFullscreen}
          className="col-span-3 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {mainUrl ? (
            <img src={mainUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-4xl">📷</div>
          )}
        </button>
        <div className="col-span-2 flex flex-col gap-1">
          {[0, 1, 2, 3].filter((i) => photos[i]).map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="flex-1 min-h-0 relative overflow-hidden rounded-r-[4px] focus:outline-none"
            >
              <img src={photos[idx]?.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      {/* ТЗ-11 + ТЗ-48: Mobile — высота 280px, свайп, счётчик по центру */}
      <div className="md:hidden relative w-full" style={{ height: GALLERY_HEIGHT_MOBILE, minHeight: GALLERY_HEIGHT_MOBILE }}>
        <div
          className="absolute inset-0 overflow-hidden"
          onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          {mainUrl ? (
            <img src={mainUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-4xl">📷</div>
          )}
        </div>
        {/* Редизайн v2: semi-transparent blur кнопки, без огромных серых кругов */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 pointer-events-none">
          <Link href="/listings" className="pointer-events-auto w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30" aria-label="Назад">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button type="button" onClick={onToggleFavorite} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 active:scale-95" aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}>
              <svg className={cn('w-5 h-5', isFavorite && 'fill-red-400')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
            <button type="button" onClick={handleShare} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30" aria-label="Поделиться">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
            {onOpenFullscreen && count > 1 && (
              <button type="button" onClick={onOpenFullscreen} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30" aria-label="Все фото">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              </button>
            )}
          </div>
        </div>
        {/* Градиент затемнения снизу + минималистичный индикатор 1/N + кнопка «Все фото» */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" aria-hidden />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
          <span className="rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[12px] font-medium text-white tabular-nums">
            {activeIndex + 1}/{count || 1}
          </span>
        </div>
        {onOpenFullscreen && count > 1 && (
          <button
            type="button"
            onClick={onOpenFullscreen}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-[10px] bg-white/20 backdrop-blur-md text-white text-[13px] font-medium hover:bg-white/30 pointer-events-auto"
          >
            Все фото
          </button>
        )}
      </div>
    </div>
  )
}
