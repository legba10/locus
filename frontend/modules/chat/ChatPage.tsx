'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { useAuthStore } from '@/domains/auth'
import { useAutoScroll } from './useAutoScroll'
import { useKeyboard } from './useKeyboard'
import { ChatInput } from './ChatInput'
import { MessageList, type ChatMessage } from './MessageList'
import { initChatSoundController } from './soundController'

interface ChatPageProps {
  chatId: string
  title?: string
  onBack?: () => void
  embedded?: boolean
}

export function ChatPage({ chatId, title = 'Чат', onBack, embedded = false }: ChatPageProps) {
  const { user } = useAuthStore()
  const myId = user?.id ?? ''
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { keyboardOffset } = useKeyboard()
  const { listRef, onScroll, scrollToBottom, scrollOnNewMessage } = useAutoScroll()
  const lastMessageIdRef = useRef<string | null>(null)

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
        requestAnimationFrame(() => scrollToBottom('auto'))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [chatId, loadMessages, scrollToBottom])

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
      requestAnimationFrame(() => scrollToBottom('smooth'))
    } catch {
      // ignore, existing error handling is noisy in chat flow
    } finally {
      setSending(false)
    }
  }

  return (
    <section className={`chatPage ${embedded ? 'h-full' : 'h-[100vh]'} flex flex-col bg-[var(--card-bg)]`}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-main)]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-2 text-[var(--accent)] hover:bg-[var(--bg-secondary)]"
            aria-label="Назад"
          >
            ←
          </button>
        )}
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] truncate">{title}</h2>
      </header>
      <MessageList messages={messages} loading={loading} myId={myId} listRef={listRef} onScroll={onScroll} />
      <ChatInput value={input} onChange={setInput} onSend={send} sending={sending} bottomOffset={keyboardOffset} />
    </section>
  )
}
