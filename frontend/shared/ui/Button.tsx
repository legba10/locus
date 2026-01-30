'use client'

import { cn } from '@/shared/utils/cn'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Button — Единый компонент для всех кнопок
 * Использует дизайн-систему tokens
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const variants = {
      primary: cn(
        'bg-violet-600 text-white',
        'hover:bg-violet-500 active:bg-violet-700',
        'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
        'hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)]'
      ),
      secondary: cn(
        'bg-gray-100 text-[#1C1F26]',
        'hover:bg-gray-200'
      ),
      outline: cn(
        'bg-white border-2 border-gray-200 text-[#1C1F26]',
        'hover:bg-gray-50'
      ),
      ghost: cn(
        'bg-transparent text-[#6B7280]',
        'hover:bg-gray-100 hover:text-[#1C1F26]'
      ),
    }

    const sizes = {
      sm: 'px-4 py-2 text-[13px]',
      md: 'px-5 py-3 text-[14px]',
      lg: 'px-6 py-3.5 text-[15px]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-[14px] font-semibold',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
