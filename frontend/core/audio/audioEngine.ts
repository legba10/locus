'use client'

import { useSoundStore } from '@/core/sound/useSoundStore'

type CoreAudioType = 'message' | 'notification' | 'login'

const sourceMap: Record<CoreAudioType, { mp3: string; ogg: string }> = {
  message: { mp3: '/sounds/message.mp3', ogg: '/sounds/message.ogg' },
  notification: { mp3: '/sounds/success.mp3', ogg: '/sounds/success.ogg' },
  login: { mp3: '/sounds/login.mp3', ogg: '/sounds/login.ogg' },
}

const audioCache: Partial<Record<CoreAudioType, HTMLAudioElement>> = {}
const lastPlayedAt: Partial<Record<CoreAudioType, number>> = {}
let unlockBound = false
let audioUnlocked = false
let loginPlayed = false

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)
  return isIOS && isSafari
}

function pickSource(type: CoreAudioType): string {
  if (typeof document === 'undefined') return sourceMap[type].mp3
  const testAudio = document.createElement('audio')
  const canMp3 = testAudio.canPlayType('audio/mpeg') !== ''
  const canOgg = testAudio.canPlayType('audio/ogg') !== ''
  if (isIOSSafari() && canOgg) return sourceMap[type].ogg
  if (canMp3) return sourceMap[type].mp3
  if (canOgg) return sourceMap[type].ogg
  return sourceMap[type].mp3
}

function getAudio(type: CoreAudioType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!audioCache[type]) {
    const audio = new Audio(pickSource(type))
    audio.preload = 'auto'
    if (type === 'login') audio.volume = 0.5
    audioCache[type] = audio
  }
  return audioCache[type] ?? null
}

export function preloadAudio(): void {
  ;(['message', 'notification', 'login'] as CoreAudioType[]).forEach((type) => {
    const audio = getAudio(type)
    if (!audio) return
    audio.load()
  })
}

export async function unlockAudio(): Promise<void> {
  if (typeof window === 'undefined' || audioUnlocked) return
  try {
    await Promise.all(
      (['message', 'notification', 'login'] as CoreAudioType[]).map(async (type) => {
        const audio = getAudio(type)
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
    // Ignore browser autoplay restrictions until first interaction.
  }
}

export function bindAudioUnlockOnFirstInteraction(): void {
  if (typeof document === 'undefined' || unlockBound) return
  unlockBound = true
  document.addEventListener('click', unlockAudio, { once: true })
  document.addEventListener('touchstart', unlockAudio, { once: true })
}

export function playCoreAudio(type: CoreAudioType): void {
  if (typeof window === 'undefined') return
  if (!useSoundStore.getState().soundEnabled) return
  const now = Date.now()
  if (now - (lastPlayedAt[type] ?? 0) < 450) return
  lastPlayedAt[type] = now
  const audio = getAudio(type)
  if (!audio) return
  audio.currentTime = 0
  void audio.play().catch(() => undefined)
}

export function playLoginAudioOnce(): void {
  if (loginPlayed) return
  playCoreAudio('login')
  loginPlayed = true
}

export function resetLoginAudioOnce(): void {
  loginPlayed = false
}
