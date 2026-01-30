'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'highlight'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const variants = {
  default: 'bg-white',
  bordered: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-md',
  highlight: 'bg-blue-50 border border-blue-200',
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'bordered',
  padding = 'md',
  hoverable = false,
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl',
        variants[variant],
        paddings[padding],
        hoverable && 'transition hover:shadow-md hover:border-gray-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card Header
export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mb-3', className)}>
      {children}
    </div>
  )
}

// Card Title
export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

// Card Content
export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('text-gray-600', className)}>
      {children}
    </div>
  )
}

// Card Footer
export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mt-3 pt-3 border-t border-gray-100', className)}>
      {children}
    </div>
  )
}
