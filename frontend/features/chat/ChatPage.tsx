'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { useAuthStore } from '@/domains/auth'
import type { ChatUser, ChatAd, ChatMessageType } from './chat.types'
import ChatLayout from './ChatLayout'
import ChatHeader from './ChatHeader'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import layoutStyles from './chat.module.css'

export interface ChatPageProps {
  chatId: string
  user: ChatUser
  ad: ChatAd
  onBack?: () => void
}

function mapApiMessage(m: { id: string; text: string; senderId: string; createdAt: string }): ChatMessageType {
  return {
    id: m.id,
    senderId: m.senderId,
    text: m.text,
    createdAt: m.createdAt,
  }
}

export default function ChatPage({ chatId, user, ad, onBack }: ChatPageProps) {
  const { user: authUser } = useAuthStore()
  const myId = authUser?.id ?? ''
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    const res = await apiFetchJson<{ messages?: Array<{ id: string; text: string; senderId: string; createdAt: string }> }>(
      `/chats/${chatId}/messages`
    )
    const list = Array.isArray(res?.messages) ? res.messages : []
    return list.map(mapApiMessage)
  }, [chatId])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    loadMessages()
      .then((next) => {
        if (mounted) setMessages(next)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      try {
        const msg = await apiFetchJson<{ id: string; text: string; senderId: string; createdAt: string }>(
          `/chats/${chatId}/messages`,
          { method: 'POST', body: JSON.stringify({ text: trimmed }) }
        )
        if (msg) setMessages((prev) => [...prev, mapApiMessage(msg)])
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      } catch {
        // ignore
      }
    },
    [chatId]
  )

  return (
    <ChatLayout
      header={<ChatHeader user={user} ad={ad} onBack={onBack} />}
      messages={
        <>
          {loading ? (
            <div className={layoutStyles.loading}>Загрузка...</div>
          ) : (
            messages.map((m) => (
              <ChatMessage key={m.id} message={m} isMine={m.senderId === myId} />
            ))
          )}
          <div ref={messagesEndRef} aria-hidden />
        </>
      }
      input={<ChatInput onSend={handleSend} />}
    />
  )
}
