'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

/** ТЗ-4: единый Textarea. Только токены. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-small font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-[14px] px-4 py-3 text-body min-h-[100px]',
            'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-y',
            error && 'border-[var(--danger)]',
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
Textarea.displayName = 'Textarea'
