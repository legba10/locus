'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ListingCard, ListingCardSkeleton } from '@/domains/listing/ListingCard'
import { buildListingsQuery, type ListingsResponse } from '@/domains/listing/listing-api'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { CityInput } from '@/shared/components/CityInput'
import Loader from '@/components/lottie/Loader'
import SearchIcon from '@/components/lottie/SearchIcon'
import ErrorAnim from '@/components/lottie/ErrorAnim'

// Filter sidebar
function FilterSidebar({ 
  filters, 
  onFiltersChange 
}: { 
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void 
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-5">
      <h3 className="font-semibold text-text mb-4">Фильтры</h3>
      
      {/* City */}
      <div className="mb-4">
        <label className="block text-sm text-text-mut mb-2">Город</label>
        <CityInput
          value={filters.city || ''}
          onChange={(value) => onFiltersChange({ ...filters, city: value || undefined })}
          placeholder="Все города"
          className="w-full rounded-lg border border-border bg-surface-3 px-3 py-2 text-sm text-text"
        />
      </div>

      {/* Price range */}
      <div className="mb-4">
        <label className="block text-sm text-text-mut mb-2">Цена за ночь</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="от"
            value={filters.priceMin || ''}
            onChange={(e) => onFiltersChange({ ...filters, priceMin: Number(e.target.value) || undefined })}
            className="w-full rounded-lg border border-border bg-surface-3 px-3 py-2 text-sm text-text"
          />
          <input
            type="number"
            placeholder="до"
            value={filters.priceMax || ''}
            onChange={(e) => onFiltersChange({ ...filters, priceMax: Number(e.target.value) || undefined })}
            className="w-full rounded-lg border border-border bg-surface-3 px-3 py-2 text-sm text-text"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="mb-4">
        <label className="block text-sm text-text-mut mb-2">Гостей</label>
        <select
          value={filters.guests || ''}
          onChange={(e) => onFiltersChange({ ...filters, guests: Number(e.target.value) || undefined })}
          className="w-full rounded-lg border border-border bg-surface-3 px-3 py-2 text-sm text-text"
        >
          <option value="">Любое</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>

      {/* AI Search toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.aiEnabled || false}
            onChange={(e) => onFiltersChange({ ...filters, aiEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-border bg-surface-3 text-brand focus:ring-brand"
          />
          <span className="text-sm text-text">AI-ранжирование</span>
        </label>
        <p className="mt-1 text-xs text-text-dim">Результаты сортируются по AI-оценке</p>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label className="block text-sm text-text-mut mb-2">Сортировка</label>
        <select
          value={filters.sort || 'relevance'}
          onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as any })}
          className="w-full rounded-lg border border-border bg-surface-3 px-3 py-2 text-sm text-text"
        >
          <option value="relevance">По релевантности</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
          <option value="rating">По рейтингу</option>
          <option value="ai_score">По AI-оценке</option>
        </select>
      </div>

      {/* Reset button */}
      <button
        onClick={() => onFiltersChange({})}
        className="w-full rounded-lg border border-border py-2 text-sm text-text-mut hover:bg-white/10 hover:text-text transition"
      >
        Сбросить фильтры
      </button>
    </div>
  )
}

