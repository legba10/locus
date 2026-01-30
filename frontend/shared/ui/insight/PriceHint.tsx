'use client'

import { cn } from '@/shared/utils/cn'

interface PriceHintProps {
  currentPrice: number
  recommendedPrice: number
  position: 'below_market' | 'market' | 'above_market'
  diff: number
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency: 'RUB', 
    maximumFractionDigits: 0 
  }).format(amount)
}

const positionConfig = {
  below_market: {
    label: 'Ниже рынка',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    icon: '📉',
    hint: 'Выгодное предложение',
  },
  market: {
    label: 'По рынку',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    icon: '📊',
    hint: 'Средняя цена',
  },
  above_market: {
    label: 'Выше рынка',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    icon: '📈',
    hint: 'Выше средней',
  },
}

/**
 * PriceHint — подсказка по цене
 * Показывает текущую цену, рекомендованную и позицию на рынке
 */
export function PriceHint({ currentPrice, recommendedPrice, position, diff, className }: PriceHintProps) {
  const config = positionConfig[position]

  return (
    <div className={cn('rounded-lg p-3', config.bg, className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
        {diff !== 0 && (
          <span className={cn('text-xs', config.color)}>
            ({diff > 0 ? '+' : ''}{diff}%)
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Текущая цена:</span>
          <span className="font-medium text-gray-900">{formatPrice(currentPrice)}</span>
        </div>
        {position !== 'market' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Рекомендуем:</span>
            <span className={cn('font-medium', config.color)}>{formatPrice(recommendedPrice)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * PriceHintMini — минимальная версия
 */
export function PriceHintMini({ position, diff }: Pick<PriceHintProps, 'position' | 'diff'>) {
  const config = positionConfig[position]
  
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', config.color)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {diff !== 0 && <span>({diff > 0 ? '+' : ''}{diff}%)</span>}
    </span>
  )
}
