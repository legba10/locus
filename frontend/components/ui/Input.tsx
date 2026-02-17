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
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 rounded-[12px] px-4 text-[15px]',
            'bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)]',
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
