'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * ТЗ-4 БЛОК 2: Единая кнопка. Не создавать кнопки inline.
 * primary: градиент, 52px mobile / 48px desktop, radius 16px
 * secondary: прозрачная, обводка var(--border)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, disabled, ...props }, ref) => {
    const base =
      'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center'

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-[var(--accent)] text-white rounded-[16px] shadow-[var(--shadow-card)] hover:opacity-90 active:opacity-95 min-h-[52px] md:min-h-[48px] h-[52px] md:h-[48px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]',
      secondary:
        'bg-transparent border-2 border-[var(--border)] text-[var(--text-main)] rounded-[16px] hover:bg-[var(--bg-glass)] min-h-[52px] md:min-h-[48px] h-[52px] md:h-[48px]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] rounded-[16px] hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)] min-h-[52px] md:min-h-[48px] h-[52px] md:h-[48px]',
      icon:
        'bg-transparent text-[var(--text-main)] rounded-full p-2 w-10 h-10 min-h-0 [&>svg]:w-6 [&>svg]:h-6',
      outline:
        'bg-transparent border-2 border-[var(--border)] text-[var(--text-main)] rounded-[16px] hover:bg-[var(--bg-glass)] min-h-[52px] md:min-h-[48px] h-[52px] md:h-[48px]',
      danger:
        'bg-[var(--danger)] text-white rounded-[16px] hover:opacity-90 min-h-[52px] md:min-h-[48px] h-[52px] md:h-[48px]',
    }

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-4 py-2 text-[13px] min-h-0 h-auto',
      md: 'px-5 py-3 text-[14px]',
      lg: 'px-6 py-3.5 text-[15px] min-h-0 h-auto',
    }

    const isIcon = variant === 'icon'
    const sizeClass = isIcon ? '' : sizes[size]

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(base, variants[variant], !isIcon && sizeClass, className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
