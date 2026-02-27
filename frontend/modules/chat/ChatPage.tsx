'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { useAuthStore } from '@/domains/auth'
import { useAutoScroll } from './useAutoScroll'
import { useKeyboard } from './useKeyboard'
import { ChatHeader } from './ChatHeader'
import { ChatListingPreview } from './ChatListingPreview'
import { ChatInput } from './ChatInput'
import { MessageList, type ChatMessage } from './MessageList'
import { initChatSoundController } from './soundController'

export interface ChatPageProps {
  chatId: string
  title?: string
  onBack?: () => void
  embedded?: boolean
  listingId?: string
  listingTitle?: string
  listingPhotoUrl?: string
  listingPrice?: string
  /** Статус в header: «Онлайн», «Был(а) недавно» */
  statusLabel?: string
  /** Аватар собеседника */
  avatarUrl?: string | null
  /** Индикатор «печатает…» */
  typing?: boolean
}

export function ChatPage({
  chatId,
  title = 'Чат',
  onBack,
  embedded = false,
  listingId,
  listingTitle,
  listingPhotoUrl,
  listingPrice,
  statusLabel = 'Был(а) недавно',
  avatarUrl,
  typing = false,
}: ChatPageProps) {
  const { user } = useAuthStore()
  const myId = user?.id ?? ''
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const { keyboardOffset } = useKeyboard({ containerRef })
  const { listRef, onScroll, scrollToBottom, scrollOnNewMessage } = useAutoScroll()
  const lastMessageIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    const res = await apiFetchJson<{ messages?: ChatMessage[] }>(`/chats/${chatId}/messages`)
    const next = Array.isArray(res?.messages) ? res.messages : []
    setMessages(next)
    return next
  }, [chatId])

  useEffect(() => {
    initChatSoundController()
  }, [])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    void loadMessages()
      .then(() => {
        if (!mounted) return
        requestAnimationFrame(() => {
          scrollToBottom('auto')
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
        })
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [chatId, loadMessages, scrollToBottom])

  useEffect(() => {
    scrollToBottom('smooth')
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (keyboardOffset > 0) {
      requestAnimationFrame(() => {
        scrollToBottom('smooth')
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [keyboardOffset, scrollToBottom])

  useEffect(() => {
    const timer = setInterval(() => {
      void loadMessages().then((next) => {
        const last = next[next.length - 1]
        if (!last) return
        if (!lastMessageIdRef.current) {
          lastMessageIdRef.current = last.id
          return
        }
        if (last.id !== lastMessageIdRef.current) {
          lastMessageIdRef.current = last.id
          scrollOnNewMessage('smooth')
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      })
    }, 4000)
    return () => clearInterval(timer)
  }, [loadMessages, scrollOnNewMessage])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    try {
      const msg = await apiFetchJson<ChatMessage>(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setMessages((prev) => [...prev, msg])
      requestAnimationFrame(() => {
        scrollToBottom('smooth')
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  const headerTitle = listingTitle || title

  return (
    <section
      ref={containerRef}
      className={`chat-page chat-container ${embedded ? 'embedded' : ''}`}
    >
      <ChatHeader
        title={headerTitle}
        onBack={onBack}
        statusLabel={statusLabel}
        avatarUrl={avatarUrl}
      />
      <ChatListingPreview
        listingId={listingId}
        listingTitle={listingTitle}
        listingPhotoUrl={listingPhotoUrl}
        listingPrice={listingPrice}
        sticky
      />
      <div className="chat-messages" ref={listRef} onScroll={onScroll}>
        <MessageList
          messages={messages}
          loading={loading}
          myId={myId}
          messagesEndRef={messagesEndRef}
          typing={typing}
        />
      </div>
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={send}
        sending={sending}
        bottomOffset={keyboardOffset}
        useStickyLayout
      />
    </section>
  )
}
