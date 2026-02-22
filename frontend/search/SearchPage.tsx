'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { AiSearchModal } from '@/components/ai/AiSearchModal'
import { AiSearchPanel } from '@/components/ai/AiSearchPanel'
import type { AiListingCandidate } from '@/lib/ai/searchEngine'
import { runAiSearch, runManualSearch } from '@/core/search'
import type { FilterState } from '@/core/filters'
import { useSearchStore } from './searchStore'
import { FiltersPanel } from './FiltersPanel'
import { ActiveFiltersBar } from './ActiveFiltersBar'
import { useAiController } from '@/ai/aiController'

function mapStoreToFilterState(s: ReturnType<typeof useSearchStore.getState>): FilterState {
  const types = s.type ? [s.type] : []
  const rooms = s.rooms != null ? [s.rooms] : []
  return {
    city: s.city,
    priceFrom: s.priceMin,
    priceTo: s.priceMax,
    rooms,
    type: types,
    radius: 5000,
    sort: 'popular',
    budgetMin: s.priceMin ?? '',
    budgetMax: s.priceMax ?? '',
    duration: s.duration ?? '',
    aiMode: s.aiMode,
  }
}

export function SearchPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const s = useSearchStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const aiController = useAiController()
  const [aiScores, setAiScores] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    const city = sp.get('city')
    const priceMin = sp.get('priceMin')
    const priceMax = sp.get('priceMax')
    const rooms = sp.get('rooms')
    const type = sp.get('type')
    const ai = sp.get('ai')
    s.setMany({
      city: city || s.city,
      priceMin: priceMin ? Number(priceMin) : s.priceMin,
      priceMax: priceMax ? Number(priceMax) : s.priceMax,
      rooms: rooms ? Number(rooms) : s.rooms,
      type: type || s.type,
      aiMode: ai === '1' ? true : s.aiMode,
    })
    // run only on first mount and URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        city: s.city,
        priceMin: s.priceMin,
        priceMax: s.priceMax,
        rooms: s.rooms,
        type: s.type,
        pets: s.pets,
        furniture: s.furniture,
        district: s.district,
        metro: s.metro,
        aiMode: s.aiMode,
        page,
      }),
    [s.city, s.priceMin, s.priceMax, s.rooms, s.type, s.pets, s.furniture, s.district, s.metro, s.aiMode, page]
  )

  const query = useQuery({
    queryKey: ['search-v466', queryKey],
    queryFn: () => {
      const filters = mapStoreToFilterState(useSearchStore.getState())
      return filters.aiMode ? runAiSearch(filters, page) : runManualSearch(filters, page)
    },
    staleTime: 60_000,
  })

  const items = query.data?.items ?? []
  const total = query.data?.total ?? items.length

  useEffect(() => {
    const params = s.toQuery()
    params.set('page', String(page))
    router.replace(`/listings?${params.toString()}`, { scroll: false })
  }, [s, page, router, s.city, s.priceMin, s.priceMax, s.rooms, s.type, s.pets, s.furniture, s.duration, s.dates, s.aiMode, s.district, s.metro])

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
                s.setField('aiMode', false)
                setPage(1)
              }}
              className={`px-3 py-2 text-[13px] ${!s.aiMode ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)]'}`}
              title="Обычный поиск по выбранным фильтрам"
            >
              Обычный поиск
            </button>
            <button
              type="button"
              onClick={() => {
                s.setField('aiMode', true)
                setPage(1)
              }}
              className={`px-3 py-2 text-[13px] ${s.aiMode ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)]'}`}
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

        <ActiveFiltersBar onChange={() => setPage(1)} />

        <div className="flex gap-4">
          <FiltersPanel
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            onApply={() => {
              setPage(1)
              setMobileOpen(false)
            }}
            previewCount={total}
          />

          <div className="min-w-0 flex-1">
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
          city: s.city ?? undefined,
          budgetMin: s.priceMin ?? undefined,
          budgetMax: s.priceMax ?? undefined,
          rooms: s.rooms ?? undefined,
        }}
        onApply={({ parsed, items: aiItems }) => {
          s.setMany({
            aiMode: true,
            city: parsed.city || null,
            priceMin: parsed.budgetMin ?? null,
            priceMax: parsed.budgetMax ?? null,
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
          s.setMany(patch)
          setPage(1)
        }}
      />
    </div>
  )
}
