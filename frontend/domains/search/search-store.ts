import { create } from 'zustand'
import type { SearchFilters } from './search-types'

type SearchState = {
  filters: SearchFilters
  setFilters: (partial: Partial<SearchFilters>) => void
  reset: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: { guests: 2 },
  setFilters: (partial) =>
    set((s) => ({
      filters: { ...s.filters, ...partial },
    })),
  reset: () => set({ filters: { guests: 2 } }),
}))

