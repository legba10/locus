'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SearchFilters {
  city: string | null
  priceFrom: number | null
  priceTo: number | null
  rooms: number | null
  rentType: string | null
  dates: { checkIn: string; checkOut: string } | null
  guests: number | null
  pets: boolean | null
  aiMode: boolean
  type: string | null
  furniture: boolean
  district: string | null
  metro: string | null
}

export interface SearchStoreState {
  filters: SearchFilters
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  setFilters: (patch: Partial<SearchFilters>) => void
  applyQuickFilter: (quick: 'today' | 'budget50' | 'pets' | 'month' | 'studio') => void
  reset: () => void
  toQuery: () => URLSearchParams
}

const defaultFilters: SearchFilters = {
  city: null,
  priceFrom: null,
  priceTo: null,
  rooms: null,
  rentType: null,
  dates: null,
  guests: null,
  pets: null,
  aiMode: false,
  type: null,
  furniture: false,
  district: null,
  metro: null,
}

function getTodayIsoDate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const useSearchStore = create<SearchStoreState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),
      setFilters: (patch) =>
        set((state) => ({
          filters: { ...state.filters, ...patch },
        })),
      applyQuickFilter: (quick) =>
        set((state) => {
          const next = { ...state.filters }
          if (quick === 'today') {
            const today = getTodayIsoDate()
            next.dates = { checkIn: today, checkOut: today }
          }
          if (quick === 'budget50') next.priceTo = 50000
          if (quick === 'pets') next.pets = true
          if (quick === 'month') next.rentType = 'long'
          if (quick === 'studio') next.type = 'studio'
          return { filters: next }
        }),
      reset: () => set({ filters: defaultFilters }),
      toQuery: () => {
        const { filters } = get()
        const q = new URLSearchParams()
        if (filters.city) q.set('city', filters.city)
        if (filters.priceFrom != null) q.set('priceMin', String(filters.priceFrom))
        if (filters.priceTo != null) q.set('priceMax', String(filters.priceTo))
        if (filters.rooms != null) q.set('rooms', String(filters.rooms))
        if (filters.type) q.set('type', filters.type)
        if (filters.pets) q.set('pets', '1')
        if (filters.furniture) q.set('furniture', '1')
        if (filters.rentType) q.set('duration', filters.rentType)
        if (filters.district) q.set('district', filters.district)
        if (filters.metro) q.set('metro', filters.metro)
        if (filters.guests != null) q.set('guests', String(filters.guests))
        if (filters.dates?.checkIn) q.set('checkIn', filters.dates.checkIn)
        if (filters.dates?.checkOut) q.set('checkOut', filters.dates.checkOut)
        q.set('ai', filters.aiMode ? '1' : '0')
        return q
      },
    }),
    {
      name: 'locus_search_store_v468',
      partialize: (s) => ({
        filters: s.filters,
      }),
    }
  )
)

