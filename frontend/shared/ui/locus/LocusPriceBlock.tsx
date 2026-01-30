'use client'

import { cn } from '@/shared/utils/cn'

interface LocusPriceBlockProps {
  currentPrice: number
  recommendedPrice?: number
  priceDiff?: number
  position?: 'below_market' | 'market' | 'above_market'
  currency?: string
  className?: string
}

function formatPrice(amount: number, currency: string = 'RUB') {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

/**
 * LocusPriceBlock — блок анализа цены
 */
export function LocusPriceBlock({
  currentPrice,
  recommendedPrice,
  priceDiff,
  position = 'market',
  currency = 'RUB',
  className,
}: LocusPriceBlockProps) {
  const positionConfig = {
    below_market: { 
      label: 'Ниже рынка', 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: '↓',
    },
    market: { 
      label: 'По рынку', 
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      icon: '=',
    },
    above_market: { 
      label: 'Выше рынка', 
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      icon: '↑',
    },
  }

  const config = positionConfig[position]

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">Цена</span>
        <span className={cn('text-sm font-medium px-2 py-0.5 rounded-full', config.bg, config.color)}>
          {config.icon} {config.label}
          {priceDiff !== undefined && priceDiff !== 0 && ` ${Math.abs(priceDiff)}%`}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Текущая</span>
          <span className="text-lg font-bold text-gray-900">{formatPrice(currentPrice, currency)}/ночь</span>
        </div>

        {recommendedPrice && recommendedPrice !== currentPrice && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Рекомендуемая</span>
            <span className="text-lg font-bold text-emerald-600">{formatPrice(recommendedPrice, currency)}/ночь</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * LocusPriceMini — компактная версия для карточек
 */
export function LocusPriceMini({
  position,
  priceDiff,
  className,
}: {
  position: 'below_market' | 'market' | 'above_market'
  priceDiff?: number
  className?: string
}) {
  if (position === 'market' || priceDiff === 0) return null

  const isBelow = position === 'below_market'
  const color = isBelow ? 'bg-emerald-500' : 'bg-amber-500'
  const text = isBelow 
    ? `Ниже рынка на ${Math.abs(priceDiff ?? 0)}%`
    : `Выше рынка на ${priceDiff}%`

  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs text-white font-medium', color, className)}>
      {text}
    </span>
  )
}
