'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

/** ТЗ-4: единый Select. Только токены. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-small font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full rounded-[14px] px-4 py-3 text-body',
            'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            error && 'border-[var(--danger)]',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-caption text-[var(--danger)]">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
