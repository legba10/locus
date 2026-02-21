'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AiSearchSession {
  city: string
  budgetMin: number | null
  budgetMax: number | null
  dateFrom: string
  dateTo: string
  guests: number
  rooms: number | null
  preferences: string[]
  query: string
  lastResultCount: number
}

interface AiSearchStore extends AiSearchSession {
  updateSession: (patch: Partial<AiSearchSession>) => void
  resetSession: () => void
}

const DEFAULT_SESSION: AiSearchSession = {
  city: '',
  budgetMin: null,
  budgetMax: null,
  dateFrom: '',
  dateTo: '',
  guests: 2,
  rooms: null,
  preferences: [],
  query: '',
  lastResultCount: 0,
}

export const useAiSearchStore = create<AiSearchStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SESSION,
      updateSession: (patch) => set((s) => ({ ...s, ...patch })),
      resetSession: () => set(DEFAULT_SESSION),
    }),
    {
      name: 'locus_ai_search_session',
      partialize: (s) => ({
        city: s.city,
        budgetMin: s.budgetMin,
        budgetMax: s.budgetMax,
        dateFrom: s.dateFrom,
        dateTo: s.dateTo,
        guests: s.guests,
        rooms: s.rooms,
        preferences: s.preferences,
        query: s.query,
        lastResultCount: s.lastResultCount,
      }),
    }
  )
)
