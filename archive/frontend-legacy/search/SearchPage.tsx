'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingCardV3, ListingCardV3Skeleton } from '@/domains/listing/ListingCardV3'
import { cn } from '@/shared/utils/cn'
import { CITIES } from '@/shared/data/cities'

interface ListingItem {
  id: string
  title: string
  city: string
  basePrice: number
  photo?: string
  score?: number
  verdict?: string
  priceDiff?: number
  pricePosition?: 'below_market' | 'market' | 'above_market'
  demand?: 'low' | 'medium' | 'high'
  shortSummary?: string
  rooms?: number
  beds?: number
  bathrooms?: number
  rating?: number
  reviewCount?: number
}

interface SearchResponse {
  items: ListingItem[]
  total: number
}

type SortOption = 'score' | 'price_asc' | 'price_desc' | 'rating'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'score', label: 'По оценке LOCUS' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'rating', label: 'По рейтингу' },
]

/**
 * SearchPage — страница поиска с сортировкой
 * 
 * Сортировка:
 * - По оценке LOCUS
 * - По цене (↑↓)
 * - По популярности/рейтингу
 */
export function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') ?? '')
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') ?? '')
  const [guests, setGuests] = useState(searchParams.get('guests') ?? '2')
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) ?? 'score')

  // Строим URL для API
  const buildApiUrl = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
    if (guests) params.set('guests', guests)
    params.set('sort', sort)
    return `/api/listings?${params.toString()}`
  }

  const { data, isLoading, error, refetch } = useFetch<SearchResponse>(
    ['listings', city, priceMin, priceMax, guests, sort],
    buildApiUrl(),
  )

  // Обновляем URL при изменении фильтров
  const updateUrl = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
    if (guests !== '2') params.set('guests', guests)
    if (sort !== 'score') params.set('sort', sort)
    router.push(`/listings?${params.toString()}`, { scroll: false })
  }

  // Сортировка на клиенте
  const sortedItems = [...(data?.items ?? [])].sort((a, b) => {
    switch (sort) {
      case 'score':
        return (b.score ?? 0) - (a.score ?? 0)
      case 'price_asc':
        return a.basePrice - b.basePrice
      case 'price_desc':
        return b.basePrice - a.basePrice
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0)
      default:
        return 0
    }
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Поиск жилья</h1>
        <p className="text-gray-500">Найдено: {data?.total ?? 0} вариантов</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Город */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Город</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); updateUrl() }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Любой город</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Цена от */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Цена от</label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={updateUrl}
              placeholder="0"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Цена до */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Цена до</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={updateUrl}
              placeholder="100000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Гости */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Гости</label>
            <select
              value={guests}
              onChange={(e) => { setGuests(e.target.value); updateUrl() }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
              ))}
            </select>
          </div>

          {/* Кнопка поиска */}
          <div className="flex items-end">
            <button
              onClick={() => { updateUrl(); refetch() }}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Найти
            </button>
          </div>
        </div>
      </div>

      {/* Сортировка */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {SORT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => { setSort(option.value); updateUrl() }}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition',
                sort === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Результаты */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ListingCardV3Skeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">Ошибка загрузки. Попробуйте снова.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-red-700 hover:underline"
          >
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !error && sortedItems.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map((item) => (
            <ListingCardV3
              key={item.id}
              id={item.id}
              title={item.title}
              city={item.city}
              price={item.basePrice}
              photo={item.photo}
              score={item.score}
              verdict={item.verdict}
              priceDiff={item.priceDiff}
              pricePosition={item.pricePosition}
              demand={item.demand}
              shortSummary={item.shortSummary}
              rooms={item.rooms}
              beds={item.beds}
              bathrooms={item.bathrooms}
              rating={item.rating}
              reviewCount={item.reviewCount}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && sortedItems.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">Ничего не найдено. Попробуйте изменить фильтры.</p>
        </div>
      )}
    </div>
  )
}
