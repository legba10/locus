'use client'

import { useState, useMemo } from 'react'
import { SearchBarTZ11 } from '@/components/search/SearchBarTZ11'
import { FiltersSheetTZ11, type FiltersTZ11 } from '@/components/search/FiltersSheetTZ11'
import { ListingsGridTZ11, type ListingItemTZ11 } from '@/components/search/ListingsGridTZ11'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'

type ListingsResponse = { items?: unknown[]; data?: unknown[] }

const defaultFilters: FiltersTZ11 = {
  priceFrom: '',
  priceTo: '',
  rooms: null,
  district: '',
  propertyType: '',
}

/** Привести элемент API к ListingItemTZ11 (цена за месяц, комнаты = bedrooms) */
function toListingItem(l: any): ListingItemTZ11 {
  const price = Number(l?.basePrice ?? l?.pricePerNight ?? l?.price ?? 0)
  const rooms = l?.bedrooms ?? l?.rooms ?? null
  const district = l?.district ?? l?.addressLine ?? null
  const photos = l?.photos ?? l?.images
  const photo = Array.isArray(photos) && photos[0] ? photos[0].url : l?.cover ?? null
  return {
    id: String(l?.id ?? ''),
    title: String(l?.title ?? ''),
    price,
    city: String(l?.city ?? ''),
    district: district ? String(district) : null,
    rooms: rooms != null ? Number(rooms) : null,
    area: l?.area != null ? Number(l.area) : null,
    floor: l?.floor != null ? Number(l.floor) : null,
    totalFloors: l?.totalFloors != null ? Number(l.totalFloors) : null,
    photos: Array.isArray(photos) ? photos.map((p: any) => ({ url: p?.url ?? p })) : undefined,
    photo: photo ? String(photo) : null,
    createdAt: typeof l?.createdAt === 'string' ? l.createdAt : undefined,
    propertyType: (l?.type ?? l?.propertyType ?? '').toString().toLowerCase() || undefined,
  }
}

type SortOption = 'price_asc' | 'created_desc'

export function SearchPageTZ11() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FiltersTZ11>(defaultFilters)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [sort, setSort] = useState<SortOption>('price_asc')

  const { data, isLoading, error } = useFetch<ListingsResponse>(['listings-tz11'], '/api/listings?limit=200')

  const rawItems = useMemo(() => {
    const list = data?.items ?? data?.data ?? []
    return Array.isArray(list) ? list.map(toListingItem) : []
  }, [data])

  const filtered = useMemo(() => {
    let list = rawItems

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (l) =>
          (l.city && l.city.toLowerCase().includes(q)) ||
          (l.district && String(l.district).toLowerCase().includes(q)) ||
          (l.title && l.title.toLowerCase().includes(q))
      )
    }

    const priceFrom = filters.priceFrom.trim() ? Number(filters.priceFrom) : null
    const priceTo = filters.priceTo.trim() ? Number(filters.priceTo) : null
    if (priceFrom != null && !Number.isNaN(priceFrom)) {
      list = list.filter((l) => l.price >= priceFrom)
    }
    if (priceTo != null && !Number.isNaN(priceTo)) {
      list = list.filter((l) => l.price <= priceTo)
    }

    if (filters.rooms != null) {
      if (filters.rooms >= 4) {
        list = list.filter((l) => (l.rooms ?? 0) >= 4)
      } else {
        list = list.filter((l) => l.rooms === filters.rooms)
      }
    }

    const districtFilter = filters.district.trim().toLowerCase()
    if (districtFilter) {
      list = list.filter(
        (l) =>
          (l.district && String(l.district).toLowerCase().includes(districtFilter)) ||
          (l.city && l.city.toLowerCase().includes(districtFilter))
      )
    }

    if (filters.propertyType) {
      list = list.filter((l) => (l.propertyType ?? '').toLowerCase() === filters.propertyType.toLowerCase())
    }

    return list
  }, [rawItems, query, filters])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'price_asc') {
      arr.sort((a, b) => a.price - b.price)
    } else if (sort === 'created_desc') {
      arr.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    }
    return arr
  }, [filtered, sort])

  const activeFiltersCount = useMemo(() => {
    let n = 0
    if (filters.priceFrom.trim()) n++
    if (filters.priceTo.trim()) n++
    if (filters.rooms != null) n++
    if (filters.district.trim()) n++
    if (filters.propertyType?.trim()) n++
    return n
  }, [filters])

  const handleResetFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        <h1 className="sr-only">Поиск жилья</h1>

        <SearchBarTZ11
          query={query}
          onQueryChange={setQuery}
          onOpenFilters={() => setFiltersSheetOpen(true)}
          activeFiltersCount={activeFiltersCount}
          className="mb-4"
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] text-[var(--text-secondary)]">
            Найдено: <span className="font-semibold text-[var(--text-primary)]">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-tz11" className="text-[14px] text-[var(--text-secondary)]">
              Сортировка:
            </label>
            <select
              id="sort-tz11"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className={cn(
                'rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)]',
                'px-3 py-2 text-[14px] text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30'
              )}
            >
              <option value="price_asc">Сначала дешёвые</option>
              <option value="created_desc">Сначала новые</option>
            </select>
          </div>
        </div>

        {error && (
          <div
            className={cn(
              'rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 text-center',
              'text-[var(--text-primary)]'
            )}
          >
            <p className="font-medium">Ошибка загрузки объявлений</p>
            <p className="mt-1 text-[14px] text-[var(--text-secondary)]">Проверьте подключение и повторите попытку</p>
          </div>
        )}

        {!error && (
          <ListingsGridTZ11
            items={sorted}
            isLoading={isLoading}
            onEmptyAction={() => {
              setFilters(defaultFilters)
              setQuery('')
            }}
            emptyActionLabel="Сбросить фильтры"
          />
        )}

        <FiltersSheetTZ11
          open={filtersSheetOpen}
          onClose={() => setFiltersSheetOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          onApply={() => setFiltersSheetOpen(false)}
        />
      </div>
    </div>
  )
}
