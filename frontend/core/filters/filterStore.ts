/**
 * ТЗ-7 + ТЗ-4.1: Единый filter store (Zustand).
 * Каноническое ядро: city, priceFrom/To, rooms[], type[], radius, sort.
 * Legacy-поля синхронизируются для Hero, FilterPanel, AI popup.
 * Только хранение: без fetch, redirect, auth.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, SortOption } from './filterTypes'
import { DEFAULT_FILTER_STATE, DEFAULT_FILTER_STATE_CORE } from './filterTypes'

const STORAGE_KEY = 'locus_filter_state'

export interface FilterStore extends FilterState {
  setCity: (city: string | null) => void
  setBudget: (min: number | '', max: number | '') => void
  setPrice: (from: number | null, to: number | null) => void
  setType: (type: string) => void
  setTypeList: (type: string[]) => void
  setRooms: (rooms: string) => void
  toggleRoom: (room: number) => void
  setRadius: (radius: number) => void
  setSort: (sort: SortOption) => void
  setDuration: (duration: string) => void
  setAiMode: (on: boolean) => void
  reset: () => void
  resetFilters: () => void
  getBudgetQuery: () => { priceMin: string; priceMax: string }
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_FILTER_STATE,

      setCity: (city) => set({ city: city ?? null }),

      setBudget: (min, max) => {
        const priceFrom = min === '' ? null : min
        const priceTo = max === '' ? null : max
        set({
          priceFrom,
          priceTo,
          budgetMin: min,
          budgetMax: max,
        })
      },

      setPrice: (from, to) => {
        const priceFrom = from ?? null
        const priceTo = to ?? null
        const budgetMin = priceFrom != null ? priceFrom : ''
        const budgetMax = priceTo != null ? priceTo : ''
        set({ priceFrom, priceTo, budgetMin, budgetMax })
      },

      setType: (typeStr) => {
        const type = typeStr ? [typeStr] : []
        set({ type })
      },

      setTypeList: (type) => set({ type }),

      setRooms: (roomsStr) => {
        const rooms = roomsStr
          ? roomsStr.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n))
          : []
        set({ rooms })
      },

      toggleRoom: (room) => {
        const { rooms } = get()
        const next = rooms.includes(room) ? rooms.filter((r) => r !== room) : [...rooms, room].sort((a, b) => a - b)
        set({ rooms: next })
      },

      setRadius: (radius) => set({ radius }),

      setSort: (sort) => set({ sort }),

      setDuration: (duration) => set({ duration }),

      setAiMode: (aiMode) => set({ aiMode }),

      reset: () => set(DEFAULT_FILTER_STATE),

      resetFilters: () =>
        set({
          ...DEFAULT_FILTER_STATE_CORE,
          budgetMin: '',
          budgetMax: '',
          duration: get().duration,
          aiMode: get().aiMode,
        }),

      getBudgetQuery: () => {
        const { priceFrom, priceTo } = get()
        const priceMin = priceFrom != null ? String(priceFrom) : ''
        const priceMax = priceTo != null ? String(priceTo) : ''
        return { priceMin, priceMax }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        city: s.city,
        priceFrom: s.priceFrom,
        priceTo: s.priceTo,
        rooms: s.rooms,
        type: s.type,
        radius: s.radius,
        sort: s.sort,
        budgetMin: s.budgetMin,
        budgetMax: s.budgetMax,
        duration: s.duration,
        aiMode: s.aiMode,
      }),
    }
  )
)
