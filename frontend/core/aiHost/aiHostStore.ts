'use client'

import { create } from 'zustand'
import type { HostListingAnalysis, HostPriceSuggestion } from '@/lib/ai/hostAnalyzer'

interface AiHostState {
  analysisByListing: Record<string, HostListingAnalysis>
  priceByListing: Record<string, HostPriceSuggestion>
  improvedTextByListing: Record<string, string>
  selectedTipsByListing: Record<string, string[]>
  setListingData: (listingId: string, payload: { analysis: HostListingAnalysis; price: HostPriceSuggestion; improvedText: string }) => void
  toggleTip: (listingId: string, tip: string) => void
  clearListing: (listingId: string) => void
}

export const useAiHostStore = create<AiHostState>((set) => ({
  analysisByListing: {},
  priceByListing: {},
  improvedTextByListing: {},
  selectedTipsByListing: {},
  setListingData: (listingId, payload) =>
    set((state) => ({
      analysisByListing: { ...state.analysisByListing, [listingId]: payload.analysis },
      priceByListing: { ...state.priceByListing, [listingId]: payload.price },
      improvedTextByListing: { ...state.improvedTextByListing, [listingId]: payload.improvedText },
      selectedTipsByListing: {
        ...state.selectedTipsByListing,
        [listingId]: state.selectedTipsByListing[listingId] ?? [],
      },
    })),
  toggleTip: (listingId, tip) =>
    set((state) => {
      const prev = state.selectedTipsByListing[listingId] ?? []
      const next = prev.includes(tip) ? prev.filter((x) => x !== tip) : [...prev, tip]
      return {
        selectedTipsByListing: { ...state.selectedTipsByListing, [listingId]: next },
      }
    }),
  clearListing: (listingId) =>
    set((state) => {
      const analysisByListing = { ...state.analysisByListing }
      const priceByListing = { ...state.priceByListing }
      const improvedTextByListing = { ...state.improvedTextByListing }
      const selectedTipsByListing = { ...state.selectedTipsByListing }
      delete analysisByListing[listingId]
      delete priceByListing[listingId]
      delete improvedTextByListing[listingId]
      delete selectedTipsByListing[listingId]
      return { analysisByListing, priceByListing, improvedTextByListing, selectedTipsByListing }
    }),
}))
