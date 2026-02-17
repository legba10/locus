/**
 * ТЗ-2: единый поиск из шапки — overlay открывается по клику на 🔍.
 * Только состояние открытия; контент и фильтры в SearchOverlay + useFilterStore.
 */
import { create } from 'zustand'

export interface SearchOverlayStore {
  isOpen: boolean
  initialQuery: string
  open: (query?: string) => void
  close: () => void
  toggle: () => void
  clearInitialQuery: () => void
}

export const useSearchOverlayStore = create<SearchOverlayStore>((set) => ({
  isOpen: false,
  initialQuery: '',
  open: (query) => set({ isOpen: true, initialQuery: query ?? '' }),
  close: () => set({ isOpen: false, initialQuery: '' }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen, initialQuery: s.isOpen ? '' : s.initialQuery })),
  clearInitialQuery: () => set({ initialQuery: '' }),
}))
