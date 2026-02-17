'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/shared/utils/cn'
import { useSearchOverlayStore } from '@/core/searchOverlay/searchOverlayStore'
import { parseSearchQuery } from '@/core/searchOverlay/parseQuery'
import { useFilterStore } from '@/core/filters'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { FiltersModal } from '@/components/filters'

function getQuickChips(store: {
  setType: (v: string) => void
  setRooms: (v: string) => void
  setBudget: (a: number | '', b: number | '') => void
  setDuration: (v: string) => void
}) {
  return [
    { id: 'room', label: 'Комната', apply: () => store.setType('room') },
    { id: '1k', label: '1к', apply: () => store.setRooms('1') },
    { id: '2k', label: '2к', apply: () => store.setRooms('2') },
    { id: '50k', label: 'До 50к', apply: () => store.setBudget('', 50000) },
    { id: 'today', label: 'Сегодня', apply: () => store.setDuration('short') },
    { id: 'metro', label: 'Метро', apply: () => {} },
    { id: 'district', label: 'Район', apply: () => {} },
  ]
}

interface SearchResponse {
  items?: any[]
  total?: number
}

function mapListingToCard(listing: any) {
  const rawPhoto =
    listing.images?.[0]?.url ?? listing.photos?.[0]?.url ?? listing.photo ?? listing.photoUrl ?? null
  const photo = typeof rawPhoto === 'string' ? rawPhoto : rawPhoto?.url ?? null
  const price = listing.pricePerNight ?? listing.basePrice ?? 0
  const title = listing.title || `Жильё ${listing.city || ''}`.trim() || 'Без названия'
  return {
    id: listing.id,
    photo: photo || undefined,
    title,
    price,
    city: listing.city ?? 'Не указан',
    district: listing.district ?? undefined,
    metro: listing.metro ?? listing.metroStation ?? undefined,
    rentalType: (listing.rentPeriod || listing.rentType || '').toString().toLowerCase().includes('month') ? 'month' : 'night',
    rooms: listing.bedrooms ?? listing.rooms ?? 1,
    area: listing.area ?? undefined,
    badges: listing.badges ?? [],
  }
}

export function SearchOverlay() {
  const isOpen = useSearchOverlayStore((s) => s.isOpen)
  const close = useSearchOverlayStore((s) => s.close)
  const initialQuery = useSearchOverlayStore((s) => s.initialQuery)
  const clearInitialQuery = useSearchOverlayStore((s) => s.clearInitialQuery)
  const {
    city,
    priceFrom,
    priceTo,
    type,
    rooms,
    setCity,
    setBudget,
    setType,
    setRooms,
    setDuration,
    getBudgetQuery,
    sort,
  } = useFilterStore()

  const [query, setQuery] = useState('')
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const touchStartY = useRef(0)

  const priceMin = getBudgetQuery().priceMin
  const priceMax = getBudgetQuery().priceMax
  const typeStr = Array.isArray(type) ? type[0] : type ?? ''
  const roomsStr = Array.isArray(rooms) ? rooms.join(',') : (rooms != null && rooms !== '' ? String(rooms) : '')

  // Debounce query 300ms
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('')
      return
    }
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // Apply parsed query to filter store
  useEffect(() => {
    if (!debouncedQuery) return
    const parsed = parseSearchQuery(debouncedQuery)
    if (parsed.city) setCity(parsed.city)
    if (parsed.type) setType(parsed.type)
    if (parsed.rooms != null) setRooms(String(parsed.rooms))
    if (parsed.priceMin != null || parsed.priceMax != null) {
      setBudget(parsed.priceMin ?? '', parsed.priceMax ?? '')
    }
  }, [debouncedQuery, setCity, setType, setRooms, setBudget])

  const queryParams = new URLSearchParams()
  queryParams.set('limit', '24')
  if (city) queryParams.set('city', city)
  if (priceMin) queryParams.set('priceMin', priceMin)
  if (priceMax) queryParams.set('priceMax', priceMax)
  if (typeStr) queryParams.set('type', typeStr.toUpperCase())
  if (roomsStr) queryParams.set('rooms', roomsStr)
  if (sort && sort !== 'popular') queryParams.set('sort', sort)

  const { data, isLoading } = useFetch<SearchResponse>(
    ['search-overlay', city, priceMin, priceMax, typeStr, roomsStr, sort],
    `/api/search?${queryParams.toString()}`,
    { enabled: isOpen }
  )

  const items = (data?.items ?? []).map(mapListingToCard)

  useEffect(() => {
    if (!isOpen) return
    if (initialQuery) {
      setQuery(initialQuery)
      clearInitialQuery()
    }
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close, initialQuery, clearInitialQuery])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dy = e.changedTouches[0].clientY - touchStartY.current
      if (dy > 80) close()
    },
    [close]
  )

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex flex-col bg-[var(--bg-main)]"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Поиск"
      >
        {/* Верх: поле + крестик */}
        <div className="flex items-center gap-2 shrink-0 p-3 border-b border-[var(--border)]">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Район, метро, 1-комнатная, сегодня…"
            className="flex-1 min-w-0 h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-[15px]"
            aria-label="Поиск"
          />
          <button
            type="button"
            onClick={close}
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-glass)]"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Чипсы */}
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-[var(--border)] shrink-0">
          {getQuickChips({ setType, setRooms, setBudget, setDuration }).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => chip.apply()}
              className={cn(
                'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                'border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--bg-glass)]'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Кнопка открыть все фильтры */}
        <div className="shrink-0 px-3 py-2">
          <button
            type="button"
            onClick={() => setFiltersModalOpen(true)}
            className="w-full rounded-xl border border-[var(--border)] py-2.5 text-[14px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-glass)]"
          >
            Открыть все фильтры
          </button>
        </div>

        {/* Результаты */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          )}
          {!isLoading && items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" onClick={() => close()}>
              {items.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photo}
                  title={listing.title}
                  price={listing.price}
                  city={listing.city}
                  district={listing.district}
                  metro={listing.metro}
                  rentalType={listing.rentalType}
                  rooms={listing.rooms}
                  area={listing.area}
                  badges={listing.badges}
                />
              ))}
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[var(--text-secondary)] text-[15px]">Нет подходящих объявлений</p>
              <p className="text-[var(--text-muted)] text-[13px] mt-1">Измените запрос или фильтры</p>
            </div>
          )}
        </div>
      </div>

      <FiltersModal open={filtersModalOpen} onClose={() => setFiltersModalOpen(false)} onApply={() => setFiltersModalOpen(false)} />
    </>
  )
}
