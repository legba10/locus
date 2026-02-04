'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { useSearchStore } from './search-store'
import { CITIES } from '@/shared/data/cities'

/**
 * SearchBar — Premium Glass Search REDESIGNED
 * 
 * По ТЗ:
 * - iOS glass style (backdrop-blur: 14-20px, border-radius: 20-24px)
 * - "Бюджет" вместо "Цена в месяц"
 * - Иконки внутри инпутов
 * - Фиолетовая CTA кнопка
 */
export function SearchBar({ className, mode }: { className?: string; mode?: 'home' | 'results' }) {
  const router = useRouter()
  const { filters, setFilters } = useSearchStore()
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  function goSearch() {
    const params = new URLSearchParams()
    if (filters.city) params.set('city', filters.city)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.priceMax) params.set('priceMax', String(filters.priceMax))
    const qs = params.toString()
    router.push(`/listings${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className={cn(
      'bg-white/70 backdrop-blur-[16px]',
      'rounded-[22px]',
      'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
      'border border-gray-200/60',
      'p-5',
      className
    )}>
      <form onSubmit={(e) => { e.preventDefault(); goSearch(); }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          {/* Город */}
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5" htmlFor="city">
              Город
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                id="city"
                list="cities"
                value={filters.city ?? ''}
                onChange={(e) => setFilters({ city: e.target.value })}
                placeholder="Выберите город"
                className={cn(
                  'w-full rounded-xl pl-9 pr-3 py-2.5',
                  'border border-gray-200 bg-white',
                  'text-gray-900 text-[14px]',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                  'transition-all'
                )}
              />
              <datalist id="cities">
                {CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Бюджет — improved label */}
          <div className="md:w-40">
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5" htmlFor="budget">
              Бюджет
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="budget"
                type="number"
                min={0}
                step={5000}
                value={filters.priceMax ?? ''}
                onChange={(e) => setFilters({ priceMax: Number(e.target.value || 0) || undefined })}
                placeholder="до ₽"
                className={cn(
                  'w-full rounded-xl pl-9 pr-3 py-2.5',
                  'border border-gray-200 bg-white',
                  'text-gray-900 text-[14px]',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                  'transition-all'
                )}
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="md:w-auto">
            <button
              type="submit"
              className={cn(
                'w-full md:w-auto',
                'px-6 py-2.5 rounded-xl',
                'bg-violet-600 text-white font-semibold text-[14px]',
                'hover:bg-violet-700 active:bg-violet-800',
                'transition-all duration-200',
                'shadow-md shadow-violet-500/20',
                'hover:shadow-lg hover:shadow-violet-500/25',
                'flex items-center justify-center gap-2'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {mode === 'results' ? 'Обновить' : 'Найти'}
            </button>
          </div>
        </div>
      </form>

      {/* Filters toggle */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setFiltersOpen((s) => !s)}
          className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          aria-expanded={filtersOpen}
        >
          <svg className={cn('w-4 h-4 transition-transform', filtersOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          Фильтры
        </button>
      </div>

      {/* Extended filters */}
      {filtersOpen && (
        <div className="mt-3 grid gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 md:grid-cols-3">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5" htmlFor="rooms">
              Комнат
            </label>
            <select
              id="rooms"
              className={cn(
                'w-full rounded-lg px-3 py-2',
                'border border-gray-200 bg-white',
                'text-gray-900 text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                'transition-all cursor-pointer'
              )}
            >
              <option value="">Любое</option>
              <option value="1">1 комната</option>
              <option value="2">2 комнаты</option>
              <option value="3">3 комнаты</option>
              <option value="4">4+ комнат</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5" htmlFor="type">
              Тип жилья
            </label>
            <select
              id="type"
              className={cn(
                'w-full rounded-lg px-3 py-2',
                'border border-gray-200 bg-white',
                'text-gray-900 text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                'transition-all cursor-pointer'
              )}
            >
              <option value="">Любой</option>
              <option value="apartment">Квартира</option>
              <option value="room">Комната</option>
              <option value="house">Дом</option>
              <option value="studio">Студия</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-[12px] text-gray-400">
              Больше фильтров скоро
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

