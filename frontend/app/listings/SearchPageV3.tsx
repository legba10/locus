'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingCardV8, ListingCardV8Skeleton } from '@/domains/listing/ListingCardV8'
import { Card, Button } from '@/ui-system'
import { normalizeListings } from '@/core/adapters'
import { RU } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'
import { CITIES } from '@/shared/data/cities'

interface ListingItem {
  id: string
  title: string
  basePrice: number
  city: string
  district?: string
  photo?: string
  score?: number
  verdict?: string
  explanation?: string
  demandLevel?: 'low' | 'medium' | 'high'
  priceDiff?: number
  riskLevel?: 'low' | 'medium' | 'high'
  reasons?: string[]
}

interface ListingsResponse {
  items: ListingItem[]
  total?: number
}

type SortOption = 'best_fit' | 'price_asc' | 'price_desc' | 'newest'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'best_fit', label: RU.search.sort_best_fit },
  { value: 'price_asc', label: RU.search.sort_price_asc },
  { value: 'price_desc', label: RU.search.sort_price_desc },
  { value: 'newest', label: RU.search.sort_newest },
]

/**
 * SearchPageV3 — НЕ СПИСОК, А РАНЖИРОВАНИЕ ПО ПОЛЬЗЕ
 * 
 * Ключевые изменения:
 * 1. Сортировка по умолчанию: "Лучше всего подходит вам"
 * 2. Фильтр: "Показывать только подходящие варианты"
 * 3. Карточки = решения, а не объявления
 */
export function SearchPageV3() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Параметры поиска
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [guests, setGuests] = useState(searchParams.get('guests') || '2')
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '')
  
  // Сортировка и фильтры
  const [sort, setSort] = useState<SortOption>('best_fit')
  const [onlyGood, setOnlyGood] = useState(false)

  // Строим URL для запроса
  const queryParams = new URLSearchParams()
  if (city) queryParams.set('city', city)
  if (guests) queryParams.set('guests', guests)
  if (priceMax) queryParams.set('priceMax', priceMax)
  
  const { data, isLoading, error, refetch } = useFetch<ListingsResponse>(
    ['listings-search', city, guests, priceMax],
    `/api/listings?${queryParams.toString()}`
  )

  // Нормализуем данные
  const normalizedListings = data?.items ? normalizeListings(data.items) : []

  // Сортируем
  const sortedListings = [...normalizedListings].sort((a, b) => {
    switch (sort) {
      case 'best_fit':
        return (b.score || 0) - (a.score || 0)
      case 'price_asc':
        return a.basePrice - b.basePrice
      case 'price_desc':
        return b.basePrice - a.basePrice
      case 'newest':
      default:
        return 0 // Сохраняем порядок с бэкенда
    }
  })

  // Фильтруем только подходящие (score >= 60)
  const filteredListings = onlyGood 
    ? sortedListings.filter(l => (l.score || 0) >= 60)
    : sortedListings

  // Обработка поиска
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (guests) params.set('guests', guests)
    if (priceMax) params.set('priceMax', priceMax)
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{RU.search.title}</h1>
        <p className="text-gray-600">
          LOCUS находит и объясняет лучшие варианты
        </p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900"
          >
            <option value="">{RU.common.city}</option>
            {CITIES.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>

          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Макс. цена"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 w-32"
          />

          <Button onClick={handleSearch} variant="primary">
            {RU.search.title}
          </Button>
        </div>
      </div>

      {/* Сортировка и фильтры */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Сортировка */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Фильтр "только подходящие" */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyGood}
              onChange={(e) => setOnlyGood(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {RU.search.filter_only_good}
            </span>
          </label>
        </div>

        {/* Счётчик результатов */}
        <div className="text-sm text-gray-500">
          {filteredListings.length > 0 
            ? RU.search.results_count(filteredListings.length)
            : RU.search.no_results
          }
        </div>
      </div>

      {/* Загрузка */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ListingCardV8Skeleton key={i} />
          ))}
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <Card variant="bordered" className="p-8 text-center">
          <p className="text-red-600 mb-4">{RU.common.error}</p>
          <Button onClick={() => refetch()} variant="outline">
            {RU.common.retry}
          </Button>
        </Card>
      )}

      {/* Результаты */}
      {!isLoading && !error && filteredListings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((item) => (
            <ListingCardV8
              key={item.id}
              id={item.id}
              photo={item.photos[0]?.url}
              price={item.basePrice}
              city={item.city}
              district={item.address}
              decision={{
                score: item.score,
                reasons: item.reasons?.length > 0 ? item.reasons : [],
                demandLevel: item.demandLevel,
                priceDiff: item.priceDiff,
                riskLevel: item.riskLevel,
              }}
            />
          ))}
        </div>
      )}

      {/* Пусто */}
      {!isLoading && !error && filteredListings.length === 0 && (
        <Card variant="bordered" className="p-12 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {RU.search.no_results}
          </h3>
          <p className="text-gray-500 mb-4">
            {RU.search.try_different}
          </p>
          {onlyGood && (
            <Button 
              onClick={() => setOnlyGood(false)} 
              variant="outline"
            >
              Показать все варианты
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
