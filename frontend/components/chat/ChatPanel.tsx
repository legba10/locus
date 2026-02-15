'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'

export type Message = {
  id: string
  text: string
  senderId: string
  createdAt: string
  sender?: { profile?: { name?: string | null } }
}

/** ТЗ-12: базовые шаблоны подсказок (без эмодзи, стиль сайта) */
const QUICK_SUGGESTIONS_BASE = [
  'Здравствуйте! Можно забронировать жильё?',
  'Свободно ли на эти даты?',
  'Можно посмотреть квартиру сегодня?',
  'Подскажите, какая окончательная цена?',
  'Можно заселиться раньше?',
  'Есть ли парковка?',
  'Подходит ли для долгого проживания?',
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
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  /** Скроллить вниз только при открытии и после отправки */
  const shouldScrollToBottomRef = useRef(true)

  /** ТЗ-12: подсказки показывать, пока пользователь ещё не отправлял сообщений в этом чате */
  const hasUserSent = messages.some((m) => m.senderId === myId)
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
    listingTitle?: string
    host?: { id: string }
    guest?: { id: string }
  }>(['chat-meta', chatId], `/chats/${chatId}`, { enabled: !!chatId && isAuthenticated() })
  const myId = user?.id

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  const fetchMessages = useCallback(() => {
    if (!chatId || !isAuthenticated()) return
    apiFetchJson<{ messages: Message[]; hasMore: boolean }>(`/chats/${chatId}/messages`)
      .then((res) => {
        setMessages(res.messages ?? [])
        setHasMore(res.hasMore ?? false)
      })
      .catch(() => setMessages([]))
  }, [chatId, isAuthenticated])

  useEffect(() => {
    if (!chatId || !isAuthenticated()) return
    let cancelled = false
    setLoading(true)
    shouldScrollToBottomRef.current = true
    apiFetchJson<{ messages: Message[]; hasMore: boolean }>(`/chats/${chatId}/messages`)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.messages ?? [])
          setHasMore(res.hasMore ?? false)
        }
      })
      .catch(() => { if (!cancelled) setMessages([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [chatId, isAuthenticated])

  useEffect(() => {
    if (!chatId || !isAuthenticated()) return
    const interval = setInterval(fetchMessages, 4000)
    return () => clearInterval(interval)
  }, [chatId, isAuthenticated, fetchMessages])

  /** ТЗ-11: автоскролл только после первой загрузки и после отправки; не при каждом обновлении messages */
  useEffect(() => {
    if (!loading && shouldScrollToBottomRef.current) {
      scrollToBottom('auto')
      shouldScrollToBottomRef.current = false
    }
  }, [loading, scrollToBottom])

  useEffect(() => {
    if (!chatId || !isAuthenticated()) return
    apiFetchJson(`/chats/${chatId}/read`, { method: 'POST' }).catch(() => {})
  }, [chatId, isAuthenticated])

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
      setMessages((prev) => [...prev, msg])
      shouldScrollToBottomRef.current = true
      setTimeout(() => scrollToBottom('smooth'), 50)
    } finally {
      setSending(false)
    }
  }

  const title = conv?.listingTitle ?? 'Чат'

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

      {/* Область сообщений: скролл только здесь */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-3"
      >
        {loading ? (
          <div className="space-y-3" data-testid="chat-skeleton">
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
        ) : messages.length === 0 ? (
          <p className="text-[14px] text-[var(--text-secondary)] text-center py-8">Пока нет сообщений. Напишите первым.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px]',
                m.senderId === myId
                  ? 'ml-auto bg-[var(--accent)] text-[var(--button-primary-text)]'
                  : 'mr-auto bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border)]'
              )}
            >
              <div>{m.text}</div>
              <div className={cn('text-[11px] mt-1', m.senderId === myId ? 'text-white/80' : 'text-[var(--text-secondary)]')}>
                {new Date(m.createdAt).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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

      {/* Поле ввода: sticky bottom, не прыгает */}
      <footer className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--card-bg)] p-3 safe-area-pb">
        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Сообщение..."
            className="flex-1 rounded-[14px] border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-main)] px-4 py-3 text-[14px] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] px-5 py-3 font-semibold text-[14px] disabled:opacity-50"
          >
            {sending ? '…' : 'Отправить'}
          </button>
        </form>
      </footer>
    </div>
  )
}
