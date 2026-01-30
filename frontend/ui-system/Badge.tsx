'use client'

import { cn } from '@/shared/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  children: React.ReactNode
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-50 text-gray-500',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-sm',
  lg: 'px-2.5 py-1 text-sm',
}

export function Badge({ variant = 'default', size = 'md', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-md font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}

/**
 * ScoreBadge — оценка LOCUS
 */
interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getScoreVariant(score: number): BadgeVariant {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'danger'
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const variant = getScoreVariant(score)
  
  const scoreSizes = {
    sm: 'px-1.5 py-0.5 text-xs font-bold',
    md: 'px-2 py-0.5 text-sm font-bold',
    lg: 'px-3 py-1 text-base font-bold',
  }
  
  const colors: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-amber-500 text-white',
    danger: 'bg-red-500 text-white',
    default: 'bg-gray-500 text-white',
    neutral: 'bg-gray-400 text-white',
  }
  
  return (
    <span className={cn('rounded-lg', colors[variant], scoreSizes[size], className)}>
      {score}
    </span>
  )
}
