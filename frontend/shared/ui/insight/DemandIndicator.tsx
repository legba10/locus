'use client'

import { cn } from '@/shared/utils/cn'

interface DemandIndicatorProps {
  level: 'low' | 'medium' | 'high'
  bookingProbability: number // 0-100
  className?: string
}

const levelConfig = {
  low: {
    label: 'Низкий спрос',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    barColor: 'bg-gray-400',
    bars: 1,
    icon: '📉',
  },
  medium: {
    label: 'Средний спрос',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    barColor: 'bg-amber-500',
    bars: 2,
    icon: '📊',
  },
  high: {
    label: 'Высокий спрос',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    barColor: 'bg-emerald-500',
    bars: 3,
    icon: '🔥',
  },
}

/**
 * DemandIndicator — индикатор уровня спроса
 */
export function DemandIndicator({ level, bookingProbability, className }: DemandIndicatorProps) {
  const config = levelConfig[level]

  return (
    <div className={cn('rounded-lg p-3', config.bg, className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
      </div>
      
      {/* Индикатор уровня */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              bar <= config.bars ? config.barColor : 'bg-gray-200',
            )}
          />
        ))}
      </div>
      
      {/* Вероятность бронирования */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Шанс бронирования:</span>
        <span className={cn('font-medium', config.color)}>{bookingProbability}%</span>
      </div>
    </div>
  )
}

/**
 * DemandIndicatorMini — минимальная версия
 */
export function DemandIndicatorMini({ level }: Pick<DemandIndicatorProps, 'level'>) {
  const config = levelConfig[level]
  
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', config.color)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

/**
 * DemandBars — только полоски
 */
export function DemandBars({ level, className }: { level: 'low' | 'medium' | 'high'; className?: string }) {
  const config = levelConfig[level]
  
  return (
    <div className={cn('flex gap-0.5', className)}>
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={cn(
            'w-1 h-3 rounded-full',
            bar <= config.bars ? config.barColor : 'bg-gray-200',
          )}
        />
      ))}
    </div>
  )
}
