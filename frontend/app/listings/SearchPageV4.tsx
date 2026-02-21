'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetchJson } from '@/shared/api/client'
import { cn } from '@/shared/utils/cn'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { scoring, type Listing, type UserParams } from '@/domains/ai/ai-engine'
import { useFilterStore } from '@/core/filters'
import { QuickAIModal, FiltersModal, ActiveFilterChips } from '@/components/filters'
import { FilterBar } from '@/components/search/FilterBar'

interface SearchResponse {
  items: any[]
  total?: number
}

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
  const hydrated = useRef(false)
  const {
    city,
    budgetMin,
    budgetMax,
    type,
    rooms,
    duration,
    aiMode,
    setCity,
    setBudget,
    setType,
    setRooms,
    setDuration,
    setAiMode,
    getBudgetQuery,
    reset,
    sort,
    setSort,
  } = useFilterStore()

  const [aiResults, setAiResults] = useState<{ reason: string; score: number } | null>(null)
  const [aiScoresMap, setAiScoresMap] = useState<Map<string, { score: number; reasons: string[] }>>(new Map())
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [quickAIOpen, setQuickAIOpen] = useState(false)

  const priceMin = getBudgetQuery().priceMin
  const priceMax = getBudgetQuery().priceMax
  const typeStr = Array.isArray(type) ? type[0] : type
  const typeParam = typeStr ? String(typeStr).toUpperCase() : ''
  const roomsStr = Array.isArray(rooms) ? rooms.join(',') : (rooms != null && rooms !== '' ? String(rooms) : '')

  // Гидрация store из URL при первом рендере
  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    const urlCity = searchParams.get('city') || ''
    const urlPriceMin = searchParams.get('priceMin') || ''
    const urlPriceMax = searchParams.get('priceMax') || ''
    const urlType = searchParams.get('type') || ''
    const urlRooms = searchParams.get('rooms') || ''
    const urlAi = searchParams.get('ai') === 'true'
    const urlSort = searchParams.get('sort') as 'popular' | 'price_asc' | 'price_desc' | null
    if (urlCity || urlPriceMin || urlPriceMax || urlType || urlRooms || urlSort) {
      setCity(urlCity || null)
      setBudget(urlPriceMin ? Number(urlPriceMin) : '', urlPriceMax ? Number(urlPriceMax) : '')
      useFilterStore.getState().setType(urlType)
      useFilterStore.getState().setRooms(urlRooms)
      useFilterStore.setState({ aiMode: urlAi })
      if (urlSort === 'popular' || urlSort === 'price_asc' || urlSort === 'price_desc') {
        useFilterStore.getState().setSort(urlSort)
      }
    }
  }, [searchParams, setCity, setBudget])

  // Синхронизация store -> URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
    if (typeParam) params.set('type', typeParam)
    if (roomsStr) params.set('rooms', roomsStr)
    if (sort && sort !== 'popular') params.set('sort', sort)
    if (aiMode) params.set('ai', 'true')
    router.replace(`/listings${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }, [city, priceMin, priceMax, typeStr, roomsStr, sort, aiMode, router])

  const queryParams = new URLSearchParams()
  if (city) queryParams.set('city', city)
  if (priceMin) queryParams.set('priceMin', priceMin)
  if (priceMax) queryParams.set('priceMax', priceMax)
  if (typeParam) queryParams.set('type', typeParam)
  if (roomsStr) queryParams.set('rooms', roomsStr)
  if (sort && sort !== 'popular') queryParams.set('sort', sort)

  const searchQueryString = queryParams.toString()
  const { data, isLoading } = useFetch<SearchResponse>(
    ['search', city, priceMin, priceMax, typeParam, roomsStr, sort],
    searchQueryString ? `/api/search?${searchQueryString}` : '/api/listings?limit=24',
    { retry: false }
  )

  // AI поиск при включенном AI режиме
  useEffect(() => {
    if (aiMode && (city || priceMin || priceMax || typeStr || roomsStr)) {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      if (priceMin) params.set('priceMin', String(priceMin))
      if (priceMax) params.set('priceMax', String(priceMax))
      if (typeParam) params.set('type', typeParam)
      if (roomsStr) params.set('rooms', roomsStr)
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
  }, [aiMode, city, priceMin, priceMax, typeStr, typeParam, roomsStr])

  useEffect(() => {
    if (aiMode && data?.items && (city || priceMin || priceMax || typeStr || roomsStr)) {
      const userParams: UserParams = {
        city: city || undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        type: typeStr || undefined,
        rooms: Array.isArray(rooms) ? (rooms[0] ?? undefined) : (rooms != null && rooms !== '' ? Number(rooms) : undefined),
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
  }, [aiMode, data, city, priceMin, priceMax, typeStr, rooms, roomsStr])

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
    const scoreNum = typeof aiScore === 'number' ? aiScore : (aiScore as any)?.score ?? listing.score ?? 50
    const badgeList: ('verified' | 'ai' | 'top' | 'new')[] = []
    if (isVerified) badgeList.push('verified')
    if (aiMode && scoreNum >= 60) badgeList.push('ai')
    if (scoreNum >= 75) badgeList.push('top')
    if (isNew) badgeList.push('new')
    const badges = badgeList.slice(0, 2)
    const rentalType = (listing.rentPeriod || listing.rentType || '').toString().toLowerCase().includes('month') ? 'month' : 'night'
    return {
      id: listing.id,
      photo,
      title: cleanTitle,
      price: listing.pricePerNight || listing.basePrice || 0,
      city: listing.city || 'Не указан',
      district,
      metro: listing.metro || listing.metroStation || null,
      rentalType,
      rooms: listing.bedrooms ?? listing.rooms ?? 1,
      area: listing.area ?? 40,
      guests: listing.maxGuests ?? listing.guests ?? null,
      floor: listing.floor ?? null,
      totalFloors: listing.totalFloors ?? null,
      views,
      isNew,
      isVerified,
      score: aiScore,
      verdict: listing.verdict || 'Средний вариант',
      reasons: aiReasons,
      tags: tags.length > 0 ? tags : [],
      aiScore: aiScore,
      aiReasons: aiReasons.length > 0 ? aiReasons : (listing.verdict ? [listing.verdict] : null),
      badges,
      rating: cache?.rating ?? null,
      reviewPercent: cache?.positive_ratio != null ? Math.round(cache.positive_ratio * 100) : null,
      cleanliness: cache?.cleanliness ?? null,
      noise: cache?.noise ?? null,
    }
  })

  // Сортировка (store: popular | price_asc | price_desc)
  const sortedListings = [...listingCards].sort((a, b) => {
    switch (sort) {
      case 'popular': {
        const aS = typeof a.aiScore === 'number' ? a.aiScore : (a.aiScore as any)?.score ?? 0
        const bS = typeof b.aiScore === 'number' ? b.aiScore : (b.aiScore as any)?.score ?? 0
        return bS - aS
      }
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      default:
        return 0
    }
  })

  const handleSearch = () => {
    setFiltersModalOpen(false)
  }
  const handleSmartSearch = () => {
    setQuickAIOpen(true)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="market-container py-6">
        {/* ТЗ-4.2: панель фильтров desktop — одна строка, sticky */}
        <div className="hidden lg:block sticky top-[var(--header-height,56px)] z-10 mb-4">
          <FilterBar onOpenFilters={() => setFiltersModalOpen(true)} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* ТЗ-4.3: mobile — [Поиск] [⚙ Фильтры], высота 40px */}
          <div className="filters-bar lg:hidden flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setFiltersModalOpen(true)}
              className="filters-bar-chip h-10 min-h-[40px] rounded-[10px] px-4 font-medium text-[14px] flex items-center justify-center gap-2 border border-[var(--border)] bg-[var(--color-surface-2)]"
              aria-label="Фильтры"
            >
              <span className="text-[18px]" aria-hidden>⚙</span>
              Фильтры
            </button>
            <button
              type="button"
              onClick={() => setQuickAIOpen(true)}
              className="search-hero-ai-tz7 h-10 min-h-[40px] px-4 rounded-[10px] shrink-0"
            >
              Умный подбор
            </button>
          </div>

          {/* TZ-29: единый FiltersModal для mobile и desktop */}
          <FiltersModal
            open={filtersModalOpen}
            onClose={() => setFiltersModalOpen(false)}
            onApply={handleSearch}
          />

          <QuickAIModal
            open={quickAIOpen}
            onClose={() => setQuickAIOpen(false)}
            city={city ?? ''}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            type={typeStr ?? ''}
            onCityChange={(v) => setCity(v || null)}
            onBudgetChange={setBudget}
            onTypeChange={setType}
            onLaunch={() => {
              setQuickAIOpen(false)
              const params = new URLSearchParams()
              params.set('ai', 'true')
              if (city) params.set('city', city)
              if (priceMin) params.set('priceMin', priceMin)
              if (priceMax) params.set('priceMax', priceMax)
              if (typeStr) params.set('type', typeStr)
              if (roomsStr) params.set('rooms', roomsStr)
              router.push(`/listings?${params.toString()}`)
            }}
          />

          {/* Основной контент */}
          <div className="min-w-0">
            {/* ТЗ-5: при переходе из AI-подбора показываем блок «Мы подобрали жильё под вас» */}
            {aiMode && (
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--color-surface-2)] p-4 mb-6">
                <h2 className="text-[16px] font-semibold text-[var(--text-main)]">
                  Мы подобрали жильё под вас
                </h2>
                <p className="text-[14px] text-[var(--text-secondary)] mt-1">
                  Ниже — варианты по вашим параметрам. Можете изменить фильтры в панели выше.
                </p>
              </div>
            )}
            {/* TZ-29: chips активных фильтров */}
            <ActiveFilterChips className="mb-4" />

            {/* AI панель — если включён Умный подбор */}
            {aiMode && !isLoading && (sortedListings.length > 0 ? (
              <div className="search-tz7-ai-panel rounded-[18px] border border-[var(--border)] p-5 mb-6 bg-[var(--color-surface-2)]">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 search-tz7-icon text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-[16px] font-semibold text-[var(--text-main)]">
                    Подобрано AI
                  </h3>
                </div>
                <p className="text-[14px] text-[var(--text-main)] mb-2">
                  Мы выбрали лучшие варианты по цене, рейтингу и локации
                </p>
                {aiResults && (
                  <p className="text-[13px] text-[var(--text-secondary)]">
                    Почему подходят: {aiResults.reason}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--color-surface-2)] p-4 mb-6">
                <p className="text-[14px] text-[var(--text-main)]">Подбираем варианты под вас…</p>
              </div>
            ))}

            {/* Результаты + сортировка */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                {!isLoading && (
                  <p className="text-[14px] text-[var(--text-secondary)]">
                    Найдено: <span className="font-semibold text-[var(--text-main)]">{sortedListings.length}</span> {sortedListings.length === 1 ? 'вариант' : 'вариантов'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as 'popular' | 'price_asc' | 'price_desc')}
                  className={cn(
                    'search-tz7-select rounded-[14px] px-4 py-2.5 min-h-[40px]',
                    'border border-[var(--border)]',
                    'bg-[var(--color-surface-2)] text-[var(--color-text)] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]',
                    'transition-all cursor-pointer appearance-none'
                  )}
                >
                  <option value="popular">Популярные</option>
                  <option value="price_asc">Дешевле</option>
                  <option value="price_desc">Дороже</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Сетка объявлений — ТЗ №9: gap 12px, mobile 1 col, tablet 2, desktop 3 */}
            {!isLoading && sortedListings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedListings.map((listing, index) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    photo={listing.photo || undefined}
                    title={listing.title}
                    price={listing.price}
                    city={listing.city}
                    district={listing.district || undefined}
                    metro={listing.metro || undefined}
                    rentalType={listing.rentalType}
                    rooms={listing.rooms}
                    area={listing.area}
                    guests={listing.guests ?? undefined}
                    floor={listing.floor ?? undefined}
                    totalFloors={listing.totalFloors ?? undefined}
                    aiReasons={listing.aiReasons}
                    badges={listing.badges}
                    rating={listing.rating}
                    aiRecommendTooltip={aiMode && index === 0 ? 'Лучшее соотношение цена/качество' : undefined}
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
                <div className="w-20 h-20 rounded-full bg-[var(--bg-glass)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold text-[var(--text-main)] mb-2">
                  Пока нет подходящих вариантов
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)]">
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
