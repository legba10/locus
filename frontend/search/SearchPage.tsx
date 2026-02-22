'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { AiSearchModal } from '@/components/ai/AiSearchModal'
import { AiSearchPanel } from '@/components/ai/AiSearchPanel'
import type { AiListingCandidate } from '@/lib/ai/searchEngine'
import { runAiSearch, runManualSearch } from '@/core/search'
import type { FilterState } from '@/core/filters'
import { useSearchStore } from './store'
import { FiltersPanel } from './FiltersPanel'
import { SelectedChips } from '@/filters/SelectedChips'
import { useAiController } from '@/ai/aiController'
import type { SearchFilters } from './store'

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
  const { filters, setFilter, setFilters, toQuery } = useSearchStore()
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
    // run only on first mount and URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="market-container py-4">
        <div className="mb-3 flex items-center gap-2">
          <button type="button" className="lg:hidden rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2.5" onClick={() => setMobileOpen(true)}>
            Фильтры
          </button>
          <div className="inline-flex rounded-[12px] border border-[var(--border-main)] overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setFilter('aiMode', false)
                setPage(1)
              }}
              className={`px-3 py-2 text-[13px] ${!filters.aiMode ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)]'}`}
              title="Обычный поиск по выбранным фильтрам"
            >
              Обычный поиск
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('aiMode', true)
                setPage(1)
              }}
              className={`px-3 py-2 text-[13px] ${filters.aiMode ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)]'}`}
              title="AI-поиск подбирает лучшие варианты по вашим фильтрам"
            >
              AI-поиск
            </button>
          </div>
          <button type="button" onClick={() => setAiModalOpen(true)} className="ml-auto rounded-[12px] bg-[var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-[var(--text-on-accent)]">
            Подобрать за 10 секунд
          </button>
          <button
            type="button"
            onClick={() => aiController.openPanel('search')}
            className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2.5 text-[13px] font-medium text-[var(--text-primary)]"
          >
            AI-подбор
          </button>
        </div>

        <SelectedChips onChange={() => setPage(1)} />

        <div className="flex gap-4">
          <FiltersPanel
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            onApply={applyFiltersAndScroll}
            onQuickApply={() => setPage(1)}
            previewCount={total}
          />

          <div ref={resultsRef} className="min-w-0 flex-1">
            <div className="mb-3 text-[14px] text-[var(--text-secondary)]">Найдено: <span className="font-semibold text-[var(--text-primary)]">{total}</span></div>

            {query.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-8 text-center">
                <h3 className="text-[18px] font-semibold">Нет точных совпадений</h3>
                <p className="mt-1 text-[14px] text-[var(--text-secondary)]">Попробуйте расширить фильтры или включить AI-поиск.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  />
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-[10px] border border-[var(--border-main)] px-4 py-2 disabled:opacity-40">
                Назад
              </button>
              <span className="text-[13px] text-[var(--text-secondary)]">Стр. {page}</span>
              <button type="button" disabled={items.length < 20} onClick={() => setPage((p) => p + 1)} className="rounded-[10px] border border-[var(--border-main)] px-4 py-2 disabled:opacity-40">
                Вперёд
              </button>
            </div>
          </div>
        </div>
      </div>

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
