'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

/** ТЗ-4: Checkbox. Цвета через токены (accent, border). */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const uid = id ?? `checkbox-${Math.random().toString(36).slice(2)}`
    return (
      <label
        htmlFor={uid}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer text-body text-[var(--text-primary)]',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          id={uid}
          className={cn(
            'w-5 h-5 rounded border-2 border-[var(--border)]',
            'accent-[var(--accent)] text-[var(--accent)]',
            'focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none',
            'disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'
