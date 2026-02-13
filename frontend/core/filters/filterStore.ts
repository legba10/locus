/**
 * ТЗ-7: Единый store фильтров. Все UI читают только отсюда.
 * Persist в localStorage.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState } from './filterTypes'
import { DEFAULT_FILTER_STATE } from './filterTypes'

const STORAGE_KEY = 'locus_filter_state'

export interface FilterStore extends FilterState {
  setCity: (city: string) => void
  setBudget: (min: number | '', max: number | '') => void
  setType: (type: string) => void
  setRooms: (rooms: string) => void
  setDuration: (duration: string) => void
  setAiMode: (on: boolean) => void
  reset: () => void
  /** Для URL / API: priceRange строка вида "30000-50000" или "" */
  getBudgetQuery: () => { priceMin: string; priceMax: string }
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_FILTER_STATE,
      setCity: (city) => set({ city }),
      setBudget: (budgetMin, budgetMax) => set({ budgetMin, budgetMax }),
      setType: (type) => set({ type }),
      setRooms: (rooms) => set({ rooms }),
      setDuration: (duration) => set({ duration }),
      setAiMode: (aiMode) => set({ aiMode }),
      reset: () => set(DEFAULT_FILTER_STATE),
      getBudgetQuery: () => {
        const { budgetMin, budgetMax } = get()
        const min = budgetMin === '' ? '' : String(budgetMin)
        const max = budgetMax === '' ? '' : String(budgetMax)
        return { priceMin: min, priceMax: max }
      },
    }),
    { name: STORAGE_KEY, partialize: (s) => ({ city: s.city, budgetMin: s.budgetMin, budgetMax: s.budgetMax, type: s.type, rooms: s.rooms, duration: s.duration, aiMode: s.aiMode }) }
  )
)
