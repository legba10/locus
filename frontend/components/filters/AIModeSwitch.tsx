'use client'

import { cn } from '@/shared/utils/cn'

export interface AIModeSwitchProps {
  aiMode: boolean
  onChange: (on: boolean) => void
  className?: string
}

export function AIModeSwitch({ aiMode, onChange, className }: AIModeSwitchProps) {
  return (
    <div className={cn('aim-mode-switch rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3', className)}>
      <span className="block text-[12px] font-medium text-[var(--text-secondary)] mb-2">Режим поиска</span>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'rounded-full min-h-[36px] px-4 py-1.5 text-[13px] font-medium transition-colors border',
            aiMode
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent'
              : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/50'
          )}
        >
          Умный подбор
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'rounded-full min-h-[36px] px-4 py-1.5 text-[13px] font-medium transition-colors border',
            !aiMode
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent'
              : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/50'
          )}
        >
          Ручной поиск
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">
        {aiMode ? 'AI подберёт варианты под ваш бюджет и параметры' : 'Показываем все объявления по фильтрам'}
      </p>
    </div>
  )
}
