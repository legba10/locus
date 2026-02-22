'use client'

import { create } from 'zustand'

export type AiMode = 'search' | 'listing' | 'admin'

interface AiState {
  open: boolean
  mode: AiMode
  loading: boolean
  demo: boolean
  openPanel: (mode: AiMode) => void
  closePanel: () => void
  setLoading: (loading: boolean) => void
}

function hasApiKey() {
  const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  return Boolean(key && key.trim().length > 0)
}

export const useAiController = create<AiState>((set) => ({
  open: false,
  mode: 'search',
  loading: false,
  demo: !hasApiKey(),
  openPanel: (mode) => set({ open: true, mode }),
  closePanel: () => set({ open: false, loading: false }),
  setLoading: (loading) => set({ loading }),
}))
