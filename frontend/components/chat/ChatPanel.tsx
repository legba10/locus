'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import { playSound } from '@/lib/system/soundManager'

export type Message = {
  id: string
  text: string
  senderId: string
  createdAt: string
  sender?: { profile?: { name?: string | null } }
}

/** ТЗ-7: шаблоны при открытии диалога — по нажатию вставляются в поле */
const QUICK_SUGGESTIONS_BASE = [
  'Можно забронировать на сегодня?',
  'Квартира свободна?',
  'На длительный срок можно?',
]

export interface ChatPanelProps {
  chatId: string
  /** Мобилка: кнопка «Назад» в шапке */
  onBack?: () => void
  /** Встроенный режим (правая колонка на ПК) — без полной высоты */
  embedded?: boolean
  /** ТЗ-12: даты из объявления — добавить подсказку "Хочу забронировать на X–Y" */
  suggestedCheckIn?: string
  suggestedCheckOut?: string
}

/** ТЗ-11: автоскролл только при первой загрузке и после отправки; при листании вверх не скроллить */
export function ChatPanel({ chatId, onBack, embedded = false, suggestedCheckIn, suggestedCheckOut }: ChatPanelProps) {
  const { isAuthenticated, user } = useAuthStore()
  const myId = user?.id ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  /** ТЗ-8: скролл вниз только 1 раз при открытии диалога, не при каждом ререндере */
  const initialScrollDoneRef = useRef(false)
  const shouldScrollToBottomRef = useRef(true)
  const lastIncomingMessageIdRef = useRef<string | null>(null)

  /** ТЗ-12: подсказки показывать, пока пользователь ещё не отправлял сообщений в этом чате */
  const hasUserSent = (messages ?? []).some((m) => m.senderId === myId)
  const showSuggestions = !loading && !hasUserSent

  /** ТЗ-12: список подсказок — базовые + динамическая с датами при переходе из объявления */
  const suggestions = [...QUICK_SUGGESTIONS_BASE]
  if (suggestedCheckIn && suggestedCheckOut) {
    const from = new Date(suggestedCheckIn)
    const to = new Date(suggestedCheckOut)
    const fmt = (d: Date) => d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
    suggestions.unshift(`Здравствуйте! Хочу забронировать на ${fmt(from)}–${fmt(to)}.`)
  }

  const { data: conv } = useFetch<{
    id: string
    listingId?: string
    listingTitle?: string
    listingPhotoUrl?: string
    listingAddress?: string
    host?: { id: string }
    guest?: { id: string }
  }>(['chat-meta', chatId], `/chats/${chatId}`, { enabled: !!chatId && isAuthenticated() })

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  const fetchMessages = useCallback(() => {
    if (!chatId || !isAuthenticated()) return
    apiFetchJson<{ messages?: Message[]; hasMore?: boolean }>(`/chats/${chatId}/messages`)
      .then((res) => {
        const list = Array.isArray(res?.messages) ? res.messages : []
        setMessages(list)
        setHasMore(Boolean(res?.hasMore))
      })
      .catch((e) => {
        console.warn('chat poll error', e)
        setMessages((prev) => prev ?? [])
      })
  }, [chatId, isAuthenticated])

  /** ТЗ-15: один запрос при монтировании, mounted-флаг — без двойного рендера и падений */
  useEffect(() => {
    if (!chatId || !isAuthenticated()) return
    let mounted = true
    initialScrollDoneRef.current = false
    setLoading(true)
    shouldScrollToBottomRef.current = true

    const load = async () => {
      try {
        const res = await apiFetchJson<{ messages?: Message[]; hasMore?: boolean }>(`/chats/${chatId}/messages`)
        if (!mounted) return
        const list = Array.isArray(res?.messages) ? res.messages : []
        setMessages(list)
        setHasMore(Boolean(res?.hasMore))
      } catch (e) {
        if (!mounted) return
        console.warn('chat load error', e)
        setMessages([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [chatId, isAuthenticated])

  useEffect(() => {
    if (!chatId || !isAuthenticated()) return
    const interval = setInterval(fetchMessages, 4000)
    return () => clearInterval(interval)
  }, [chatId, isAuthenticated, fetchMessages])

  /** ТЗ-15: автоскролл только раз после загрузки, по messages.length — не при каждом ререндере */
  const messagesLength = messages?.length ?? 0
  useEffect(() => {
    if (!messagesLength || loading || initialScrollDoneRef.current) return
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      initialScrollDoneRef.current = true
      shouldScrollToBottomRef.current = false
    }, 80)
    return () => clearTimeout(t)
  }, [messagesLength, loading])

  useEffect(() => {
    if (!messagesLength || loading) return
    requestAnimationFrame(() => {
      scrollToBottom('auto')
    })
  }, [messagesLength, loading, scrollToBottom])

  useEffect(() => {
    if (!chatId || !isAuthenticated()) return
    apiFetchJson(`/chats/${chatId}/read`, { method: 'POST' }).catch(() => {})
  }, [chatId, isAuthenticated])

  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) return
    const last = messages[messages.length - 1]
    if (!last || !last.id) return
    if (last.senderId === myId) return
    if (lastIncomingMessageIdRef.current === last.id) return
    lastIncomingMessageIdRef.current = last.id
    playSound('message')
  }, [messages, myId])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    try {
      const msg = await apiFetchJson<Message>(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      if (msg && typeof msg === 'object' && msg.id) {
        setMessages((prev) => Array.isArray(prev) ? [...prev, msg] : [msg])
      }
      shouldScrollToBottomRef.current = true
      setTimeout(() => scrollToBottom('smooth'), 80)
    } catch (e) {
      console.warn('chat send error', e)
    } finally {
      setSending(false)
    }
  }

  const title = (conv && typeof conv === 'object' && conv.listingTitle) ? conv.listingTitle : 'Чат'

  /** ТЗ-5: safe-guards после всех хуков — не падать при отсутствии user/chatId */
  if (!user) {
    return (
      <div className="flex flex-col bg-[var(--card-bg)] h-full min-h-0 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)] animate-spin" aria-hidden />
        </div>
      </div>
    )
  }
  if (!chatId) {
    return (
      <div className="flex flex-col bg-[var(--card-bg)] h-full min-h-0 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4 text-[var(--text-secondary)] text-[14px]">Выберите диалог</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-[var(--card-bg)] text-[var(--text-main)] h-full min-h-0 overflow-hidden',
        !embedded && 'messages-chat-tz11'
      )}
    >
      {/* Шапка: фиксированная, кнопка назад (мобилка) */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--card-bg)] safe-area-pt z-10">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-shrink-0 p-2 -ml-2 rounded-full text-[var(--accent)] hover:bg-[var(--bg-secondary)]"
            aria-label="Назад к списку"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <span className="flex-1 font-semibold text-[var(--text-main)] truncate">{title}</span>
      </header>

      {/* ТЗ-7: блок объявления — фото, адрес, перейти к объявлению */}
      {(conv?.listingId || conv?.listingPhotoUrl || conv?.listingTitle) && (
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
          {conv.listingPhotoUrl && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)]">
              <Image src={conv.listingPhotoUrl} alt="" fill className="object-cover" sizes="56px" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {conv.listingTitle && <p className="font-medium text-[var(--text-main)] truncate text-[14px]">{conv.listingTitle}</p>}
            {conv.listingAddress && <p className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5">{conv.listingAddress}</p>}
          </div>
          {conv.listingId && (
            <Link
              href={`/listing/${conv.listingId}`}
              className="flex-shrink-0 text-[13px] font-medium text-[var(--accent)] hover:underline"
            >
              К объявлению
            </Link>
          )}
        </div>
      )}

      {/* ТЗ-15: контейнер сообщений — overflow-y auto, height 100%, без overflow hidden */}
      <div
        ref={scrollContainerRef}
        className="chat-list flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-3"
        style={{ minHeight: 0 }}
      >
        {loading ? (
          <div className="space-y-3 animate-pulse" data-testid="chat-skeleton">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-14 rounded-2xl max-w-[85%] animate-pulse',
                  i % 2 === 0 ? 'ml-auto bg-[var(--accent)]/20' : 'mr-auto bg-[var(--bg-secondary)]'
                )}
              />
            ))}
          </div>
        ) : (messages?.length ?? 0) === 0 ? (
          <p className="text-[14px] text-[var(--text-secondary)] text-center py-8">Напишите первым</p>
        ) : (
          (messages ?? [])
            .filter((m) => m && typeof m === 'object' && m.id)
            .map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] transition-opacity duration-200',
                  m.senderId === myId
                    ? 'ml-auto bg-[var(--accent)] text-[var(--button-primary-text)]'
                    : 'mr-auto bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border)]'
                )}
              >
                <div>{m?.text ?? ''}</div>
                <div className={cn('text-[11px] mt-1', m.senderId === myId ? 'text-[var(--text-on-accent)]' : 'text-[var(--text-secondary)]')}>
                  {m?.createdAt ? new Date(m.createdAt).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ТЗ-12: быстрые подсказки — под чатом, над инпутом; скрываются после первого отправленного сообщения */}
      {showSuggestions && (
        <div className="chat-suggestions-tz12 flex-shrink-0 px-4 py-2 border-t border-[var(--border)] bg-[var(--card-bg)]">
          <div className="overflow-x-auto overflow-y-hidden pb-1 -mx-1 scrollbar-thin">
            <div className="flex gap-2 flex-nowrap min-w-0">
              {suggestions.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(text)}
                  className="chat-suggestions-tz12__chip flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-main)] bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--border)]/50 transition-colors whitespace-nowrap"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ТЗ-5: поле ввода фиксировано снизу, padding 16px, кнопка справа */}
      <footer className="sticky bottom-0 flex-shrink-0 border-t border-[var(--border)] bg-[var(--card-bg)] p-4 safe-area-pb">
        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          className="flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Сообщение..."
            className="flex-1 min-w-0 rounded-[14px] border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-main)] px-4 py-3 text-[16px] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex-shrink-0 rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] px-5 py-3 font-semibold text-[14px] disabled:opacity-50"
          >
            {sending ? '…' : 'Отправить'}
          </button>
        </form>
      </footer>
    </div>
  )
}
