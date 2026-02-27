'use client'

import React, { useMemo } from 'react'
import { cn } from '@/shared/utils/cn'

export type ChatMessage = {
  id: string
  text: string
  senderId: string
  createdAt: string
}

interface MessageListProps {
  messages: ChatMessage[]
  loading: boolean
  myId: string
  messagesEndRef?: React.RefObject<HTMLDivElement>
  /** TZ-64: индикатор «печатает…» */
  typing?: boolean
}

function formatDay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Вчера'
  if (diff < 7) return d.toLocaleDateString('ru', { weekday: 'long' })
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
}

/** TZ-67: мемоизированное сообщение — не перерисовывать весь список при новых сообщениях */
const Message = React.memo(function Message({
  id,
  text,
  senderId,
  createdAt,
  myId,
}: ChatMessage & { myId: string }) {
  const time = useMemo(
    () => new Date(createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    [createdAt]
  )
  return (
    <div className={cn('message', senderId === myId ? 'sent' : 'received')}>
      <div className="message__text">{text}</div>
      <div className="message__time">{time}</div>
    </div>
  )
})

export function MessageList({ messages, loading, myId, messagesEndRef, typing }: MessageListProps) {
  const groups = useMemo(() => {
    const out: { date: string; items: ChatMessage[] }[] = []
    let lastDate = ''
    for (const m of messages) {
      const d = new Date(m.createdAt)
      const dateKey = d.toDateString()
      if (dateKey !== lastDate) {
        lastDate = dateKey
        out.push({ date: formatDay(d), items: [m] })
      } else {
        out[out.length - 1].items.push(m)
      }
    }
    return out
  }, [messages])

  return (
    <div className="chat-messages-inner">
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn('message', i % 2 ? 'received' : 'sent')}
              style={{ width: '60%', height: 48 }}
            />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="chat-messages-empty">Сообщений пока нет</div>
      ) : (
        <>
          {groups.map((g) => (
            <div key={g.date} className="chat-messages-group">
              <div className="chat-messages-date">{g.date}</div>
              {g.items.map((m) => (
                <Message key={m.id} {...m} myId={myId} />
              ))}
            </div>
          ))}
          {typing && (
            <div className="message received message--typing">
              <span className="message__typing-dots">печатает…</span>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} aria-hidden className="chat-messages-end" />
    </div>
  )
}
