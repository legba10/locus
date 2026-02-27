'use client'

import { cn } from '@/shared/utils/cn'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  sending: boolean
  bottomOffset: number
  /** TZ-55: sticky inside chat flex layout instead of fixed */
  useStickyLayout?: boolean
}

export function ChatInput({ value, onChange, onSend, sending, bottomOffset, useStickyLayout }: ChatInputProps) {
  return (
    <footer
      className={cn(
        'chat-input',
        useStickyLayout ? 'flex-shrink-0' : 'fixed left-0 right-0 z-20'
      )}
      style={useStickyLayout ? undefined : { bottom: `${bottomOffset}px` }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
        className="mx-auto max-w-[980px] flex items-center gap-2"
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Сообщение..."
          className={cn(
            'flex-1 rounded-[14px] border border-[var(--border-main)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'
          )}
          style={{ fontSize: '16px' }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !value.trim()}
          className="btn-secondary rounded-[14px] px-5 py-3 text-[14px] font-semibold disabled:opacity-50 min-h-0 h-auto"
        >
          {sending ? '…' : 'Отправить'}
        </button>
      </form>
    </footer>
  )
}
