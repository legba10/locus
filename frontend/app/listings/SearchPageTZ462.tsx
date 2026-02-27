'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { AiSearchModal } from '@/components/ai/AiSearchModal'
import type { AiListingCandidate } from '@/lib/ai/searchEngine'
import { useAuthStore } from '@/domains/auth'
import { useFilterStore } from '@/core/filters'
import { ActiveFilterChips, FiltersModal } from '@/components/filters'
import { FilterBar } from '@/components/search/FilterBar'
import { applyAutoExpand, runAiSearch, runManualSearch } from '@/core/search'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchResponse {
  items: any[]
  total: number
  page: number
  limit: number
}


export function SearchPageTZ462() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useRef(false)
  const { user } = useAuthStore()
  const canUseAi = user?.role !== 'landlord'
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [aiMatchMap, setAiMatchMap] = useState<Map<string, number>>(new Map())

  const store = useFilterStore()
  const {
    city,
    priceFrom,
    priceTo,
    rooms,
    type,
    radius,
    duration,
    sort,
    aiMode,
    setCity,
    setPrice,
    setRooms,
    setTypeList,
    setRadius,
    setDuration,
    setSort,
    setAiMode,
  } = store

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    const urlCity = searchParams.get('city') || ''
    const urlPriceMin = searchParams.get('priceMin')
    const urlPriceMax = searchParams.get('priceMax')
    const urlTypes = searchParams.get('types') || ''
    const urlRooms = searchParams.get('rooms') || ''
    const urlRadiusKm = Number(searchParams.get('radiusKm') || 0)
    const urlDuration = searchParams.get('duration') || ''
    const urlSort = searchParams.get('sort') as 'popular' | 'newest' | 'price_asc' | 'price_desc' | null
    const urlAi = searchParams.get('ai') === 'true'
    const urlPage = Number(searchParams.get('page') || 1)

    if (urlCity) setCity(urlCity)
    setPrice(urlPriceMin ? Number(urlPriceMin) : null, urlPriceMax ? Number(urlPriceMax) : null)
    if (urlTypes) setTypeList(urlTypes.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean))
    if (urlRooms) setRooms(urlRooms)
    if (urlRadiusKm > 0) setRadius(urlRadiusKm * 1000)
    if (urlDuration) setDuration(urlDuration)
    if (urlSort) setSort(urlSort)
    setAiMode(urlAi)
    if (urlPage > 0) setPage(urlPage)
  }, [searchParams, setCity, setPrice, setTypeList, setRooms, setRadius, setDuration, setSort, setAiMode])

  const filtersSignature = useMemo(
    () => JSON.stringify({ city, priceFrom, priceTo, rooms, type, radius, duration, sort, aiMode, page }),
    [city, priceFrom, priceTo, rooms, type, radius, duration, sort, aiMode, page]
  )
  const debouncedSignature = useDebounce(filtersSignature, 400)

  const query = useQuery<SearchResponse>({
    queryKey: ['search-v46-2', debouncedSignature],
    queryFn: async () => {
      const current = useFilterStore.getState()
      return current.aiMode ? runAiSearch(current, page) : runManualSearch(current, page)
    },
    staleTime: 60_000,
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 20))

  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (priceFrom != null) params.set('priceMin', String(priceFrom))
    if (priceTo != null) params.set('priceMax', String(priceTo))
    if (type.length) params.set('types', type.map((x) => x.toUpperCase()).join(','))
    if (rooms.length) params.set('rooms', String(Math.max(...rooms)))
    if (radius > 0) params.set('radiusKm', String(Math.round(radius / 1000)))
    if (duration) params.set('duration', duration)
    params.set('sort', sort)
    params.set('ai', aiMode ? 'true' : 'false')
    params.set('page', String(page))
    router.replace(`/listings?${params.toString()}`, { scroll: false })
  }, [city, priceFrom, priceTo, type, rooms, radius, duration, sort, aiMode, page, router])

  const listingCards = (query.data?.items ?? []).map((listing: any) => {
    const rawPhoto = listing.photos?.[0]?.url || listing.images?.[0]?.url || listing.photo || null
    const photo = typeof rawPhoto === 'string' ? rawPhoto : rawPhoto?.url || null
    const score = Number(listing.score ?? listing.aiScore ?? 0)
    return {
      id: listing.id,
      photo,
      title: listing.title || 'Без названия',
      price: listing.basePrice || listing.pricePerNight || 0,
      city: listing.city || 'Не указан',
      district: listing.district || null,
      rooms: listing.bedrooms ?? 1,
      area: listing.area ?? 40,
      rating: listing.ratingCache?.rating ?? null,
      aiScore: score,
      badges: score >= 70 ? (['ai'] as ('ai')[]) : [],
    }
  })

  const aiModalListings: AiListingCandidate[] = (query.data?.items ?? []).map((listing: any) => ({
    id: String(listing.id),
    city: listing.city || undefined,
    district: listing.district || undefined,
    title: listing.title || undefined,
    description: listing.description || undefined,
    price: Number(listing.basePrice || listing.pricePerNight || 0),
    rooms: Number(listing.bedrooms ?? 0),
    rating: Number(listing.ratingCache?.rating ?? listing.rating ?? 0),
    responseRate: Number(listing.responseRate ?? 0),
  }))

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="market-container py-6">
        <div className="hidden lg:block sticky top-[var(--header-height,56px)] z-10 mb-4">
          <FilterBar onOpenFilters={() => setFiltersModalOpen(true)} />
        </div>

        <div className="filters-bar lg:hidden flex items-center gap-3 mb-4">
          <button type="button" onClick={() => setFiltersModalOpen(true)} className="h-10 rounded-[10px] px-4 border border-[var(--border)] bg-[var(--color-surface-2)]">
            Фильтры
          </button>
          {canUseAi && (
            <button type="button" onClick={() => setAiModalOpen(true)} className="h-10 rounded-[10px] px-4 bg-[var(--accent)] text-[var(--text-on-accent)]">
              AI-подбор
            </button>
          )}
        </div>

        <FiltersModal
          open={filtersModalOpen}
          onClose={() => setFiltersModalOpen(false)}
          onApply={() => {
            setPage(1)
            setFiltersModalOpen(false)
          }}
          previewCount={total}
        />

        <AiSearchModal
          open={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          listings={aiModalListings}
          defaults={{
            city: city ?? undefined,
            budgetMin: priceFrom ?? undefined,
            budgetMax: priceTo ?? undefined,
            rooms: rooms.length ? Math.max(...rooms) : undefined,
          }}
          onApply={({ parsed, items }) => {
            setAiMode(true)
            setPage(1)
            setCity(parsed.city || null)
            setPrice(parsed.budgetMin ?? null, parsed.budgetMax ?? null)
            setRooms(parsed.rooms ? String(parsed.rooms) : '')
            setAiMatchMap(new Map(items.map((x) => [String(x.id), x.aiMatchScore])))
            setAiModalOpen(false)
          }}
        />

        <ActiveFilterChips className="mb-4" />

        <div className="mb-6 flex items-center justify-between">
          <p className="text-[14px] text-[var(--text-secondary)]">
            Найдено: <span className="font-semibold text-[var(--text-main)]">{total}</span> вариантов
          </p>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as any)
              setPage(1)
            }}
            className="rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] h-10 px-3"
          >
            <option value="popular">Популярные</option>
            <option value="newest">Новые</option>
            <option value="price_asc">Дешевле</option>
            <option value="price_desc">Дороже</option>
          </select>
        </div>

        {query.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        )}

        {!query.isLoading && listingCards.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listingCards.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photo || undefined}
                  title={listing.title}
                  price={listing.price}
                  city={listing.city}
                  district={listing.district || undefined}
                  rooms={listing.rooms}
                  area={listing.area}
                  rating={listing.rating}
                  aiMatchScore={aiMatchMap.get(String(listing.id)) ?? (aiMode ? listing.aiScore : undefined)}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-10 px-4 rounded-[10px] border border-[var(--border)] disabled:opacity-40">Назад</button>
              <span className="text-[14px] text-[var(--text-secondary)]">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="h-10 px-4 rounded-[10px] border border-[var(--border)] disabled:opacity-40">Вперед</button>
            </div>
          </>
        )}

        {!query.isLoading && listingCards.length === 0 && (
          <div className="text-center py-16 rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)]">
            <h3 className="text-[18px] font-semibold text-[var(--text-main)] mb-2">Нет точных совпадений.</h3>
            <p className="text-[14px] text-[var(--text-secondary)]">Попробовать: расширить радиус, увеличить бюджет, убрать тип жилья.</p>
            <button
              type="button"
              onClick={() => {
                const next = applyAutoExpand(useFilterStore.getState())
                setPrice(next.priceFrom, next.priceTo)
                setRadius(next.radius)
                setPage(1)
              }}
              className="mt-4 h-10 px-4 rounded-[10px] bg-[var(--accent)] text-[var(--text-on-accent)]"
            >
              Расширить поиск автоматически
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
