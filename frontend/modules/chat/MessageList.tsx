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
  listRef: React.RefObject<HTMLDivElement>
  onScroll: () => void
}

export function MessageList({ messages, loading, myId, listRef, onScroll }: MessageListProps) {
  return (
    <div
      ref={listRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
      style={{ paddingBottom: '80px' }}
    >
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn('h-12 rounded-[14px] max-w-[85%]', i % 2 ? 'bg-[var(--bg-secondary)]' : 'ml-auto bg-[var(--accent)]/20')} />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center text-[14px] text-[var(--text-secondary)] py-8">Сообщений пока нет</div>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'message max-w-[85%] text-[14px]',
              m.senderId === myId
                ? 'ml-auto bg-[var(--accent)] text-[var(--button-primary-text)]'
                : 'mr-auto bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-main)]'
            )}
            style={{ margin: '6px 0', padding: '10px 14px', borderRadius: 14 }}
          >
            <div>{m.text}</div>
            <div className={cn('text-[11px] mt-1', m.senderId === myId ? 'text-[var(--text-on-accent)]' : 'text-[var(--text-secondary)]')}>
              {new Date(m.createdAt).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
