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
  /** TZ-58: ref для scrollIntoView к последнему сообщению */
  messagesEndRef?: React.RefObject<HTMLDivElement>
}

export function MessageList({ messages, loading, myId, messagesEndRef }: MessageListProps) {
  return (
    <div className="space-y-2">
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn('message-bubble', i % 2 ? 'message-bubble--other' : 'message-bubble--own ml-auto')}
              style={{ width: '60%', height: 48 }}
            />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center text-[14px] text-[var(--text-secondary)] py-8">Сообщений пока нет</div>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'message-bubble',
              m.senderId === myId ? 'message-bubble--own' : 'message-bubble--other'
            )}
          >
            <div>{m.text}</div>
            <div className="message-bubble__time">
              {new Date(m.createdAt).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} aria-hidden />
    </div>
  )
}
