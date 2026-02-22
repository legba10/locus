'use client'

import { useSoundStore } from '@/core/sound/useSoundStore'

type SoundKey = 'message' | 'notify' | 'login'

const SOURCES: Record<SoundKey, string[]> = {
  message: ['/sounds/message.ogg', '/sounds/message.mp3'],
  notify: ['/sounds/notify.ogg', '/sounds/notify.mp3', '/sounds/booking.mp3'],
  login: ['/sounds/login.ogg', '/sounds/login.mp3'],
}

class SoundService {
  private static instance: SoundService | null = null
  private players: Partial<Record<SoundKey, HTMLAudioElement>> = {}
  private unlocked = false
  private bound = false

  static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService()
    }
    return SoundService.instance
  }

  private constructor() {}

  bindUnlockOnFirstInteraction() {
    if (typeof window === 'undefined' || this.bound) return
    this.bound = true
    const unlock = () => {
      this.unlocked = true
      void this.primePlayers()
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('click', unlock, { once: true, passive: true })
    window.addEventListener('touchstart', unlock, { once: true, passive: true })
    window.addEventListener('keydown', unlock, { once: true })
  }

  private getPlayer(key: SoundKey): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null
    if (this.players[key]) return this.players[key] ?? null
    const audio = new Audio()
    for (const src of SOURCES[key]) {
      const source = document.createElement('source')
      source.src = src
      source.type = src.endsWith('.ogg') ? 'audio/ogg' : 'audio/mpeg'
      audio.appendChild(source)
    }
    audio.preload = 'auto'
    audio.volume = key === 'login' ? 0.5 : 0.6
    this.players[key] = audio
    return audio
  }

  private async primePlayers() {
    const keys: SoundKey[] = ['message', 'notify', 'login']
    await Promise.all(
      keys.map(async (k) => {
        const a = this.getPlayer(k)
        if (!a) return
        try {
          a.muted = true
          await a.play()
          a.pause()
          a.currentTime = 0
        } catch {
          // ignore browser autoplay restrictions
        } finally {
          a.muted = false
        }
      })
    )
  }

  private canPlay(): boolean {
    return useSoundStore.getState().soundEnabled
  }

  private play(key: SoundKey) {
    if (!this.canPlay()) return
    if (!this.unlocked) return
    const audio = this.getPlayer(key)
    if (!audio) return
    try {
      audio.currentTime = 0
      void audio.play()
    } catch {
      // ignore autoplay/runtime errors
    }
  }

  playMessage() {
    this.play('message')
  }

  playNotify() {
    this.play('notify')
  }

  playLogin() {
    this.play('login')
  }
}

export const soundService = SoundService.getInstance()
