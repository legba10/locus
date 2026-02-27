'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  listingId?: string
  listingTitle?: string
  listingPhotoUrl?: string
}

export function ChatPage({ chatId, title = 'Чат', onBack, embedded = false, listingId, listingTitle, listingPhotoUrl }: ChatPageProps) {
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

  const showListingPreview = listingId || listingTitle || listingPhotoUrl

  return (
    <section className={`chat-page ${embedded ? 'embedded h-full' : 'h-[100vh]'} flex flex-col bg-[var(--card-bg)]`}>
      <header className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-[var(--border-main)]">
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
      {showListingPreview && (
        <div className="chat-listing-preview flex-shrink-0">
          {listingId ? (
            <Link href={`/listings/${listingId}`} className="flex items-center gap-3 w-full text-left">
              {listingPhotoUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
                  <Image src={listingPhotoUrl} alt="" fill className="object-cover" sizes="48px" />
                </div>
              )}
              {listingTitle && <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">{listingTitle}</span>}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {listingPhotoUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
                  <Image src={listingPhotoUrl} alt="" fill className="object-cover" sizes="48px" />
                </div>
              )}
              {listingTitle && <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">{listingTitle}</span>}
            </div>
          )}
        </div>
      )}
      <div className="chat-messages min-h-0">
        <MessageList messages={messages} loading={loading} myId={myId} listRef={listRef} onScroll={onScroll} />
      </div>
      <ChatInput value={input} onChange={setInput} onSend={send} sending={sending} bottomOffset={keyboardOffset} useStickyLayout />
    </section>
  )
}
