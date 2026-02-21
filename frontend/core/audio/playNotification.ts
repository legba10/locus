'use client'

import { playCoreAudio } from '@/core/audio/audioEngine'

export function playNotification(): void {
  playCoreAudio('notification')
}
