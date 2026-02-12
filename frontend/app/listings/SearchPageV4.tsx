'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetchJson } from '@/shared/api/client'
import { cn } from '@/shared/utils/cn'
import { ListingCardLight, ListingCardLightSkeleton } from '@/domains/listing/ListingCardLight'
import { scoring, type Listing, type UserParams } from '@/domains/ai/ai-engine'
import { CityInput } from '@/shared/components/CityInput'

interface SearchResponse {
  items: any[]
  total?: number
}

type SortOption = 'ai' | 'price_asc' | 'price_desc' | 'newest'

/**
 * SearchPageV4 — Страница поиска жилья
 * 
 * Структура:
 * 1. Панель фильтров (сверху + слева)
 * 2. AI панель
 * 3. Сетка объявлений
 * 4. Empty state
 */
export function SearchPageV4() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Фильтры из URL
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '')
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [rooms, setRooms] = useState(searchParams.get('rooms') || '')
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'ai')
  const [aiEnabled, setAiEnabled] = useState(searchParams.get('ai') === 'true')
  const [aiResults, setAiResults] = useState<{ reason: string; score: number } | null>(null)
  const [aiScoresMap, setAiScoresMap] = useState<Map<string, { score: number; reasons: string[] }>>(new Map())
  const typeParam = type ? type.toUpperCase() : ''

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
      if (typeParam) params.set('type', typeParam)
    if (rooms) params.set('rooms', rooms)
    if (sort !== 'ai') params.set('sort', sort)
    if (aiEnabled) params.set('ai', 'true')
    
    const newUrl = `/listings${params.toString() ? `?${params.toString()}` : ''}`
    router.replace(newUrl, { scroll: false })
  }, [city, priceMin, priceMax, type, typeParam, rooms, sort, aiEnabled, router])

  // Формируем запрос
  const queryParams = new URLSearchParams()
  if (city) queryParams.set('city', city)
  if (priceMin) queryParams.set('priceMin', priceMin)
  if (priceMax) queryParams.set('priceMax', priceMax)
  if (typeParam) queryParams.set('type', typeParam)
  if (rooms) queryParams.set('rooms', rooms)

  if (sort !== 'ai') queryParams.set('sort', sort)

  const { data, isLoading } = useFetch<SearchResponse>(
    ['search', city, priceMin, priceMax, typeParam, rooms, sort],
    `/api/search?${queryParams.toString()}`
  )

  // AI поиск при включенном AI режиме — запрос напрямую в backend (Railway)
  useEffect(() => {
    if (aiEnabled && (city || priceMin || priceMax || type || rooms)) {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      if (priceMin) params.set('priceMin', String(priceMin))
      if (priceMax) params.set('priceMax', String(priceMax))
      if (typeParam) params.set('type', typeParam)
      if (rooms) params.set('rooms', String(rooms))
      apiFetchJson<{ reason?: string; score?: number; items?: any[]; listings?: any[] }>(`/search?${params.toString()}`)
        .then(data => {
          const items = data.items ?? data.listings ?? []
          setAiResults({ reason: data.reason ?? 'Результаты поиска', score: data.score ?? (items.length ? 70 : 0) })
          if (items.length) {
            const scoresMap = new Map<string, { score: number; reasons: string[] }>(
              items.map((l: any) => [
                l.id as string,
                { score: (l.score as number) ?? 70, reasons: ((l.reasons as string[]) || []) }
              ])
            )
            setAiScoresMap(scoresMap)
          }
        })
        .catch(err => {
          console.error('AI search error:', err)
          setAiResults(null)
        })
    } else {
      setAiResults(null)
    }
  }, [aiEnabled, city, priceMin, priceMax, type, typeParam, rooms])

  // Используем ai-engine для расчета scores, если AI включен
  useEffect(() => {
    if (aiEnabled && data?.items && (city || priceMin || priceMax || type || rooms)) {
      const userParams: UserParams = {
        city: city || undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        type: type || undefined,
        rooms: rooms ? Number(rooms) : undefined,
      }
      
      const engineScoresMap = new Map<string, { score: number; reasons: string[] }>()
      data.items.forEach((listing: any) => {
        const listingData: Listing = {
          id: listing.id,
          city: listing.city,
          basePrice: listing.basePrice || listing.pricePerNight,
          type: listing.type,
          bedrooms: listing.bedrooms,
          area: listing.area,
          views: listing.views,
          rating: listing.rating,
          amenities: listing.amenities,
          description: listing.description,
        }
        
        const aiScore = scoring(listingData, userParams)
        engineScoresMap.set(listing.id, {
          score: aiScore.score,
          reasons: aiScore.reasons,
        })
      })
      
      // Объединяем с существующими scores
      setAiScoresMap(prev => {
        const merged = new Map(prev)
        engineScoresMap.forEach((value, key) => {
          merged.set(key, value)
        })
        return merged
      })
    }
  }, [aiEnabled, data, city, priceMin, priceMax, type, rooms])

  // Преобразуем данные для карточек
  // HYDRATION-SAFE: No Math.random() or Date.now() - use data from API only
  const listingCards = (data?.items || []).map((listing: any) => {
    const rawPhoto =
      listing.images?.[0]?.url ||
      listing.images?.[0] ||
      listing.photos?.[0]?.url ||
      listing.photos?.[0] ||
      listing.image?.url ||
      listing.image ||
      listing.photoUrl ||
      listing.photo ||
      listing.cover ||
      null
    const photo = typeof rawPhoto === 'string' ? rawPhoto : rawPhoto?.url || null
    const district = listing.district || null
    // Реальные просмотры из API (viewsCount с бэкенда)
    const views = listing.viewsCount ?? listing.views ?? 0
    // isNew из API
    const isNew = listing.isNew || false
    const isVerified = (listing.score || 0) >= 70

    // Используем AI scores из API если доступны
    const aiData = aiScoresMap.get(listing.id)
    const aiScore = aiData?.score || listing.score || listing.aiScore || 50
    const aiReasons = aiData?.reasons || listing.reasons || []

    const tags = aiReasons.slice(0, 2).map((reason: string) => {
      if (reason.includes('ниже рынка') || reason.includes('Выгодная') || reason.includes('бюджет')) return 'Выгодная цена'
      if (reason.includes('метро') || reason.includes('транспорт')) return 'Рядом метро'
      if (reason.includes('спрос') || reason.includes('Популярное')) return 'Популярное'
      if (reason.includes('город')) return 'Подходит по городу'
      return null
    }).filter(Boolean) as string[]

    // Очищаем заголовок от лишних надписей
    let cleanTitle = listing.title || 'Без названия'
    cleanTitle = cleanTitle
      .replace(/квартира рядом с метро #?\d*/gi, '')
      .replace(/тихая квартира #?\d*/gi, '')
      .replace(/рядом с метро #?\d*/gi, '')
      .replace(/метро #?\d*/gi, '')
      .replace(/квартира #?\d*/gi, '')
      .trim()
    
    if (!cleanTitle || cleanTitle.length < 3) {
      cleanTitle = `Квартира ${listing.city || ''}`.trim() || 'Без названия'
    }

    const cache = listing.ratingCache as { rating?: number; positive_ratio?: number; cleanliness?: number; noise?: number } | null | undefined
    return {
      id: listing.id,
      photo,
      title: cleanTitle,
      price: listing.pricePerNight || listing.basePrice || 0,
      city: listing.city || 'Не указан',
      district,
      rooms: listing.bedrooms || listing.rooms || 1,
      area: listing.area || 40,
      floor: listing.floor || 1,
      totalFloors: listing.totalFloors || 5,
      views,
      isNew,
      isVerified,
      score: aiScore,
      verdict: listing.verdict || 'Средний вариант',
      reasons: aiReasons,
      tags: tags.length > 0 ? tags : [],
      aiScore: aiScore,
      aiReasons: aiReasons,
      rating: cache?.rating ?? null,
      reviewPercent: cache?.positive_ratio != null ? Math.round(cache.positive_ratio * 100) : null,
      cleanliness: cache?.cleanliness ?? null,
      noise: cache?.noise ?? null,
    }
  })

  // Сортировка
  const sortedListings = [...listingCards].sort((a, b) => {
    switch (sort) {
      case 'ai':
        return (b.aiScore || 0) - (a.aiScore || 0)
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'newest':
        return 0 // TODO: добавить сортировку по дате
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ═══════════════════════════════════════════════════════════════
              ПАНЕЛЬ ФИЛЬТРОВ (слева)
              ═══════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-1">
            <div className={cn(
              'bg-white/[0.75] backdrop-blur-[22px]',
              'rounded-[20px]',
              'border border-white/60',
              'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
              'p-6 lg:sticky lg:top-6'
            )}>
              <h2 className="text-[18px] font-bold text-[#1C1F26] mb-5">Фильтры</h2>
              
              <div className="space-y-5">
                {/* Город */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">
                    Город
                  </label>
                  <CityInput
                    value={city}
                    onChange={setCity}
                    placeholder="Все города"
                    className={cn(
                      'w-full rounded-[14px] px-4 py-2.5',
                      'border border-white/60',
                      'bg-white/75 backdrop-blur-[18px]',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all',
                      'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
                      'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                    )}
                  />
                </div>

                {/* Цена от */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">
                    Цена от
                  </label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="0"
                    className={cn(
                      'w-full rounded-[14px] px-4 py-2.5',
                      'border border-gray-200/60 bg-white/95',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all'
                    )}
                  />
                </div>

                {/* Цена до */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">
                    Цена до
                  </label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="100000"
                    className={cn(
                      'w-full rounded-[14px] px-4 py-2.5',
                      'border border-gray-200/60 bg-white/95',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all'
                    )}
                  />
                </div>

                {/* Тип жилья */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">
                    Тип жилья
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={cn(
                      'w-full rounded-[14px] px-4 py-2.5',
                      'border border-gray-200/60 bg-white/95',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all cursor-pointer'
                    )}
                  >
                    <option value="">Любой</option>
                    <option value="apartment">Квартира</option>
                    <option value="room">Комната</option>
                    <option value="house">Дом</option>
                    <option value="studio">Студия</option>
                  </select>
                </div>

                {/* Комнаты */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6B7280] mb-2">
                    Комнаты
                  </label>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className={cn(
                      'w-full rounded-[14px] px-4 py-2.5',
                      'border border-white/60',
                      'bg-white/75 backdrop-blur-[18px]',
                      'text-[#1C1F26] text-[14px]',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                      'transition-all cursor-pointer appearance-none',
                      'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
                      'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                    )}
                  >
                    <option value="">Любое</option>
                    <option value="1">1 комната</option>
                    <option value="2">2 комнаты</option>
                    <option value="3">3 комнаты</option>
                    <option value="4">4+ комнат</option>
                  </select>
                </div>
              </div>

              {/* AI-подбор (дополняет фильтры) */}
              <div className="mt-6 rounded-[16px] border border-violet-100 bg-violet-50/60 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <div className="text-[13px] font-semibold text-[#1C1F26]">AI‑подбор</div>
                    <div className="text-[12px] text-[#6B7280]">AI поможет отобрать лучшие варианты</div>
                  </div>
                </label>
              </div>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════════
              ОСНОВНОЙ КОНТЕНТ (справа)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3">
            {/* AI ПАНЕЛЬ — показываем только если AI включен */}
            {aiEnabled && !isLoading && sortedListings.length > 0 && (
              <div className={cn(
                'bg-violet-50/80 backdrop-blur-sm',
                'rounded-[18px]',
                'border border-violet-100',
                'p-5 mb-6'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-[16px] font-semibold text-[#1C1F26]">
                    AI подобрал для вас
                  </h3>
                </div>
                {aiResults && (
                  <div className="mb-3">
                    <p className="text-[14px] text-[#1C1F26] mb-1">
                      <strong>Почему эти варианты подходят:</strong> {aiResults.reason}
                    </p>
                    <p className="text-[13px] text-[#6B7280]">
                      Основные критерии совпадения: город, бюджет, тип жилья
                    </p>
                  </div>
                )}
                <p className="text-[13px] text-[#6B7280]">
                  Для каждого объявления показаны рекомендации LOCUS с объяснением, почему оно вам подходит
                </p>
              </div>
            )}

            {/* Результаты + сортировка */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                {!isLoading && (
                  <p className="text-[14px] text-[#6B7280]">
                    Найдено: <span className="font-semibold text-[#1C1F26]">{sortedListings.length}</span> {sortedListings.length === 1 ? 'вариант' : 'вариантов'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortOption)
                  }}
                  className={cn(
                    'rounded-[14px] px-4 py-2.5',
                    'border border-white/60',
                    'bg-white/75 backdrop-blur-[18px]',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                    'transition-all cursor-pointer appearance-none',
                    'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
                    'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                  )}
                >
                  <option value="ai">AI релевантность</option>
                  <option value="price_asc">Цена ↑</option>
                  <option value="price_desc">Цена ↓</option>
                  <option value="newest">Новые</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ListingCardLightSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Сетка объявлений */}
            {!isLoading && sortedListings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {sortedListings.map((listing) => (
                  <ListingCardLight
                    key={listing.id}
                    id={listing.id}
                    photo={listing.photo || undefined}
                    title={(() => {
                      let cleanTitle = listing.title || 'Без названия'
                      cleanTitle = cleanTitle
                        .replace(/квартира рядом с метро #?\d*/gi, '')
                        .replace(/тихая квартира #?\d*/gi, '')
                        .replace(/рядом с метро #?\d*/gi, '')
                        .replace(/метро #?\d*/gi, '')
                        .replace(/квартира #?\d*/gi, '')
                        .trim()
                      if (!cleanTitle || cleanTitle.length < 3) {
                        cleanTitle = `Квартира ${listing.city || ''}`.trim() || 'Без названия'
                      }
                      return cleanTitle
                    })()}
                    price={listing.price}
                    city={listing.city}
                    district={listing.district || undefined}
                    rooms={listing.rooms}
                    area={listing.area}
                    floor={listing.floor}
                    totalFloors={listing.totalFloors}
                    views={listing.views}
                    isNew={listing.isNew}
                    isVerified={listing.isVerified}
                    score={listing.aiScore}
                    verdict={listing.verdict}
                    reasons={listing.aiReasons}
                    tags={listing.tags}
                    rating={listing.rating}
                    reviewPercent={listing.reviewPercent}
                    cleanliness={listing.cleanliness}
                    noise={listing.noise}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && sortedListings.length === 0 && (
              <div className={cn(
                'text-center py-16',
                'bg-white/[0.75] backdrop-blur-[22px]',
                'rounded-[20px]',
                'border border-white/60',
                'shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
              )}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold text-[#1C1F26] mb-2">
                  Пока нет подходящих вариантов
                </h3>
                <p className="text-[14px] text-[#6B7280]">
                  Попробуйте изменить параметры поиска
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
