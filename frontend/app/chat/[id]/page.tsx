'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import Link from 'next/link'

type Message = {
  id: string
  text: string
  senderId: string
  createdAt: string
  sender?: { profile?: { name?: string | null } }
}

export default function ChatPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? ''
  const { isAuthenticated, user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: conv } = useFetch<{
    id: string
    listingTitle?: string
    host?: { id: string }
    guest?: { id: string }
  }>(['chat-meta', id], `/chats/${id}`, { enabled: !!id && isAuthenticated() })
  const myId = user?.id

  const fetchMessages = useCallback(() => {
    if (!id || !isAuthenticated()) return
    apiFetchJson<{ messages: Message[]; hasMore: boolean }>(`/chats/${id}/messages`)
      .then((res) => {
        setMessages(res.messages ?? [])
        setHasMore(res.hasMore ?? false)
      })
      .catch(() => setMessages([]))
  }, [id, isAuthenticated])

  useEffect(() => {
    if (!id || !isAuthenticated()) return
    let cancelled = false
    setLoading(true)
    apiFetchJson<{ messages: Message[]; hasMore: boolean }>(`/chats/${id}/messages`)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.messages ?? [])
          setHasMore(res.hasMore ?? false)
        }
      })
      .catch(() => { if (!cancelled) setMessages([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, isAuthenticated])

  useEffect(() => {
    if (!id || !isAuthenticated()) return
    const interval = setInterval(fetchMessages, 4000)
    return () => clearInterval(interval)
  }, [id, isAuthenticated, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!id || !isAuthenticated()) return
    apiFetchJson(`/chats/${id}/read`, { method: 'POST' }).catch(() => {})
  }, [id, isAuthenticated])

  if (!isAuthenticated()) {
    router.push(`/auth/login?redirect=${encodeURIComponent(`/chat/${id}`)}`)
    return null
  }

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    try {
      const msg = await apiFetchJson<Message>(`/chats/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setMessages((prev) => [...prev, msg])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <header className="sticky top-0 z-10 bg-white/95 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/messages" className="text-violet-600 text-[14px] font-medium">← Сообщения</Link>
        <span className="flex-1 font-semibold text-[#1C1F26] truncate">{conv?.listingTitle ?? 'Чат'}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn('h-12 rounded-2xl w-3/4 max-w-xs animate-pulse', i % 2 === 0 ? 'ml-auto bg-violet-100' : 'bg-gray-100')} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-[14px] text-[#6B7280] text-center py-8">Пока нет сообщений. Напишите первым.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px]',
                m.senderId === myId ? 'ml-auto bg-violet-600 text-white' : 'mr-auto bg-gray-100 text-[#1C1F26]'
              )}
            >
              <div>{m.text}</div>
              <div className={cn('text-[11px] mt-1', m.senderId === myId ? 'text-violet-200' : 'text-gray-500')}>
                {new Date(m.createdAt).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="sticky bottom-0 bg-white border-t border-gray-100 p-3 safe-area-pb">
        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Сообщение..."
            className="flex-1 rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-[14px] bg-violet-600 text-white px-5 py-3 font-semibold text-[14px] disabled:opacity-50"
          >
            {sending ? '…' : 'Отправить'}
          </button>
        </form>
      </footer>
    </div>
  )
}
