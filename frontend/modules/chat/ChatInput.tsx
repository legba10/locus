'use client'

import { cn } from '@/shared/utils/cn'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  sending: boolean
  bottomOffset: number
}

export function ChatInput({ value, onChange, onSend, sending, bottomOffset }: ChatInputProps) {
  return (
    <footer
      className="fixed left-0 right-0 z-20 border-t border-[var(--border-main)] bg-[var(--card-bg)] p-3"
      style={{ bottom: `${bottomOffset}px` }}
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
          className="rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] px-5 py-3 text-[14px] font-semibold disabled:opacity-50"
        >
          {sending ? '…' : 'Отправить'}
        </button>
      </form>
    </footer>
  )
}
