'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { useSearchStore } from './search-store'
import { CITIES, POPULAR_CITIES } from '@/shared/data/cities'

const CITY_SUGGESTIONS = POPULAR_CITIES.map((name) => ({ name, emoji: '🏙️' }))

export function SearchBarAdvanced({ className }: { className?: string }) {
  const router = useRouter()
  const { filters, setFilters } = useSearchStore()
  const [query, setQuery] = React.useState('')
  const [showCities, setShowCities] = React.useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (query) {
      // Check if query looks like a city or a natural language query
      const isCity = CITIES.some((city) => city.toLowerCase() === query.toLowerCase())
      if (isCity) {
        params.set('city', query)
      } else {
        params.set('q', query)
        params.set('ai', '1') // Enable AI search for natural language
      }
    }
    
    if (filters.city && !query) params.set('city', filters.city)
    if (filters.guests) params.set('guests', String(filters.guests))
    if (filters.priceMax) params.set('priceMax', String(filters.priceMax))
    
    router.push(`/search?${params.toString()}`)
  }

  function selectCity(city: string) {
    setQuery(city)
    setFilters({ city })
    setShowCities(false)
  }

  return (
    <form onSubmit={handleSearch} className={cn('relative', className)}>
      <div className="flex flex-col gap-3 md:flex-row">
        {/* Main search input */}
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowCities(e.target.value.length === 0)
            }}
            onFocus={() => setShowCities(query.length === 0)}
            placeholder="Город или «тихая квартира у метро»"
            className="w-full rounded-xl border border-border bg-surface-3/80 py-4 pl-12 pr-4 text-text placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand backdrop-blur-sm"
          />
          
          {/* City suggestions dropdown */}
          {showCities && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-border bg-surface-2 p-2 shadow-xl">
              <p className="px-3 py-2 text-xs text-text-dim">Популярные города</p>
              {CITY_SUGGESTIONS.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => selectCity(city.name)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-white/10"
                >
                  <span className="text-lg">{city.emoji}</span>
                  {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Guests selector */}
        <div className="relative md:w-40">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <select
            value={filters.guests ?? 2}
            onChange={(e) => setFilters({ guests: Number(e.target.value) })}
            className="w-full appearance-none rounded-xl border border-border bg-surface-3/80 py-4 pl-12 pr-10 text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand backdrop-blur-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-8 py-4 font-semibold text-white transition hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden md:inline">Найти</span>
        </button>
      </div>

      {/* Quick filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-text-dim">Быстрые фильтры:</span>
        {[
          { label: 'До 3000 ₽', value: { priceMax: 3000 } },
          { label: 'До 5000 ₽', value: { priceMax: 5000 } },
          { label: '4+ гостя', value: { guests: 4 } },
        ].map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setFilters(filter.value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs transition',
              (filters.priceMax === filter.value.priceMax || filters.guests === filter.value.guests)
                ? 'bg-brand text-white'
                : 'bg-white/10 text-text-mut hover:bg-white/20 hover:text-text'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </form>
  )
}
