'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { useQueryClient } from '@tanstack/react-query'
import { formatPrice, amenitiesToLabels, amenityKeysFromApi } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'
import { BookingButton } from './BookingButton'
import { scoring, marketPriceCompare, type Listing, type UserParams } from '@/domains/ai/ai-engine'
import { ListingCardLight } from './ListingCardLight'
import { ReviewForm } from '@/domains/reviews/ReviewForm'
import { metricLabelByKey } from '@/shared/reviews/metricsPool'

interface ListingPageV7Props {
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
    currency: string
    bedrooms?: number
    beds?: number
    bathrooms?: number
    area?: number
    floor?: number
    totalFloors?: number
    images?: Array<{ url: string; alt?: string }>
    photos?: Array<{ url: string }>
    amenities?: string[]
    intelligence?: {
      qualityScore: number
      demandScore: number
      riskScore: number
      explanation?: { text?: string; bullets?: string[] }
    }
    aiScores?: { qualityScore?: number }
    views?: number
    rating?: number
    reviewCount?: number
    lat?: number
    lng?: number
  }
  item?: {
    id: string
    title: string
    description: string
    city: string
    addressLine?: string
    pricePerNight: number
    currency: string
    bedrooms?: number
    beds?: number
    bathrooms?: number
    area?: number
    floor?: number
    totalFloors?: number
    images?: Array<{ url: string; alt?: string }>
    photos?: Array<{ url: string }>
    amenities?: string[]
    intelligence?: {
      qualityScore: number
      demandScore: number
      riskScore: number
      explanation?: {
        text?: string
        bullets?: string[]
      }
    }
    aiScores?: {
      qualityScore?: number
    }
    views?: number
    rating?: number
    reviewCount?: number
    lat?: number
    lng?: number
  }
  decision?: {
    score: number
    reasons: string[]
  }
}

/**
 * ListingPageV7 — Расширенная страница объявления (9 блоков)
 * 
 * Структура:
 * 1. Галерея (без текстов на фото, только badges)
 * 2. Основная информация
 * 3. CTA-блок (справа)
 * 4. AI-анализ (отдельный блок)
 * 5. Описание жилья
 * 6. Удобства
 * 7. Карта
 * 8. Отзывы
 * 9. Похожие предложения
 */
