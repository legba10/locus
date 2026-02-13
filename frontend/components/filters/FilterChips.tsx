'use client'

import { cn } from '@/shared/utils/cn'

export interface ChipOption {
  value: string
  label: string
}

export interface FilterChipsProps {
  options: readonly ChipOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export function FilterChips({ options, value, onChange, label, className }: FilterChipsProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <span className="block text-[13px] font-medium text-[var(--text-secondary)]">{label}</span>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-[14px] px-4 py-2.5 text-[14px] font-medium transition-colors',
              'border-2',
              value === opt.value
                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--button-primary-text)]'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)] hover:border-[var(--accent)]/50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
