'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { useQuery } from '@tanstack/react-query'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { addPendingReminder } from '@/shared/reviews/reviewReminderStorage'
import { useAuthStore } from '@/domains/auth'
import { amenitiesToLabels, amenityKeysFromApi } from '@/core/i18n/ru'
import { scoring, type Listing } from '@/domains/ai/ai-engine'
import { cn } from '@/shared/utils/cn'
import { ListingOwner, ListingBooking } from '@/components/listing'
import { AIMetricsCardTZ9, ListingReviewsBlockTZ9 } from '@/domains/listing/listing-page'
import { ListingCard } from '@/components/listing'

interface ListingPageTZ8Props {
  id: string
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
}

const GALLERY_HEIGHT_PC = 420
const PHOTOS_DISPLAY = 12

export function ListingPageTZ8({ id }: ListingPageTZ8Props) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [isGalleryOpen, setGalleryOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false)

  const { data, isLoading, error } = useFetch<ListingResponse>(['listing', id], `/api/listings/${id}`)
  const { data: reviewsData } = useFetch<{ items?: any[] }>(['listing-reviews', id], `/api/reviews/listing/${encodeURIComponent(id)}?limit=10`)
  const { data: ratingSummaryData } = useFetch<{
    ok: boolean
    summary: { avg: number | null; weightedAvg?: number | null; count: number; distribution?: Record<number, number>; percent?: number | null }
  }>(['listing-rating-summary', id], `/api/reviews/listing/${encodeURIComponent(id)}/summary`)
  const { data: similarData } = useFetch<{ items?: any[] }>(['listings-similar', id], `/api/listings?limit=8`)

  const itemFromData = data?.listing ?? data?.item
  const ownerIdFromData = itemFromData?.owner?.id ?? (itemFromData as any)?.ownerId ?? ''
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
    setWriteLoading(true)
    try {
      const conv = await apiFetchJson<{ id: string }>(`/chats/by-listing/${itemFromData?.id}`, { method: 'POST' })
      router.push(`/chat/${conv.id}`)
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
      if (res?.conversationId) router.push(`/chat/${res.conversationId}`)
    } catch {}
  }

  const scrollToBooking = useCallback(() => {
    document.getElementById('listing-booking')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

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

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] mb-6">
          ← Назад к поиску
        </Link>

        {/* ТЗ 19: Верх — галерея 60% + правый блок брони 40%, фиксирован при скролле */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
          <section className="lg:col-span-3 min-w-0">
            <GalleryTZ8
              photos={photos}
              onOpenFullscreen={photosLength > 0 ? () => setGalleryOpen(true) : undefined}
            />
          </section>
          <div className="lg:col-span-2">
            <div id="listing-booking" className="sticky top-6">
              <ListingBooking
                listingId={item.id}
                pricePerNight={priceValue || 0}
                onConfirm={handleBookingConfirm}
              />
            </div>
          </div>
        </div>

        {/* Информация под фото: описание, удобства, расположение, отзывы */}
        <div className="space-y-6">
            {/* 2. Основной блок */}
            <section>
              <h1 className="text-[22px] md:text-[24px] font-bold text-[var(--text-primary)] leading-tight">
                {typeLabel} • {(item as any).district || 'Центр'}
              </h1>
              <p className="text-[15px] text-[var(--text-secondary)] mt-1">{item.city}</p>
              <p className="text-[14px] text-[var(--text-muted)] mt-0.5">{metroText}</p>

              <div className="mt-4">
                <p className="text-[28px] font-bold text-[var(--text-primary)]">
                  {priceValue > 0 ? `${priceValue.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                  <span className="text-[16px] font-normal text-[var(--text-muted)]"> / ночь</span>
                </p>
                {pricePerMonth > 0 && (
                  <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">{pricePerMonth.toLocaleString('ru-RU')} ₽ / месяц</p>
                )}
                {priceValue > 0 && (
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">включая сервис 7%</p>
                )}
              </div>

              {/* ТЗ 19: метки доверия — Проверено, AI подобрано, Новый объект, Суперхозяин */}
              <div className="flex flex-wrap gap-2 mt-3">
                {(item as any)?.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
                    <span aria-hidden>✓</span> Проверено
                  </span>
                )}
                {aiScore >= 70 && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
                    <span aria-hidden>✓</span> AI подобрано
                  </span>
                )}
                {(item as any)?.isNew && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
                    Новый объект
                  </span>
                )}
                {((owner as any)?.superhost || (item as any)?.superhost) && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
                    Суперхозяин
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-[14px] text-[var(--text-secondary)]">
                <span>🛏 {(item as any).capacityGuests ?? 2} гостя</span>
                <span>🛋 {item.bedrooms ?? 1} комната</span>
                {item.area != null && <span>📐 {item.area} м²</span>}
                {item.floor != null && (
                  <span>🏢 {item.totalFloors != null ? `этаж ${item.floor} из ${item.totalFloors}` : `${item.floor} этаж`}</span>
                )}
                <span>🚇 5 мин</span>
              </div>
            </section>

            {/* ТЗ 18: AI-блок — карточка с иконкой, список анализа */}
            <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0" aria-hidden>
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">AI анализ</h3>
                  <ul className="mt-2 space-y-1.5 text-[14px] text-[var(--text-secondary)]">
                    {(aiReasons.length > 0 ? aiReasons : ['Под ваш бюджет', 'Район востребован']).slice(0, 4).map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-[var(--accent)]">•</span> {typeof r === 'string' ? r : (r as string)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Описание */}
            {item.description && (
              <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
                <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Описание</h2>
                <p className={cn('text-[14px] text-[var(--text-secondary)] whitespace-pre-line', !descExpanded && 'line-clamp-4')}>
                  {item.description}
                </p>
                {item.description.length > 200 && (
                  <button type="button" onClick={() => setDescExpanded((e) => !e)} className="mt-2 text-[14px] font-medium text-[var(--accent)] hover:underline">
                    {descExpanded ? 'Свернуть' : 'Показать полностью'}
                  </button>
                )}
              </section>
            )}

            {/* ТЗ 18: Удобства — сетка, «Показать все» при большом списке */}
            {amenities.length > 0 && (
              <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
                <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-4">Удобства</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(amenitiesExpanded ? amenities : amenities.slice(0, 8)).map((label, i) => (
                    <div key={i} className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                      <span className="text-[var(--accent)]">•</span> {label}
                    </div>
                  ))}
                </div>
                {amenities.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setAmenitiesExpanded((e) => !e)}
                    className="mt-3 text-[14px] font-medium text-[var(--accent)] hover:underline"
                  >
                    {amenitiesExpanded ? 'Свернуть' : 'Показать все'}
                  </button>
                )}
              </section>
            )}

            {/* Trust Layer 1: Хозяин + рейтинг */}
            <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
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
            </section>

            {/* Trust Layer 2: AI-метрики квартиры */}
            <AIMetricsCardTZ9 listingId={item.id} />

            {/* Trust Layer 3: Отзывы (сводка, распределение, AI-вывод, фильтры, карточки, ответы хозяина) */}
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

            {/* 9. Район / карта */}
            <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Район</h2>
              <p className="text-[14px] text-[var(--text-secondary)] mb-3">{metroText} • карта</p>
              <div className="h-48 rounded-[12px] overflow-hidden bg-[var(--bg-input)]">
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
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[14px]">Карта</div>
                )}
              </div>
            </section>

            {/* ТЗ 18: Похожие рядом */}
            {similarListings.length > 0 && (
              <section>
                <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Похожие рядом</h2>
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
            )}
        </div>
      </div>

      {/* ТЗ 18: Sticky-панель mobile — цена + забронировать */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-[var(--bg-card)]/95 backdrop-blur border-t border-[var(--border-main)] md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[18px] font-bold text-[var(--text-primary)]">
              {priceValue > 0 ? `${priceValue.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
              <span className="text-[14px] font-normal text-[var(--text-muted)]"> / ночь</span>
            </p>
            {priceValue > 0 && <p className="text-[11px] text-[var(--text-muted)]">включая сервис 7%</p>}
          </div>
          <button
            type="button"
            onClick={scrollToBooking}
            className="shrink-0 h-12 px-6 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px]"
          >
            Забронировать
          </button>
        </div>
      </div>

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

/** Галерея ТЗ 8: ПК — большое слева + 4 мини справа 420px; моб — слайдер + счётчик 1/12 */
function GalleryTZ8({
  photos,
  onOpenFullscreen,
}: {
  photos: Array<{ url: string; alt?: string }>
  onOpenFullscreen?: () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const count = photos.length
  const mainUrl = photos[activeIndex]?.url ?? photos[0]?.url
  const thumbIndices = [0, 1, 2, 3, 4].filter((i) => i !== activeIndex && photos[i]).slice(0, 4)

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return
    const dx = touchStart - e.changedTouches[0].clientX
    if (Math.abs(dx) > 50) setActiveIndex((i) => (dx > 0 ? (i + 1) % count : (i - 1 + count) % count))
    setTouchStart(null)
  }

  return (
    <div className="rounded-[16px] overflow-hidden bg-[var(--bg-input)]">
      <div className="hidden md:grid md:grid-cols-4 gap-1" style={{ height: GALLERY_HEIGHT_PC }}>
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
        <div className="flex flex-col gap-1">
          {thumbIndices.map((idx) => (
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
      {/* Mobile: слайдер + счётчик */}
      <div className="md:hidden relative">
        <div
          className="relative h-[280px] overflow-hidden"
          onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          {mainUrl ? (
            <img src={mainUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-4xl">📷</div>
          )}
        </div>
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[12px] font-medium tabular-nums">
          {Math.min(activeIndex + 1, count)} / {count}
        </div>
        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.slice(0, Math.min(count, 12)).map((_, i) => (
              <button key={i} type="button" onClick={() => setActiveIndex(i)} className={cn('w-2 h-2 rounded-full transition-all', activeIndex === i ? 'bg-white' : 'bg-white/50')} aria-label={`Фото ${i + 1}`} />
            ))}
          </div>
        )}
        <button type="button" onClick={onOpenFullscreen} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center" aria-label="Открыть галерею">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      </div>
    </div>
  )
}
