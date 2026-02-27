'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { runManualSearch } from '@/core/search/searchController'
import { runAiSearch } from '@/core/search/aiSearchController'
import type { FilterState } from '@/core/filters'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import type { Filters, SearchMode } from './search.types'
import styles from './search.module.css'
import SearchBar from './SearchBar'
import ActiveFilters from './ActiveFilters'
import FilterDrawer from './FilterDrawer'
import FilterForm from './FilterForm'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    setIsMobile(mq.matches)
    const fn = () => setIsMobile(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return isMobile
}

function filtersToFilterState(filters: Filters, mode: SearchMode): FilterState {
  const rooms = filters.rooms != null ? [filters.rooms] : []
  const duration = filters.rentType === 'monthly' ? 'long' : filters.rentType ?? ''
  return {
    city: filters.city ?? null,
    priceFrom: filters.priceMin ?? null,
    priceTo: filters.priceMax ?? null,
    rooms,
    type: [],
    radius: 2000,
    sort: 'popular',
    budgetMin: filters.priceMin ?? '',
    budgetMax: filters.priceMax ?? '',
    duration,
    aiMode: mode === 'ai',
  }
}

export default function SearchPage() {
  const isMobile = useIsMobile()
  const sidebarRef = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({})
  const [mode, setMode] = useState<SearchMode>('normal')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)

  const handleOpenFilters = useCallback(() => {
    if (isMobile) setDrawerOpen(true)
    else sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [isMobile])

  const filterState = useMemo(() => filtersToFilterState(filters, mode), [filters, mode])
  const queryKey = useMemo(
    () => ['search-tz80', JSON.stringify(filterState), page],
    [filterState, page]
  )

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      mode === 'ai'
        ? runAiSearch(filterState, page)
        : runManualSearch(filterState, page),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const items = data?.items ?? []
  const total = data?.total ?? items.length

  const handleFiltersChange = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }, [])

  const handleRemoveFilter = useCallback((key: keyof Filters) => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPage(1)
  }, [])

  const handleApplyFilters = useCallback(() => {
    setPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters({})
    setPage(1)
  }, [])

  return (
    <div className={styles.searchWrapper}>
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        mode={mode}
        onModeChange={(m) => {
          setMode(m)
          setPage(1)
        }}
        onOpenFilters={handleOpenFilters}
      />

      <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />

      <aside ref={sidebarRef} className={styles.sidebar}>
        <div className={styles.sidebarFilters}>
          <FilterForm
            filters={filters}
            onFiltersChange={handleFiltersChange}
            renderApply={() => (
              <button
                type="button"
                className={`${styles.drawerApply} ${styles.sidebarApply}`}
                onClick={handleApplyFilters}
              >
                Применить
              </button>
            )}
          />
        </div>
      </aside>

      <div className={styles.resultsArea}>
        <div className={styles.resultsCount}>
          Найдено: <strong>{total}</strong>
        </div>

        {isLoading ? (
          <div className={styles.resultsGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateTitle}>Ошибка загрузки</p>
            <button type="button" className={styles.emptyStateBtn} onClick={() => setPage(1)}>
              Повторить
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateTitle}>По выбранным фильтрам ничего не найдено</p>
            <button type="button" className={styles.emptyStateBtn} onClick={handleResetFilters}>
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <>
            <div className={styles.resultsGrid}>
              {items.map((listing: any) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photos?.[0]?.url ?? listing.images?.[0]?.url}
                  title={listing.title ?? ''}
                  price={listing.basePrice ?? listing.pricePerNight ?? 0}
                  city={listing.city ?? ''}
                  district={listing.district ?? undefined}
                  rooms={listing.bedrooms}
                  area={listing.area}
                />
              ))}
            </div>
            {(items.length >= 20 || page > 1) && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.paginationBtn}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Назад
                </button>
                <span className={styles.paginationPage}>Стр. {page}</span>
                <button
                  type="button"
                  className={styles.paginationBtn}
                  disabled={items.length < 20}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Вперёд
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
