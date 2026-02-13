'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** TZ-5: loading state — spinner + aria-busy, blocks click */
  loading?: boolean
}

const Spinner = () => (
  <svg className="btn__spinner" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" />
  </svg>
)

/**
 * TZ-5: Единая кнопка — primary/secondary/ghost/danger, размеры sm(38)/md(48)/lg(56), focus ring, loading.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, disabled, loading, ...props }, ref) => {
    const isIcon = variant === 'icon'
    const variantClass =
      variant === 'outline' ? 'btn--secondary' : variant === 'primary' ? 'btn--primary' : variant === 'secondary' ? 'btn--secondary' : variant === 'ghost' ? 'btn--ghost' : variant === 'danger' ? 'btn--danger' : 'btn--primary'
    const sizeClass = isIcon ? '' : size === 'sm' ? 'btn--sm' : size === 'lg' ? 'btn--lg' : 'btn--md'

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-busy={loading}
        aria-disabled={disabled === true}
        className={cn(
          'btn',
          variantClass,
          !isIcon && sizeClass,
          loading && 'is-loading',
          disabled && 'is-disabled',
          isIcon && 'rounded-full p-2 min-w-[44px] min-h-[44px] w-10 h-10 [&>svg]:w-6 [&>svg]:h-6',
          className
        )}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
