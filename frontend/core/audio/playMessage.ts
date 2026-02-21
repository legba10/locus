'use client'

import { playCoreAudio } from '@/core/audio/audioEngine'

export function playMessage(): void {
  playCoreAudio('message')
}
