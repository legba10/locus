'use client'

import { cn } from '@/shared/utils/cn'

export interface AIModeSwitchProps {
  aiMode: boolean
  onChange: (on: boolean) => void
  className?: string
}

export function AIModeSwitch({ aiMode, onChange, className }: AIModeSwitchProps) {
  return (
    <div className={cn('aim-mode-switch rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-4', className)}>
      <span className="block text-[13px] font-medium text-[var(--text-secondary)] mb-3">Режим поиска</span>
      <div className="flex rounded-[14px] p-1 bg-[var(--bg-glass)]">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'flex-1 rounded-[12px] py-2.5 text-[14px] font-semibold transition-colors',
            aiMode
              ? 'bg-[var(--accent)] text-[var(--button-primary-text)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
          )}
        >
          Умный подбор
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'flex-1 rounded-[12px] py-2.5 text-[14px] font-semibold transition-colors',
            !aiMode
              ? 'bg-[var(--accent)] text-[var(--button-primary-text)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
          )}
        >
          Ручной поиск
        </button>
      </div>
      <p className="mt-2 text-[12px] text-[var(--text-secondary)]">
        {aiMode ? 'AI подберёт варианты под ваш бюджет и параметры' : 'Показываем все объявления по фильтрам'}
      </p>
    </div>
  )
}
