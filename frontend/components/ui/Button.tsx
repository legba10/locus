'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * TZ-4: Единая кнопка. Только токены (--accent, --text-primary, --danger и т.д.).
 * Все кнопки сайта — через этот компонент.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, disabled, ...props }, ref) => {
    const base = 'rounded-[14px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[var(--accent)] text-white hover:opacity-90 active:opacity-95 shadow-[var(--shadow-card)]',
      secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--card-hover)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]',
      outline: 'bg-transparent border-2 border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
      danger: 'bg-[var(--danger)] text-white hover:opacity-90 active:opacity-95',
    }

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-4 py-2 text-[13px]',
      md: 'px-5 py-3 text-[14px]',
      lg: 'px-6 py-3.5 text-[15px]',
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
