'use client'

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

export function MessageList({ messages, loading, myId, messagesEndRef, typing }: MessageListProps) {
  const groups: { date: string; items: ChatMessage[] }[] = []
  let lastDate = ''
  for (const m of messages) {
    const d = new Date(m.createdAt)
    const dateKey = d.toDateString()
    if (dateKey !== lastDate) {
      lastDate = dateKey
      groups.push({ date: formatDay(d), items: [m] })
    } else {
      groups[groups.length - 1].items.push(m)
    }
  }

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
                <div
                  key={m.id}
                  className={cn('message', m.senderId === myId ? 'sent' : 'received')}
                >
                  <div className="message__text">{m.text}</div>
                  <div className="message__time">
                    {new Date(m.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
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
