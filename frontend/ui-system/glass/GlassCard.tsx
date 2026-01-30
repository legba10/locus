'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { LOCUS_COLORS, LOCUS_SHADOWS, LOCUS_RADIUS } from '../tokens'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'subtle' | 'solid' | 'glow'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

/**
 * GlassCard — Liquid Glass карточка
 * 
 * Основной UI-блок LOCUS с glassmorphism эффектом.
 * 
 * Характеристики:
 * - blur: 12–24px
 * - transparency: 6–12%
 * - border: 1px glass
 * - soft shadow
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  ...props
}, ref) => {
  const baseStyles = cn(
    'relative rounded-xl overflow-hidden',
    'transition-all duration-300 ease-out',
    paddingStyles[padding]
  )

  const variantStyles = {
    default: cn(
      'bg-white/[0.08] backdrop-blur-xl',
      'border border-white/[0.15]',
      'shadow-lg shadow-black/20'
    ),
    subtle: cn(
      'bg-white/[0.05] backdrop-blur-lg',
      'border border-white/[0.1]',
      'shadow-md shadow-black/15'
    ),
    solid: cn(
      'bg-slate-900/90 backdrop-blur-xl',
      'border border-white/[0.1]',
      'shadow-lg shadow-black/30'
    ),
    glow: cn(
      'bg-white/[0.08] backdrop-blur-xl',
      'border border-purple-500/30',
      'shadow-lg shadow-purple-500/20'
    ),
  }

  const hoverStyles = hoverable && cn(
    'cursor-pointer',
    'hover:bg-white/[0.12]',
    'hover:border-white/[0.25]',
    'hover:shadow-xl hover:shadow-black/30',
    'hover:-translate-y-0.5'
  )

  return (
    <div
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  )
})

GlassCard.displayName = 'GlassCard'
