'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SearchStoreState {
  city: string | null
  priceMin: number | null
  priceMax: number | null
  rooms: number | null
  type: string | null
  pets: boolean
  dates: { checkIn: string; checkOut: string } | null
  aiMode: boolean
  duration: string | null
  furniture: boolean
  district: string | null
  metro: string | null
  setField: <K extends keyof Omit<SearchStoreState, 'setField' | 'reset' | 'toQuery'>>(
    key: K,
    value: SearchStoreState[K]
  ) => void
  setMany: (patch: Partial<SearchStoreState>) => void
  reset: () => void
  toQuery: () => URLSearchParams
}

const defaults: Omit<SearchStoreState, 'setField' | 'setMany' | 'reset' | 'toQuery'> = {
  city: null,
  priceMin: null,
  priceMax: null,
  rooms: null,
  type: null,
  pets: false,
  dates: null,
  aiMode: false,
  duration: null,
  furniture: false,
  district: null,
  metro: null,
}

export const useSearchStore = create<SearchStoreState>()(
  persist(
    (set, get) => ({
      ...defaults,
      setField: (key, value) => set({ [key]: value } as Partial<SearchStoreState>),
      setMany: (patch) => set(patch),
      reset: () => set(defaults),
      toQuery: () => {
        const s = get()
        const q = new URLSearchParams()
        if (s.city) q.set('city', s.city)
        if (s.priceMin != null) q.set('priceMin', String(s.priceMin))
        if (s.priceMax != null) q.set('priceMax', String(s.priceMax))
        if (s.rooms != null) q.set('rooms', String(s.rooms))
        if (s.type) q.set('type', s.type)
        if (s.pets) q.set('pets', '1')
        if (s.furniture) q.set('furniture', '1')
        if (s.duration) q.set('duration', s.duration)
        if (s.district) q.set('district', s.district)
        if (s.metro) q.set('metro', s.metro)
        if (s.dates?.checkIn) q.set('checkIn', s.dates.checkIn)
        if (s.dates?.checkOut) q.set('checkOut', s.dates.checkOut)
        q.set('ai', s.aiMode ? '1' : '0')
        return q
      },
    }),
    {
      name: 'locus_search_store_v466',
      partialize: (s) => ({
        city: s.city,
        priceMin: s.priceMin,
        priceMax: s.priceMax,
        rooms: s.rooms,
        type: s.type,
        pets: s.pets,
        dates: s.dates,
        aiMode: s.aiMode,
        duration: s.duration,
        furniture: s.furniture,
        district: s.district,
        metro: s.metro,
      }),
    }
  )
)
