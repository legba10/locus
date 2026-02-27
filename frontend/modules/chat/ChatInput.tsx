'use client'

import { cn } from '@/shared/utils/cn'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  sending: boolean
  bottomOffset: number
  useStickyLayout?: boolean
}

export function ChatInput({ value, onChange, onSend, sending, bottomOffset, useStickyLayout }: ChatInputProps) {
  const hasText = value.trim().length > 0

  return (
    <div
      className={cn(
        'chat-input-wrapper',
        useStickyLayout && 'flex-shrink-0'
      )}
      style={useStickyLayout ? undefined : { paddingBottom: `calc(12px + env(safe-area-inset-bottom) + ${bottomOffset}px)` }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
        className="chat-input"
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Сообщение..."
          className="chat-input__field"
          style={{ fontSize: '16px' }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !hasText}
          className={cn('send-btn', hasText && !sending && 'active')}
          aria-label="Отправить"
        >
          {sending ? '…' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}
