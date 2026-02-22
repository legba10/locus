'use client'

import { soundEngine } from './soundEngine'

// Backward-compatible facade. New integrations should use soundEngine directly.
export const soundService = {
  bindUnlockOnFirstInteraction: () => soundEngine.bindUnlockOnFirstInteraction(),
  playMessage: () => soundEngine.playMessage(),
  playNotify: () => soundEngine.playNotify(),
  playLogin: () => soundEngine.playLogin(),
}
