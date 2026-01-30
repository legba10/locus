'use client'

import { cn } from '@/shared/utils/cn'

interface InsightBadgeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

function getScoreConfig(score: number) {
  if (score >= 80) {
    return { label: 'Отлично', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  }
  if (score >= 60) {
    return { label: 'Хорошо', color: 'bg-blue-100 text-blue-700 border-blue-200' }
  }
  if (score >= 40) {
    return { label: 'Средне', color: 'bg-amber-100 text-amber-700 border-amber-200' }
  }
  return { label: 'Улучшить', color: 'bg-red-100 text-red-700 border-red-200' }
}

/**
 * InsightBadge — компактный бейдж с оценкой качества жилья
 * Используется в карточках объявлений
 */
export function InsightBadge({ score, size = 'md', showLabel = true, className }: InsightBadgeProps) {
  const config = getScoreConfig(score)
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-2.5 py-1.5 gap-2',
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-md border font-medium',
      config.color,
      sizeClasses[size],
      className,
    )}>
      <span className="font-bold">{score}</span>
      {showLabel && <span className="opacity-80">{config.label}</span>}
    </div>
  )
}

/**
 * InsightBadgeCircle — круглый бейдж с оценкой
 */
export function InsightBadgeCircle({ score, size = 'md', className }: Omit<InsightBadgeProps, 'showLabel'>) {
  const config = getScoreConfig(score)
  
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div className={cn(
      'rounded-full border flex items-center justify-center font-bold',
      config.color,
      sizeMap[size],
      className,
    )}>
      {score}
    </div>
  )
}

/**
 * InsightMini — минимальный бейдж только с числом
 */
export function InsightMini({ score, className }: { score: number; className?: string }) {
  const config = getScoreConfig(score)
  
  return (
    <span className={cn(
      'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold',
      config.color,
      className,
    )}>
      {score}
    </span>
  )
}
