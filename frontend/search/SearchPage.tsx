'use client'

/** TZ-54: Экран поиска — Container, SearchModeToggle, SearchControls, ResultsGrid, EmptyState, Pagination, floating AI. */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { AiSearchModal } from '@/components/ai/AiSearchModal'
import { AiSearchPanel } from '@/components/ai/AiSearchPanel'
import { Container } from '@/components/ui'
import type { AiListingCandidate } from '@/lib/ai/searchEngine'
import { runAiSearch, runManualSearch } from '@/core/search'
import type { FilterState } from '@/core/filters'
import { useSearchStore } from './store'
import { FiltersPanel } from './FiltersPanel'
import { SelectedChips } from '@/filters/SelectedChips'
import { useAiController } from '@/ai/aiController'
import { cn } from '@/shared/utils/cn'
import type { SearchFilters } from './store'
import { Sparkles } from 'lucide-react'

function mapStoreToFilterState(filters: SearchFilters): FilterState {
  const types = filters.type ? [filters.type] : []
  const rooms = filters.rooms != null ? [filters.rooms] : []
  return {
    city: filters.city,
    priceFrom: filters.priceFrom,
    priceTo: filters.priceTo,
    rooms,
    type: types,
    radius: 5000,
    sort: 'popular',
    budgetMin: filters.priceFrom ?? '',
    budgetMax: filters.priceTo ?? '',
    duration: filters.rentType ?? '',
    aiMode: filters.aiMode,
  }
}

