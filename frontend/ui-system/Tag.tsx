'use client'

import { cn } from '@/shared/utils/cn'

interface TagProps {
  icon?: string
  className?: string
  children: React.ReactNode
}

export function Tag({ icon, className, children }: TagProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-sm text-gray-700',
      className
    )}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}

/**
 * DemandTag — уровень спроса
 */
interface DemandTagProps {
  level: 'low' | 'medium' | 'high'
  className?: string
}

const demandConfig = {
  low: { label: 'Низкий спрос', color: 'bg-gray-100 text-gray-600', icon: '📉' },
  medium: { label: 'Средний спрос', color: 'bg-amber-50 text-amber-700', icon: '📊' },
  high: { label: 'Высокий спрос', color: 'bg-emerald-50 text-emerald-700', icon: '🔥' },
}

export function DemandTag({ level, className }: DemandTagProps) {
  const config = demandConfig[level]
  
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm', config.color, className)}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}

/**
 * PriceTag — позиция цены
 */
interface PriceTagProps {
  position: 'below' | 'market' | 'above'
  diff?: number
  className?: string
}

const priceConfig = {
  below: { label: 'Ниже рынка', color: 'text-emerald-600' },
  market: { label: 'По рынку', color: 'text-gray-600' },
  above: { label: 'Выше рынка', color: 'text-amber-600' },
}

export function PriceTag({ position, diff, className }: PriceTagProps) {
  const config = priceConfig[position]
  
  return (
    <span className={cn('text-sm', config.color, className)}>
      {config.label}
      {diff !== undefined && diff !== 0 && ` на ${Math.abs(diff)}%`}
    </span>
  )
}
