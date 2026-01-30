'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

/**
 * GlassInput — Поле ввода в стиле Liquid Glass
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const hasIcon = !!icon

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label className="text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <div className="relative">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl',
            'bg-white/[0.08] backdrop-blur-lg',
            'border border-white/[0.15]',
            'text-white placeholder:text-white/40',
            'px-4 py-3',
            'transition-all duration-200',
            'focus:outline-none focus:bg-white/[0.12] focus:border-white/[0.3]',
            'focus:ring-2 focus:ring-purple-500/30',
            hasIcon && iconPosition === 'left' && 'pl-10',
            hasIcon && iconPosition === 'right' && 'pr-10',
            error && 'border-red-500/50 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

GlassInput.displayName = 'GlassInput'

/**
 * GlassSelect — Селект в стиле Liquid Glass
 */
interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  children: ReactNode
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(({
  label,
  error,
  fullWidth = false,
  children,
  className,
  ...props
}, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label className="text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-xl appearance-none',
          'bg-white/[0.08] backdrop-blur-lg',
          'border border-white/[0.15]',
          'text-white',
          'px-4 py-3 pr-10',
          'transition-all duration-200',
          'focus:outline-none focus:bg-white/[0.12] focus:border-white/[0.3]',
          'focus:ring-2 focus:ring-purple-500/30',
          'cursor-pointer',
          // Arrow styling
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23fff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")]',
          'bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat',
          error && 'border-red-500/50 focus:ring-red-500/30',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

GlassSelect.displayName = 'GlassSelect'
