'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingCardV5, ListingCardV5Skeleton } from '@/domains/listing/ListingCardV5'
import { Card, Button, Badge } from '@/ui-system'
import { cn } from '@/shared/utils/cn'
import { CITIES } from '@/shared/data/cities'

type SortOption = 'smart' | 'price_asc' | 'price_desc' | 'demand' | 'rating'

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
}

interface ListingsResponse {
  items: ListingItem[]
  total: number
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'smart', label: 'По умности LOCUS' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'demand', label: 'По спросу' },
  { value: 'rating', label: 'По рейтингу' },
]

/**
 * SearchPageV2 — Product Logic with AI Sorting
 * 
 * Default sorting = LOCUS AI Score
 * 
 * Sort by:
 * • AI relevance (default)
 * • Price
 * • Demand
 * • Rating
 * 
 * ADD FILTER: "Only recommended by AI"
 */

/**
 * SearchPageV2 — Product Sorting
 * 
 * Сортировка:
 * - По умности LOCUS (default) — главная сортировка = AI score
 * - По цене
 * - По спросу
 * - По рейтингу
 */
export function SearchPageV2() {
  const searchParams = useSearchParams()
  const initialCity = searchParams.get('city') || ''
  
  const [city, setCity] = useState(initialCity)
  const [sort, setSort] = useState<SortOption>('smart')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [onlyRecommended, setOnlyRecommended] = useState(false)

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (city && city !== 'Все города') params.set('city', city)
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
    params.set('sort', sort)
    return `/api/listings?${params.toString()}`
  }, [city, priceMin, priceMax, sort])

  const { data, isLoading, error } = useFetch<ListingsResponse>(['listings-search', apiUrl], apiUrl)

  // Sort items client-side for demo (in production — server-side)
  const sortedItems = useMemo(() => {
    if (!data?.items) return []
    
    let items = [...data.items]
    
    // Filter: Only recommended by AI (score >= 60)
    if (onlyRecommended) {
      items = items.filter(item => (item.score || 0) >= 60)
    }
    
    // Sort
    switch (sort) {
      case 'smart':
        return items.sort((a, b) => (b.score || 0) - (a.score || 0))
      case 'price_asc':
        return items.sort((a, b) => a.basePrice - b.basePrice)
      case 'price_desc':
        return items.sort((a, b) => b.basePrice - a.basePrice)
      case 'demand':
        const demandOrder = { high: 3, medium: 2, low: 1 }
        return items.sort((a, b) => (demandOrder[b.demandLevel || 'low'] || 0) - (demandOrder[a.demandLevel || 'low'] || 0))
      case 'rating':
        return items.sort((a, b) => (b.score || 0) - (a.score || 0))
      default:
        return items
    }
  }, [data?.items, sort, onlyRecommended])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Поиск жилья</h1>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* City */}
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Все города</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Price range */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="от"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="до"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <span className="text-gray-500 text-sm">₽</span>
            </div>
          </div>

          {/* Sort + AI Filter */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSort(option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition',
                    sort === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {option.value === 'smart' ? 'AI relevance' : option.label}
                </button>
              ))}
            </div>
            
            {/* Only recommended by AI */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyRecommended}
                onChange={(e) => setOnlyRecommended(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Только рекомендованные AI</span>
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Results count */}
        {data && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-600">Найдено:</span>
            <Badge variant="info">{sortedItems.length}</Badge>
            {sort === 'smart' && (
              <span className="text-sm text-gray-500">
                — отсортировано по оценке LOCUS
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <ListingCardV5Skeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card variant="bordered" className="p-6 text-center">
            <p className="text-red-600 mb-2">Ошибка загрузки</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Повторить
            </Button>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !error && sortedItems.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedItems.map(item => (
              <ListingCardV5
                key={item.id}
                id={item.id}
                photo={item.photo}
                price={item.basePrice}
                city={item.city}
                district={item.district}
                score={item.score || 0}
                verdict={item.verdict || 'Нет оценки'}
                explanation={item.explanation}
                demandLevel={item.demandLevel}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && sortedItems.length === 0 && (
          <Card variant="bordered" className="p-8 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h2>
            <p className="text-gray-500 mb-4">Попробуйте изменить параметры поиска</p>
            <Button variant="outline" onClick={() => { setCity(''); setPriceMin(''); setPriceMax('') }}>
              Сбросить фильтры
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
