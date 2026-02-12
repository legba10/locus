'use client'

import { cn } from '@/shared/utils/cn'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/**
 * Input — Единый компонент для всех input полей
 * Использует дизайн-систему tokens
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-[14px] px-4 py-3',
            'bg-[var(--input-bg)] border border-[var(--border-primary)] text-[var(--text-primary)] text-[14px]',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
              : 'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
            'focus:outline-none',
            'transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[12px] text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
