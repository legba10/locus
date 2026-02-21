'use client'

import { useSoundStore } from '@/core/sound/useSoundStore'

const soundSrc = {
  message: '/sounds/message.mp3',
  booking: '/sounds/booking.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
} as const

type SoundType = keyof typeof soundSrc

const soundMap: Partial<Record<SoundType, HTMLAudioElement>> = {}
let unlockBound = false
let audioUnlocked = false

function getAudio(type: SoundType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!soundMap[type]) {
    const audio = new Audio(soundSrc[type])
    audio.preload = 'auto'
    soundMap[type] = audio
  }
  return soundMap[type] ?? null
}

export async function unlockAudio(): Promise<void> {
  if (typeof window === 'undefined' || audioUnlocked) return
  try {
    const keys = Object.keys(soundSrc) as SoundType[]
    await Promise.all(
      keys.map(async (key) => {
        const audio = getAudio(key)
        if (!audio) return
        audio.muted = true
        audio.currentTime = 0
        await audio.play().catch(() => undefined)
        audio.pause()
        audio.currentTime = 0
        audio.muted = false
      })
    )
    audioUnlocked = true
  } catch {
    // no-op: browser may block until user gesture
  }
}

export function bindAudioUnlockOnFirstInteraction(): void {
  if (typeof document === 'undefined' || unlockBound) return
  unlockBound = true
  document.addEventListener('click', unlockAudio, { once: true })
}

export function playSound(type: SoundType): void {
  if (typeof window === 'undefined') return
  if (!useSoundStore.getState().soundEnabled) return
  const audio = getAudio(type)
  if (!audio) return
  try {
    audio.currentTime = 0
    void audio.play()
  } catch {
    console.warn('Sound blocked by browser')
  }
}

export type { SoundType }
