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
      <div className="flex flex-wrap gap-2 filters-pill-tz10" data-testid="filter-chips" data-label={label ?? undefined} data-options-count={options.length}>
        {options.map((opt, index) => (
          <button
            key={`filter-chip-${opt.value === '' ? '_any' : opt.value}-${index}`}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'filter-chip rounded-full px-3 py-1.5 min-h-[36px] text-[13px] font-medium transition-colors border',
              value === opt.value && 'selected',
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
