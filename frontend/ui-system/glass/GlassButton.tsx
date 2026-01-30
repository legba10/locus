'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'glass' | 'primary' | 'brand' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

/**
 * GlassButton — Кнопка в стиле Liquid Glass
 * 
 * Варианты:
 * - glass: стеклянная кнопка (для "Войти")
 * - primary: AI Purple gradient (для "Регистрация", "Найти")
 * - brand: Brand Blue gradient
 * - danger: красная кнопка
 * - ghost: прозрачная
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(({
  children,
  variant = 'glass',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}, ref) => {
  const baseStyles = cn(
    'relative inline-flex items-center justify-center gap-2',
    'font-medium rounded-xl',
    'transition-all duration-200 ease-out',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth && 'w-full'
  )

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantStyles = {
    glass: cn(
      'bg-white/[0.1] backdrop-blur-lg',
      'border border-white/[0.2]',
      'text-white',
      'hover:bg-white/[0.15] hover:border-white/[0.3]',
      'active:bg-white/[0.2]',
      'shadow-lg shadow-black/10'
    ),
    primary: cn(
      'bg-gradient-to-r from-purple-600 to-purple-700',
      'border border-purple-500/30',
      'text-white',
      'hover:from-purple-500 hover:to-purple-600',
      'hover:shadow-lg hover:shadow-purple-500/30',
      'active:from-purple-700 active:to-purple-800'
    ),
    brand: cn(
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'border border-blue-400/30',
      'text-white',
      'hover:from-blue-400 hover:to-blue-500',
      'hover:shadow-lg hover:shadow-blue-500/30',
      'active:from-blue-600 active:to-blue-700'
    ),
    danger: cn(
      'bg-gradient-to-r from-red-500 to-red-600',
      'border border-red-400/30',
      'text-white',
      'hover:from-red-400 hover:to-red-500',
      'hover:shadow-lg hover:shadow-red-500/30',
      'active:from-red-600 active:to-red-700'
    ),
    ghost: cn(
      'bg-transparent',
      'border border-transparent',
      'text-white/80',
      'hover:bg-white/[0.08] hover:text-white',
      'active:bg-white/[0.12]'
    ),
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  )
})

GlassButton.displayName = 'GlassButton'
