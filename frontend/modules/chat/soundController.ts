'use client'

import { soundService } from '@/services/soundService'

export interface IncomingMessageSoundContext {
  incomingChatId: string
  activeChatId: string | null
  senderId: string
  currentUserId: string
}

export function initChatSoundController() {
  soundService.bindUnlockOnFirstInteraction()
}

export function playMessageSoundWhenAllowed(ctx: IncomingMessageSoundContext) {
  const isOwnMessage = ctx.senderId === ctx.currentUserId
  const isSameChat = Boolean(ctx.activeChatId) && ctx.activeChatId === ctx.incomingChatId
  const isActiveTab = typeof document !== 'undefined' && document.visibilityState === 'visible'

  if (isOwnMessage) return
  if (!isActiveTab) return
  if (isSameChat) return
  soundService.playMessage()
}
