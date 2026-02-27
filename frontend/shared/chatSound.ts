'use client'

import { soundEngine } from '@/services/soundEngine'

export interface IncomingMessageSoundContext {
  incomingChatId: string
  activeChatId: string | null
  senderId: string
  currentUserId: string
}

export function initChatSoundController() {
  soundEngine.init()
  soundEngine.bindUnlockOnFirstInteraction()
}

export function playMessageSoundWhenAllowed(ctx: IncomingMessageSoundContext) {
  const isOwnMessage = ctx.senderId === ctx.currentUserId
  const isSameChat = Boolean(ctx.activeChatId) && ctx.activeChatId === ctx.incomingChatId
  const isActiveTab = typeof document !== 'undefined' && document.visibilityState === 'visible'

  if (isOwnMessage) return
  if (!isActiveTab) return
  if (isSameChat) return
  soundEngine.playMessage()
}