// Search header with query
function SearchHeader({ query, resultsCount, isAiSearch }: { query?: string; resultsCount: number; isAiSearch: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-5">
      <div className="flex items-center justify-between">
        <div>
          {query ? (
            <>
              <h1 className="text-xl font-bold text-text">
                Результаты поиска: &ldquo;{query}&rdquo;
              </h1>
              {isAiSearch && (
                <p className="mt-1 flex items-center gap-2 text-sm text-brand">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI понял ваш запрос и подобрал лучшие варианты
                </p>
              )}
            </>
          ) : (
            <h1 className="text-xl font-bold text-text">Все объявления</h1>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand">{resultsCount}</p>
          <p className="text-sm text-text-mut">найдено</p>
        </div>
      </div>
    </div>
  )
}

// Quick search input
function QuickSearchInput({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Поиск: город, тип жилья или описание..."
            className="w-full rounded-xl border border-border bg-surface-3 py-3 pl-10 pr-4 text-text placeholder:text-text-dim focus:border-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand px-6 py-3 font-medium text-white hover:bg-brand/90 transition flex items-center gap-2"
        >
          <SearchIcon />
          Найти
        </button>
      </form>
    </div>
  )
}

interface SearchFilters {
  city?: string
  priceMin?: number
  priceMax?: number
  guests?: number
  q?: string
  aiEnabled?: boolean
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'ai_score'
}

export function SearchPageClient() {
  const router = useRouter()
  const sp = useSearchParams()
  
  // Parse filters from URL
  const [filters, setFilters] = useState<SearchFilters>({
    city: sp.get('city') ?? undefined,
    priceMin: sp.get('priceMin') ? Number(sp.get('priceMin')) : undefined,
    priceMax: sp.get('priceMax') ? Number(sp.get('priceMax')) : undefined,
    guests: sp.get('guests') ? Number(sp.get('guests')) : undefined,
    q: sp.get('q') ?? undefined,
    aiEnabled: sp.get('ai') === '1',
    sort: (sp.get('sort') as SearchFilters['sort']) || 'relevance',
  })
  
  const [searchQuery, setSearchQuery] = useState(filters.q || '')

  // Build query string
  const qs = buildListingsQuery({
    city: filters.city,
    priceMax: filters.priceMax,
    guests: filters.guests,
    q: filters.q,
  })
  
  // Fetch listings
  const { data, isLoading, error } = useFetch<ListingsResponse>(
    ['listings', JSON.stringify(filters)],
    `/api/listings${qs ? `?${qs}` : ''}`,
  )

  // Update URL when filters change
  const updateFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    const params = new URLSearchParams()
    if (newFilters.city) params.set('city', newFilters.city)
    if (newFilters.priceMin) params.set('priceMin', String(newFilters.priceMin))
    if (newFilters.priceMax) params.set('priceMax', String(newFilters.priceMax))
    if (newFilters.guests) params.set('guests', String(newFilters.guests))
    if (newFilters.q) params.set('q', newFilters.q)
    if (newFilters.aiEnabled) params.set('ai', '1')
    if (newFilters.sort && newFilters.sort !== 'relevance') params.set('sort', newFilters.sort)
    router.push(`/search?${params.toString()}`)
  }

  const handleSearch = () => {
    updateFilters({ ...filters, q: searchQuery, aiEnabled: searchQuery.length > 3 })
  }

  // Sort results
  let sortedItems = [...(data?.items ?? [])]
  if (filters.sort === 'price_asc') {
    sortedItems.sort((a, b) => a.pricePerNight - b.pricePerNight)
  } else if (filters.sort === 'price_desc') {
    sortedItems.sort((a, b) => b.pricePerNight - a.pricePerNight)
  } else if (filters.sort === 'rating') {
    sortedItems.sort((a, b) => b.rating - a.rating)
  } else if (filters.sort === 'ai_score') {
    sortedItems.sort((a, b) => (b.aiScores?.qualityScore ?? 0) - (a.aiScores?.qualityScore ?? 0))
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-mut">
        <Link href="/" className="hover:text-text">Главная</Link>
        <span>/</span>
        <span className="text-text">Поиск</span>
        {filters.city && (
          <>
            <span>/</span>
            <span className="text-text">{filters.city}</span>
          </>
        )}
      </nav>

      {/* Search input */}
      <QuickSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearch}
      />

      {/* Search header */}
      <SearchHeader
        query={filters.q || filters.city}
        resultsCount={sortedItems.length}
        isAiSearch={filters.aiEnabled || false}
      />

      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <FilterSidebar filters={filters} onFiltersChange={updateFilters} />
        </aside>

        {/* Results */}
        <main>
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader size={36} />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <div className="mx-auto w-fit">
                <ErrorAnim size={80} loop />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-red-300">Ошибка загрузки</h3>
              <p className="mt-2 text-sm text-red-200/70">Убедитесь, что backend запущен</p>
            </div>
          )}

          {!isLoading && !error && sortedItems.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
              <div className="mx-auto w-fit">
                <ErrorAnim size={80} loop />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text">Ничего не найдено</h3>
              <p className="mt-2 text-text-mut">Попробуйте изменить параметры поиска</p>
              <button
                onClick={() => updateFilters({})}
                className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand/90"
              >
                Сбросить фильтры
              </button>
            </div>
          )}

          {!isLoading && !error && sortedItems.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {sortedItems.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

