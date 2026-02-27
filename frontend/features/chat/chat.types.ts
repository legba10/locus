/**
 * TZ-74: типы чата. Единый контракт.
 */

export interface ChatUser {
  id: string
  name: string
  avatar?: string
}

export interface ChatAd {
  id: string
  title: string
  image?: string
}

export interface ChatMessageType {
  id: string
  senderId: string
  text: string
  createdAt: string
}
