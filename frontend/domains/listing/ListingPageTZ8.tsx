'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

/** ТЗ-11: Desktop сетка 60/40, mobile высота 320–360px */
const GALLERY_HEIGHT_PC = 420
const GALLERY_HEIGHT_MOBILE = 340
const PHOTOS_DISPLAY = 12

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

export function ListingPageTZ8({ id }: ListingPageTZ8Props) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [isGalleryOpen, setGalleryOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false)
  /** ТЗ-12: Mobile — нижняя панель; по тапу «Забронировать» открывается календарь (bottom sheet) */
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)

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
    } catch {}
  }

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
  const isCurrentUserOwner = user?.id && owner?.id && user.id === owner.id

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] mb-6">
          ← Назад к поиску
        </Link>

        {/* ТЗ-11: Порядок — фото, заголовок, AI-оценка, цена, описание, удобства, отзывы, карта, похожие. Отступы 24px. */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_1fr] gap-6">
          <div className="min-w-0 space-y-6">
            <section>
              <GalleryTZ8
                photos={photos}
                isFavorite={isFavorite}
                onToggleFavorite={() => setIsFavorite((f) => !f)}
                onOpenFullscreen={photosLength > 0 ? () => setGalleryOpen(true) : undefined}
              />
            </section>

            {/* ТЗ-11: Блок ключевой информации — название, район, метро, рейтинг, отзывы */}
            <section>
              <h1 className="text-[20px] md:text-[22px] font-bold text-[var(--text-primary)] leading-tight">
                {item.title || typeLabel}
              </h1>
              <p className="text-[14px] text-[var(--text-secondary)] mt-1">{locationLine || item.city}</p>
              {(item as any).metro && <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{(item as any).metro}</p>}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                {ratingAvg != null && (
                  <span className="inline-flex items-center gap-1 text-[16px] font-bold text-amber-600">
                    ★ {ratingAvg.toFixed(1)}
                  </span>
                )}
                {ratingCount > 0 && (
                  <span className="text-[14px] text-[var(--text-secondary)]">
                    {ratingCount} {ratingCount === 1 ? 'отзыв' : ratingCount < 5 ? 'отзыва' : 'отзывов'}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[var(--text-muted)] mt-2">
                {(item as any).capacityGuests ?? 2} гостя · {item.bedrooms ?? 1} комн.
                {item.area != null ? ` · ${item.area} м²` : ''} · {metroText}
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--border-main)] lg:hidden">
                <p className="text-[22px] font-bold text-[var(--text-primary)]">
                  {priceValue > 0 ? `${priceValue.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                  <span className="text-[14px] font-normal text-[var(--text-muted)]"> / ночь</span>
                </p>
                {pricePerMonth > 0 && <p className="text-[14px] text-[var(--text-secondary)]">{pricePerMonth.toLocaleString('ru-RU')} ₽ / месяц</p>}
                {priceValue > 0 && <p className="text-[12px] text-[var(--text-muted)]">комиссия 7% включена</p>}
              </div>
            </section>

            {/* ТЗ-11: AI-оценка жилья — главный блок (сразу после заголовка) */}
            <AIMetricsCardTZ9 listingId={item.id} />

            {/* ТЗ-6: Описание — всегда после AI. Свернуто 4 строки, кнопка «Показать полностью». */}
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
                    Все удобства
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

            {/* ТЗ-6: Владелец — карточка с кнопками «Написать» и «Профиль», отвечает быстро. */}
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

            {/* ТЗ-11: Lazy load отзывов */}
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

            {/* ТЗ-3: Lazy load карты */}
            <LazyBox>
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
            </LazyBox>

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
            <div id="listing-booking" className="sticky top-20 space-y-5">
              <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
                <div>
                  <p className="text-[24px] font-bold text-[var(--text-primary)]">
                    {priceValue > 0 ? `${priceValue.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                    <span className="text-[16px] font-normal text-[var(--text-muted)]"> / ночь</span>
                  </p>
                  {pricePerMonth > 0 && <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">{pricePerMonth.toLocaleString('ru-RU')} ₽ / месяц</p>}
                  {priceValue > 0 && <p className="text-[12px] text-[var(--text-muted)] mt-1">Комиссия 7%. Итог при бронировании.</p>}
                </div>
              </div>
              {isCurrentUserOwner ? (
                <Link href={`/owner/dashboard?tab=edit&id=${item.id}`} className="block w-full h-12 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] flex items-center justify-center hover:opacity-95">
                  Редактировать объявление
                </Link>
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
              {!isCurrentUserOwner && (
                <button type="button" onClick={() => setIsFavorite((f) => !f)} className="w-full h-12 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] flex items-center justify-center gap-2 text-[var(--text-primary)] font-semibold text-[14px] hover:bg-[var(--bg-secondary)] transition-colors" aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}>
                  <svg className={cn('w-5 h-5 transition-all duration-200', isFavorite && 'fill-red-500 text-red-500 scale-110')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
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

      {/* ТЗ-12: Нижняя панель действий (Mobile) — 64px, [Цена] [♡] [Забронировать]. Избранное только здесь + в фото. */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-between gap-3 px-4 bg-[var(--bg-card)]/95 backdrop-blur border-t border-[var(--border-main)] safe-area-pb"
        style={{ height: 64, minHeight: 64, paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {priceValue > 0 ? (
          <p className="text-[14px] font-bold text-[var(--text-primary)] shrink-0">
            от {priceValue.toLocaleString('ru-RU')} ₽
            <span className="text-[12px] font-normal text-[var(--text-muted)]"> / ночь</span>
          </p>
        ) : (
          <span className="text-[14px] text-[var(--text-muted)]">Цена по запросу</span>
        )}
        <button
          type="button"
          onClick={() => setIsFavorite((f) => !f)}
          className="shrink-0 w-12 h-12 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] flex items-center justify-center transition-all duration-200 hover:bg-[var(--bg-secondary)] active:scale-95"
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <svg className={cn('w-5 h-5 transition-all duration-200', isFavorite && 'fill-red-500 text-red-500 scale-110')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
        {isCurrentUserOwner ? (
          <Link href={`/owner/dashboard?tab=edit&id=${item.id}`} className="shrink-0 h-12 px-5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] flex items-center justify-center hover:opacity-95 active:scale-[0.98] transition-transform">
            Редактировать
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleMobileBookClick}
            className="shrink-0 h-12 px-5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] flex items-center justify-center hover:opacity-95 active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {isAuthenticated() ? 'Забронировать' : 'Войти чтобы забронировать'}
          </button>
        )}
      </div>

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
      {/* ТЗ-11: Mobile — высота 320–360px, свайп, точки, кнопка «Все фото» */}
      <div className="md:hidden relative w-full" style={{ height: GALLERY_HEIGHT_MOBILE, minHeight: 320 }}>
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
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 pointer-events-none">
          <Link href="/listings" className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center" aria-label="Назад">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button type="button" onClick={onToggleFavorite} className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95" aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}>
              <svg className={cn('w-5 h-5 transition-all duration-200', isFavorite && 'fill-red-500 scale-110')} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
            <button type="button" onClick={handleShare} className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center" aria-label="Поделиться">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
            {onOpenFullscreen && (
              <button type="button" onClick={onOpenFullscreen} className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center" aria-label="Открыть галерею">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-auto">
          {photos.slice(0, Math.min(count, 12)).map((_, i) => (
            <button key={i} type="button" onClick={() => setActiveIndex(i)} className={cn('w-2 h-2 rounded-full transition-all bg-white/70', activeIndex === i && 'bg-white scale-110')} aria-label={`Фото ${i + 1}`} />
          ))}
        </div>
        {onOpenFullscreen && count > 1 && (
          <button
            type="button"
            onClick={onOpenFullscreen}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-[10px] bg-black/60 text-white text-[13px] font-medium pointer-events-auto"
          >
            Все фото
          </button>
        )}
      </div>
    </div>
  )
}
