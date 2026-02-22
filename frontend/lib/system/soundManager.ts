'use client'

import { soundEngine } from '@/services/soundEngine'

const soundSrc = {
  message: '/sounds/message.mp3',
  booking: '/sounds/booking.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  login: '/sounds/login.mp3',
} as const

type SoundType = keyof typeof soundSrc

const lastPlayedAt: Partial<Record<SoundType, number>> = {}

const OAUTH_LOGIN_INTENT_KEY = 'locus_oauth_login_intent'

export async function unlockAudio(): Promise<void> {
  soundEngine.init()
}

export function bindAudioUnlockOnFirstInteraction(): void {
  soundEngine.init()
  soundEngine.bindUnlockOnFirstInteraction()
}

export function playSound(type: SoundType): void {
  const now = Date.now()
  const prev = lastPlayedAt[type] ?? 0
  if (now - prev < 600) return
  lastPlayedAt[type] = now
  if (type === 'message') return soundEngine.playMessage()
  if (type === 'login') return soundEngine.playLogin()
  return soundEngine.playNotify()
}

export function playLoginSoundOnce(): void {
  soundEngine.playLoginOnce()
}

export function resetLoginSoundPlayed(): void {
  soundEngine.resetLoginOnce()
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
