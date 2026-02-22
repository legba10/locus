'use client'

import { useSoundStore } from '@/core/sound/useSoundStore'

type EngineKey = 'message' | 'notify' | 'login'

type AudioPair = {
  mp3: string
  ogg: string
  volume: number
}

const SOURCES: Record<EngineKey, AudioPair> = {
  message: { mp3: '/sounds/message.mp3', ogg: '/sounds/message.ogg', volume: 0.7 },
  notify: { mp3: '/sounds/notify.mp3', ogg: '/sounds/notify.ogg', volume: 0.7 },
  login: { mp3: '/sounds/login.mp3', ogg: '/sounds/login.ogg', volume: 0.8 },
}

const LOGIN_ONCE_KEY = 'locus_login_sound_once'

class SoundEngine {
  private static instance: SoundEngine | null = null
  private players: Partial<Record<EngineKey, HTMLAudioElement>> = {}
  private inited = false
  private unlocked = false
  private unlockBound = false
  private lastPlayAt: Partial<Record<EngineKey, number>> = {}

  static getInstance(): SoundEngine {
    if (!SoundEngine.instance) SoundEngine.instance = new SoundEngine()
    return SoundEngine.instance
  }

  private constructor() {}

  init() {
    if (typeof window === 'undefined') return
    if (this.inited) return
    this.inited = true
    this.ensurePlayer('message')
    this.ensurePlayer('notify')
    this.ensurePlayer('login')
    this.bindUnlockOnFirstInteraction()
  }

  private isSoundEnabled(): boolean {
    return useSoundStore.getState().soundEnabled
  }

  private ensurePlayer(key: EngineKey): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null
    if (this.players[key]) return this.players[key] ?? null

    const pair = SOURCES[key]
    const audio = new Audio()
    const ogg = document.createElement('source')
    ogg.src = pair.ogg
    ogg.type = 'audio/ogg'
    const mp3 = document.createElement('source')
    mp3.src = pair.mp3
    mp3.type = 'audio/mpeg'
    audio.appendChild(ogg)
    audio.appendChild(mp3)
    audio.preload = 'auto'
    audio.volume = pair.volume
    this.players[key] = audio
    return audio
  }

  private shouldDebounce(key: EngineKey): boolean {
    const now = Date.now()
    const prev = this.lastPlayAt[key] ?? 0
    if (now - prev < 350) return true
    this.lastPlayAt[key] = now
    return false
  }

  private safePlay(audio: HTMLAudioElement | null, key: EngineKey) {
    if (!audio) return
    if (!this.unlocked) return
    if (!this.isSoundEnabled()) return
    if (this.shouldDebounce(key)) return

    try {
      audio.currentTime = 0
      void audio.play().catch(() => {})
    } catch {
      // ignore runtime audio errors
    }
  }

  private primeUnlock() {
    const keys: EngineKey[] = ['message', 'notify', 'login']
    for (const key of keys) {
      const audio = this.ensurePlayer(key)
      if (!audio) continue
      try {
        audio.muted = true
        const playPromise = audio.play()
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            audio.pause()
            audio.currentTime = 0
            audio.muted = false
          }).catch(() => {
            audio.muted = false
          })
        } else {
          audio.pause()
          audio.currentTime = 0
          audio.muted = false
        }
      } catch {
        audio.muted = false
      }
    }
  }

  bindUnlockOnFirstInteraction() {
    if (typeof window === 'undefined') return
    if (this.unlockBound) return
    this.unlockBound = true
    const unlockAudio = () => {
      this.unlocked = true
      this.primeUnlock()
    }
    window.addEventListener('click', unlockAudio, { once: true, passive: true })
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true })
    window.addEventListener('keydown', unlockAudio, { once: true })
  }

  playMessage() {
    this.safePlay(this.ensurePlayer('message'), 'message')
  }

  playNotify() {
    this.safePlay(this.ensurePlayer('notify'), 'notify')
  }

  playLogin() {
    this.safePlay(this.ensurePlayer('login'), 'login')
  }

  playLoginOnce() {
    if (typeof window === 'undefined') return
    const already = window.sessionStorage.getItem(LOGIN_ONCE_KEY) === '1'
    if (already) return
    window.sessionStorage.setItem(LOGIN_ONCE_KEY, '1')
    this.playLogin()
  }

  resetLoginOnce() {
    if (typeof window === 'undefined') return
    window.sessionStorage.removeItem(LOGIN_ONCE_KEY)
  }
}

export const soundEngine = SoundEngine.getInstance()
