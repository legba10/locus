'use client'

import { useSoundStore } from '@/core/sound/useSoundStore'

const soundSrc = {
  message: '/sounds/message.mp3',
  booking: '/sounds/booking.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  login: '/sounds/login.mp3',
} as const

type SoundType = keyof typeof soundSrc

const soundMap: Partial<Record<SoundType, HTMLAudioElement>> = {}
const lastPlayedAt: Partial<Record<SoundType, number>> = {}
let unlockBound = false
let audioUnlocked = false
let loginSoundPlayed = false

const OAUTH_LOGIN_INTENT_KEY = 'locus_oauth_login_intent'

function getAudio(type: SoundType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!soundMap[type]) {
    const audio = new Audio(soundSrc[type])
    audio.preload = 'auto'
    if (type === 'login') audio.volume = 0.5
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
  const now = Date.now()
  const prev = lastPlayedAt[type] ?? 0
  if (now - prev < 600) return
  lastPlayedAt[type] = now
  const audio = getAudio(type)
  if (!audio) return
  try {
    audio.currentTime = 0
    void audio.play()
  } catch {
    console.warn('Sound blocked by browser')
  }
}

export function playLoginSoundOnce(): void {
  if (loginSoundPlayed) return
  playSound('login')
  loginSoundPlayed = true
}

export function resetLoginSoundPlayed(): void {
  loginSoundPlayed = false
}

export function markOAuthLoginIntent(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(OAUTH_LOGIN_INTENT_KEY, '1')
}

export function consumeOAuthLoginIntent(): boolean {
  if (typeof window === 'undefined') return false
  const hasIntent = window.sessionStorage.getItem(OAUTH_LOGIN_INTENT_KEY) === '1'
  if (hasIntent) window.sessionStorage.removeItem(OAUTH_LOGIN_INTENT_KEY)
  return hasIntent
}

export type { SoundType }
