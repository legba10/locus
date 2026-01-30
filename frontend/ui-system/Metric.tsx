'use client'

import { cn } from '@/shared/utils/cn'

interface MetricProps {
  label: string
  value: string | number
  sublabel?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { value: 'text-lg', label: 'text-xs' },
  md: { value: 'text-2xl', label: 'text-sm' },
  lg: { value: 'text-3xl', label: 'text-base' },
}

const trendColors = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
}

export function Metric({
  label,
  value,
  sublabel,
  trend,
  trendValue,
  size = 'md',
  className,
}: MetricProps) {
  const s = sizes[size]
  
  return (
    <div className={cn('', className)}>
      <div className={cn('text-gray-500 mb-1', s.label)}>{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold text-gray-900', s.value)}>{value}</span>
        {sublabel && <span className="text-gray-500">{sublabel}</span>}
      </div>
      {trend && trendValue && (
        <div className={cn('text-sm mt-1', trendColors[trend])}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </div>
      )}
    </div>
  )
}

/**
 * MoneyMetric — для отображения денег
 */
interface MoneyMetricProps {
  label: string
  amount: number
  period?: string
  potential?: number
  growth?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

export function MoneyMetric({
  label,
  amount,
  period = '/ мес',
  potential,
  growth,
  size = 'md',
  className,
}: MoneyMetricProps) {
  const s = sizes[size]
  const diff = potential ? potential - amount : 0
  
  return (
    <div className={cn('', className)}>
      <div className={cn('text-gray-500 mb-1', s.label)}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-bold text-gray-900', s.value)}>{formatMoney(amount)} ₽</span>
        <span className="text-gray-500">{period}</span>
      </div>
      {potential && diff > 0 && (
        <div className="mt-2 p-2 rounded-lg bg-emerald-50">
          <div className="text-sm text-emerald-700">
            Потенциал: +{formatMoney(diff)} ₽ {period}
          </div>
          {growth && (
            <div className="text-xs text-emerald-600">+{growth}% к текущему</div>
          )}
        </div>
      )}
    </div>
  )
}