export function SearchPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const { filters, setFilter, setFilters, toQuery, reset } = useSearchStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const aiController = useAiController()
  const [aiScores, setAiScores] = useState<Map<string, number>>(new Map())
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const city = sp.get('city')
    const priceMin = sp.get('priceMin')
    const priceMax = sp.get('priceMax')
    const rooms = sp.get('rooms')
    const type = sp.get('type')
    const ai = sp.get('ai')
    setFilters({
      city: city || filters.city,
      priceFrom: priceMin ? Number(priceMin) : filters.priceFrom,
      priceTo: priceMax ? Number(priceMax) : filters.priceTo,
      rooms: rooms ? Number(rooms) : filters.rooms,
      type: type || filters.type,
      aiMode: ai === '1' ? true : filters.aiMode,
    })
  }, [sp])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedFilters(filters), 300)
    return () => window.clearTimeout(t)
  }, [filters])

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        city: debouncedFilters.city,
        priceFrom: debouncedFilters.priceFrom,
        priceTo: debouncedFilters.priceTo,
        rooms: debouncedFilters.rooms,
        type: debouncedFilters.type,
        pets: debouncedFilters.pets,
        furniture: debouncedFilters.furniture,
        district: debouncedFilters.district,
        metro: debouncedFilters.metro,
        rentType: debouncedFilters.rentType,
        guests: debouncedFilters.guests,
        aiMode: debouncedFilters.aiMode,
        page,
      }),
    [debouncedFilters, page]
  )

  const query = useQuery({
    queryKey: ['search-v466', queryKey],
    queryFn: () => {
      const current = mapStoreToFilterState(debouncedFilters)
      return current.aiMode ? runAiSearch(current, page) : runManualSearch(current, page)
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const items = query.data?.items ?? []
  const total = query.data?.total ?? items.length

  useEffect(() => {
    const params = toQuery()
    params.set('page', String(page))
    router.replace(`/listings?${params.toString()}`, { scroll: false })
  }, [toQuery, page, router, filters])

  const applyFiltersAndScroll = () => {
    setPage(1)
    setMobileOpen(false)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasAiConflicts = (patch: Partial<SearchFilters>) => {
    if (patch.city && filters.city && patch.city !== filters.city) return true
    if (patch.priceTo != null && filters.priceTo != null && patch.priceTo !== filters.priceTo) return true
    if (patch.rooms != null && filters.rooms != null && patch.rooms !== filters.rooms) return true
    if (patch.rentType && filters.rentType && patch.rentType !== filters.rentType) return true
    if (patch.type && filters.type && patch.type !== filters.type) return true
    return false
  }

  const aiModalListings: AiListingCandidate[] = items.map((listing: any) => ({
    id: String(listing.id),
    city: listing.city ?? '',
    district: listing.district ?? '',
    title: listing.title ?? '',
    description: listing.description ?? '',
    price: Number(listing.basePrice ?? 0),
    rooms: Number(listing.bedrooms ?? 0),
    rating: Number(listing.ratingCache?.rating ?? 0),
    responseRate: Number(listing.responseRate ?? 0),
  }))

  const handleResetFilters = () => {
    reset()
    setPage(1)
  }

  return (
    <div className="search-page-content min-h-screen bg-[var(--bg-primary)]">
      <Container className="py-4">
        {/* 1. Переключатель режима Обычный / AI */}
        <div className="search-mode" role="group" aria-label="Режим поиска">
          <button
            type="button"
            className={cn(!filters.aiMode && 'active')}
            onClick={() => { setFilter('aiMode', false); setPage(1) }}
            title="Обычный поиск по фильтрам"
          >
            Обычный
          </button>
          <button
            type="button"
            className={cn(filters.aiMode && 'active')}
            onClick={() => { setFilter('aiMode', true); setPage(1) }}
            title="AI подбирает лучшие варианты"
          >
            AI-подбор
          </button>
        </div>

        {/* 2. Блок управления */}
        <div className="search-controls">
          <button
            type="button"
            className="search-controls__filters"
            onClick={() => setMobileOpen(true)}
          >
            Фильтры
          </button>
          <button
            type="button"
            className="search-controls__primary"
            onClick={() => setAiModalOpen(true)}
          >
            Подобрать за 10 секунд
          </button>
        </div>

        {/* Чипы выбранных фильтров */}
        <div className="search-filters-chips">
          <SelectedChips onChange={() => setPage(1)} />
        </div>

        <FiltersPanel
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onApply={applyFiltersAndScroll}
          onQuickApply={() => setPage(1)}
          previewCount={total}
        />

        <div ref={resultsRef}>
          {/* 3. Результаты */}
          <div className="text-[14px] text-[var(--text-secondary)] mt-4">
            Найдено: <span className="font-semibold text-[var(--text-primary)]">{total}</span>
          </div>

          {query.isLoading ? (
            <div className="results-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state mt-4">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto text-[var(--text-muted)]" aria-hidden>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-[16px] font-medium text-[var(--text-primary)] mt-4">По данным фильтрам ничего не найдено</p>
              <button type="button" className="empty-state__btn" onClick={handleResetFilters}>
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="results-grid">
              {items.map((listing: any) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photos?.[0]?.url}
                  title={listing.title}
                  price={listing.basePrice}
                  city={listing.city}
                  district={listing.district || undefined}
                  rooms={listing.bedrooms}
                  area={listing.area ?? 0}
                  rating={listing.ratingCache?.rating ?? null}
                  aiMatchScore={aiScores.get(String(listing.id))}
                  className="listing-card"
                />
              ))}
            </div>
          )}

          {/* 4. Пагинация */}
          {items.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Предыдущая страница"
              >
                Назад
              </button>
              <span className="pagination__page">Стр. {page}</span>
              <button
                type="button"
                disabled={items.length < 20}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Следующая страница"
              >
                Вперёд
              </button>
            </div>
          )}
        </div>
      </Container>

      {/* Floating AI-помощник */}
      <button
        type="button"
        className="ai-helper"
        onClick={() => aiController.openPanel('search')}
        aria-label="Открыть AI-подбор"
      >
        <Sparkles className="w-6 h-6" strokeWidth={1.8} />
      </button>

      <AiSearchModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        listings={aiModalListings}
        defaults={{
          city: filters.city ?? undefined,
          budgetMin: filters.priceFrom ?? undefined,
          budgetMax: filters.priceTo ?? undefined,
          rooms: filters.rooms ?? undefined,
        }}
        onApply={({ parsed, items: aiItems }) => {
          setFilters({
            aiMode: true,
            city: parsed.city || null,
            priceFrom: parsed.budgetMin ?? null,
            priceTo: parsed.budgetMax ?? null,
            rooms: parsed.rooms ?? null,
          })
          setAiScores(new Map(aiItems.map((x) => [String(x.id), x.aiMatchScore])))
          setAiModalOpen(false)
          setPage(1)
        }}
      />

      <AiSearchPanel
        open={aiController.open && aiController.mode === 'search'}
        onClose={aiController.closePanel}
        onApply={(patch) => {
          const aiPatch = patch.filters ?? {}
          if (hasAiConflicts(aiPatch)) {
            const confirmed = window.confirm('AI предлагает изменить уже выбранные фильтры. Применить изменения?')
            if (!confirmed) return
          }
          setFilters(aiPatch)
          setPage(1)
        }}
      />
    </div>
  )
}
