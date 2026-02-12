'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/** ТЗ-4: единый Input. Только токены: --input-bg (alias bg-secondary), --border, --text-primary */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-small font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-[14px] px-4 py-3 text-body',
            'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-caption text-[var(--danger)]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