export function ListingPageV7({ id }: ListingPageV7Props) {
  const queryClient = useQueryClient()
  const [activeImage, setActiveImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  useEffect(() => {
    if (!isGalleryOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isGalleryOpen])
  
  const { data, isLoading, error } = useFetch<ListingResponse>(
    ['listing', id],
    `/api/listings/${id}`
  )

  // Похожие объявления
  const { data: similarData } = useFetch<{ items: any[] }>(
    ['similar-listings', id],
    `/api/listings?limit=4&city=${(data?.listing ?? data?.item)?.city || ''}`
  )

  const { data: reviewAggData, isLoading: isAggLoading } = useFetch<{ items: Array<{ metricKey: string; avgValue: number; count: number }> }>(
    ['listing-review-metrics', id],
    `/api/reviews/listing/${encodeURIComponent(id)}/metrics`
  )

  const { data: reviewsData, isLoading: isReviewsLoading } = useFetch<{ items: Array<{ id: string; rating: number; text?: string | null; createdAt: string }> }>(
    ['listing-reviews', id],
    `/api/reviews/listing/${encodeURIComponent(id)}?limit=10`
  )

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-[16/10] bg-gray-200 rounded-[18px]" />
              </div>
              <div className="h-48 bg-gray-200 rounded-[18px]" />
            </div>
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
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-[18px] font-semibold text-[#1C1F26] mb-2">Объявление не найдено</h3>
          <Link href="/listings" className="text-violet-600 hover:text-violet-700 text-[14px] inline-block">
            ← Вернуться к поиску
          </Link>
        </div>
      </div>
    )
  }

  const decision = data?.decision
  
  // Извлекаем фото
  const photos = item.images || item.photos || []
  const coverPhoto = photos[0]?.url
  const hasPhotos = photos.length > 0
  
  // AI данные через ai-engine (ожидает ключи удобств string[])
  const listingData: Listing = {
    id: item.id,
    city: item.city,
    basePrice: item.pricePerNight,
    type: 'apartment', // TODO: из данных
    bedrooms: item.bedrooms,
    area: item.area,
    views: item.views,
    rating: item.rating,
    amenities: amenityKeysFromApi(item.amenities),
    description: item.description,
  }
  
  const userParams: UserParams = {} // Можно добавить из контекста пользователя
  const aiScore = scoring(listingData, userParams)
  const priceAnalysis = marketPriceCompare(listingData)
  
  // Параметры
  const rooms = item.bedrooms ?? null
  const area = item.area ?? null
  const floor = item.floor ?? null
  const totalFloors = item.totalFloors ?? null
  
  // Удобства: API может вернуть string[] или Array<{listingId, amenityId, amenity}> — нормализуем в строки для рендера
  const amenities = amenitiesToLabels(item.amenities)
  
  // Views: show only if present
  const viewsValue = (item as { views?: number; viewsCount?: number }).viewsCount ?? item.views
  const hasViews = Number.isFinite(viewsValue as number) && Number(viewsValue) > 0

  const priceValue = Number(item.pricePerNight ?? (item as { basePrice?: number; price?: number }).basePrice ?? (item as { price?: number }).price ?? null)
  const hasPrice = Number.isFinite(priceValue) && priceValue > 0

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || photos.length < 2) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > 50) {
      setActiveImage((prev) => {
        if (deltaX < 0) return Math.min(prev + 1, photos.length - 1)
        return Math.max(prev - 1, 0)
      })
    }
    touchStartX.current = null
  }

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current
      if (deltaY > 60) {
        setIsGalleryOpen(false)
        touchStartYRef.current = null
        touchStartX.current = null
        return
      }
    }
    handleTouchEnd(e)
    touchStartYRef.current = null
  }

  // Похожие объявления (исключаем текущее)
  // HYDRATION-SAFE: No Math.random() - use data from API
  const similarListings = (similarData?.items || [])
    .filter((l: any) => l.id !== id)
    .map((listing: any) => {
      const photo = listing.photos?.[0]?.url || listing.images?.[0]?.url || null
      return {
        id: listing.id,
        photo,
        title: listing.title,
        price: listing.pricePerNight ?? listing.basePrice ?? 0,
        city: listing.city,
        district: listing.district || null,
        rooms: listing.bedrooms ?? 0,
        area: listing.area ?? 0,
        floor: listing.floor ?? 0,
        totalFloors: listing.totalFloors ?? 0,
        views: listing.viewsCount ?? listing.views ?? 0,
        isNew: listing.isNew ?? false,
        isVerified: (listing.score || 0) >= 70,
        score: listing.score ?? 0,
        verdict: listing.verdict ?? '',
        reasons: listing.reasons || [],
        tags: [],
        aiScore: listing.aiScore ?? 0,
        aiReasons: listing.aiReasons || [],
      }
    })
    .filter((listing: any) => Boolean(listing.photo && listing.title && listing.city))
    .slice(0, 4)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/listings" className="text-[14px] text-[#6B7280] hover:text-[#1C1F26] transition-colors inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к поиску
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 1: Галерея + БЛОК 3: CTA (справа)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* БЛОК 1: Галерея */}
          <div className="lg:col-span-2">
            <div className={cn(
              'bg-white rounded-[18px] overflow-hidden',
              'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
              'border border-gray-100/80'
            )}>
              <div
                className="relative w-full h-[42vh] sm:h-[45vh] bg-gray-100"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => hasPhotos && setIsGalleryOpen(true)}
              >
                {hasPhotos ? (
                  <>
                    <Image
                      src={photos[activeImage]?.url || coverPhoto || ''}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized={(photos[activeImage]?.url || coverPhoto || '').startsWith('http')}
                    />
                    {/* Бейдж: Только "Проверено" */}
                    {aiScore.score >= 70 && (
                      <div className="absolute top-4 left-4">
                        <span className={cn(
                          'px-3 py-1.5 rounded-lg',
                          'bg-emerald-600/90 backdrop-blur-sm',
                          'text-white text-[12px] font-semibold',
                          'flex items-center gap-1.5'
                        )}>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Проверено
                        </span>
                      </div>
                    )}
                    
                    {/* Навигация по фото */}
                    {photos.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={cn(
                              'w-2 h-2 rounded-full transition-all',
                              activeImage === i ? 'bg-white' : 'bg-white/50'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[14px] text-gray-400">
                    Фото пока не добавлены
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* БЛОК 3: CTA-блок (справа) */}
          <div className="lg:col-span-1">
            <div className={cn(
              'bg-white rounded-[18px] p-6 lg:sticky lg:top-6',
              'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
              'border border-gray-100/80'
            )}>
              {/* Цена */}
              {hasPrice && (
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-bold text-[#1C1F26]">
                      {formatPrice(priceValue, 'month')}
                    </span>
                  </div>
                </div>
              )}

              {/* Действия */}
              <div className="space-y-3 mb-6">
                <button
                  className={cn(
                    'w-full px-5 py-3 rounded-[14px]',
                    'bg-violet-600 text-white font-semibold text-[15px]',
                    'hover:bg-violet-500 active:bg-violet-700',
                    'transition-all duration-200',
                    'shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
                  )}
                >
                  Написать владельцу
                </button>

                <BookingButton listingId={item.id} price={priceValue || 0} variant="secondary" />

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={cn(
                    'w-full px-5 py-3 rounded-[14px]',
                    'bg-white border-2 border-gray-200',
                    'text-[#1C1F26] font-semibold text-[15px]',
                    'hover:bg-gray-50 transition-colors',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  <svg className={cn('w-5 h-5', isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400')} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                </button>
              </div>

              {/* Просмотры */}
              {hasViews && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[14px] text-[#6B7280]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-medium">{viewsValue} просмотров</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 2: Основная информация
            ═══════════════════════════════════════════════════════════════ */}
        <div className={cn(
          'bg-white rounded-[18px] p-6 mb-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <h1 className="text-[28px] font-bold text-[#1C1F26] mb-2">{item.title}</h1>
          <p className="text-[15px] text-[#6B7280] mb-4">
            {item.city}
            {item.addressLine && ` · ${item.addressLine.split(',')[0]}`}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[13px] text-[#6B7280] mb-1">Комнаты</p>
              <p className="text-[15px] font-medium text-[#1C1F26]">{rooms ?? '—'}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B7280] mb-1">Площадь</p>
              <p className="text-[15px] font-medium text-[#1C1F26]">
                {area ? `${area} м²` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B7280] mb-1">Этаж</p>
              <p className="text-[15px] font-medium text-[#1C1F26]">
                {floor && totalFloors ? `${floor}/${totalFloors}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B7280] mb-1">Тип</p>
              <p className="text-[15px] font-medium text-[#1C1F26]">Квартира</p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 4: AI-анализ (отдельный блок)
            ═══════════════════════════════════════════════════════════════ */}
        {aiScore.score > 0 && (
          <div className={cn(
            'bg-violet-50/80 backdrop-blur-sm rounded-[18px] p-6 mb-6',
            'border border-violet-100',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
          )}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <h2 className="text-[20px] font-bold text-[#1C1F26]">
                Почему LOCUS рекомендует это жильё
              </h2>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[32px] font-bold text-violet-600">{aiScore.score}</span>
                <span className="text-[14px] text-[#6B7280]">%</span>
              </div>
            </div>

            {/* Анализ цены */}
            <div className="mb-4 p-4 bg-white/60 rounded-[12px]">
              <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-2">Анализ цены</h3>
              <p className="text-[13px] text-[#6B7280]">
                {priceAnalysis.status === 'below' && `Цена ниже рынка на ${priceAnalysis.percent.toFixed(0)}%`}
                {priceAnalysis.status === 'above' && `Цена выше рынка на ${priceAnalysis.percent.toFixed(0)}%`}
                {priceAnalysis.status === 'average' && 'Цена соответствует рынку'}
              </p>
            </div>

            {/* Плюсы */}
            {aiScore.pros.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-2">Плюсы</h3>
                <ul className="space-y-1">
                  {aiScore.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#1C1F26]">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Риски */}
            {aiScore.risks.length > 0 && (
              <div>
                <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-2">Риски</h3>
                <ul className="space-y-1">
                  {aiScore.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#1C1F26]">
                      <span className="text-amber-600 mt-0.5">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 5: Описание жилья
            ═══════════════════════════════════════════════════════════════ */}
        {item.description && (
          <div className={cn(
            'bg-white rounded-[18px] p-6 mb-6',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            'border border-gray-100/80'
          )}>
            <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Описание</h2>
            <div className="prose prose-sm max-w-none">
              <p className={cn(
                'text-[15px] text-[#6B7280] leading-relaxed whitespace-pre-line',
                !isDescriptionExpanded && 'line-clamp-3'
              )}>
                {item.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
              className="mt-3 text-[13px] font-medium text-violet-600 hover:text-violet-700"
            >
              {isDescriptionExpanded ? 'Свернуть' : 'Развернуть'}
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 6: Удобства
            ═══════════════════════════════════════════════════════════════ */}
        <div className={cn(
          'bg-white rounded-[18px] p-6 mb-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Удобства</h2>
          {amenities.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(showAllAmenities ? amenities : amenities.slice(0, 6)).map((amenity, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-[12px]',
                    'bg-gray-50 border border-gray-200'
                  )}
                >
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[14px] font-medium text-[#1C1F26]">{amenity}</span>
                </div>
                ))}
              </div>
              {amenities.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllAmenities((prev) => !prev)}
                  className="mt-4 text-[13px] font-medium text-violet-600 hover:text-violet-700"
                >
                  {showAllAmenities ? 'Свернуть' : 'Показать все'}
                </button>
              )}
            </>
          ) : (
            <p className="text-[14px] text-[#6B7280]">Удобства не указаны.</p>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 7: Карта
            ═══════════════════════════════════════════════════════════════ */}
        <div className={cn(
          'bg-white rounded-[18px] p-6 mb-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Расположение</h2>
          {item.addressLine && (
            <p className="text-[14px] text-[#6B7280] mb-4">{item.addressLine}</p>
          )}
          <div className="aspect-video rounded-[12px] bg-gray-100 flex items-center justify-center overflow-hidden">
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
              <div className="text-center p-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-[14px] text-gray-400">Точный адрес доступен после бронирования</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 8: Отзывы
            ═══════════════════════════════════════════════════════════════ */}
        <div className={cn(
          'bg-white rounded-[18px] p-6 mb-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-[#1C1F26]">
              Отзывы
              {item.reviewCount && (
                <span className="text-[14px] font-normal text-[#6B7280] ml-2">
                  ({item.reviewCount})
                </span>
              )}
            </h2>
            {item.rating && (
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[16px] font-semibold text-[#1C1F26]">{item.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Aggregates */}
          <div className="rounded-[14px] border border-gray-100 bg-gray-50 p-4">
            <div className="text-[14px] font-semibold text-[#1C1F26]">Метрики по отзывам</div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(reviewAggData?.items ?? []).slice(0, 6).map((m) => (
                <div key={m.metricKey} className="rounded-[14px] border border-gray-100 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-semibold text-[#1C1F26]">{metricLabelByKey(m.metricKey)}</div>
                    <div className="text-[13px] font-extrabold text-violet-700">{Math.round(m.avgValue)}</div>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-violet-600" style={{ width: `${Math.max(0, Math.min(100, m.avgValue))}%` }} />
                  </div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">{m.count} оценок</div>
                </div>
              ))}
              {!isAggLoading && (reviewAggData?.items?.length ?? 0) === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 text-[13px] text-[#6B7280]">
                  Пока нет метрик — оставьте первый отзыв.
                </div>
              )}
            </div>
          </div>

          {/* Reviews list */}
          <div className="mt-4 space-y-3">
            {(reviewsData?.items ?? []).map((r) => (
              <div key={r.id} className="rounded-[16px] border border-gray-100/80 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">★</span>
                    <span className="text-[14px] font-semibold text-[#1C1F26]">{r.rating}/5</span>
                  </div>
                  <span className="text-[12px] text-[#9CA3AF]">
                    {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                {r.text && (
                  <p className="mt-2 text-[14px] text-[#4B5563] whitespace-pre-wrap">{r.text}</p>
                )}
              </div>
            ))}
            {!isReviewsLoading && (reviewsData?.items?.length ?? 0) === 0 && (
              <div className="rounded-[12px] bg-gray-50 p-4 text-[14px] text-[#6B7280]">
                Отзывов пока нет. Будьте первым.
              </div>
            )}
          </div>

          <div className="mt-5">
            <ReviewForm
              listingId={id}
              onSubmitted={async () => {
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: ['listing-reviews', id] }),
                  queryClient.invalidateQueries({ queryKey: ['listing-review-metrics', id] }),
                ])
              }}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            БЛОК 9: Похожие предложения
            ═══════════════════════════════════════════════════════════════ */}
        {similarListings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[24px] font-bold text-[#1C1F26] mb-4">Похожие предложения</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarListings.map(listing => (
                <ListingCardLight
                  key={listing.id}
                  {...listing}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isGalleryOpen && hasPhotos && (
        <div className="fixed inset-0 z-[1000] bg-black/90">
          <button
            type="button"
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl"
            aria-label="Закрыть"
          >
            ✕
          </button>
          <div
            className="w-full h-full flex items-center justify-center"
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
          >
            <Image
              src={photos[activeImage]?.url || coverPhoto || ''}
              alt={item.title}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto object-contain"
              priority
              unoptimized={(photos[activeImage]?.url || coverPhoto || '').startsWith('http')}
            />
          </div>
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all',
                    activeImage === i ? 'bg-white' : 'bg-white/40'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
