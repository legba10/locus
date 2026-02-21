'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundStoreState {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  toggleSoundEnabled: () => void
}

export const useSoundStore = create<SoundStoreState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      toggleSoundEnabled: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'locus_sound_settings',
      partialize: (state) => ({ soundEnabled: state.soundEnabled }),
    }
  )
)
