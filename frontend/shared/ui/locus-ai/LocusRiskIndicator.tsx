'use client'

import { cn } from '@/shared/utils/cn'

interface LocusRiskIndicatorProps {
  risks: string[]
  className?: string
}

/**
 * LocusRiskIndicator — индикатор рисков
 * 
 * Показывает риски понятным языком
 */
export function LocusRiskIndicator({ risks, className }: LocusRiskIndicatorProps) {
  if (risks.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-emerald-600', className)}>
        <span>✓</span>
        <span>Риски не обнаружены</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-amber-200 bg-amber-50 p-3', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
        <span>⚠️</span>
        <span>Обратите внимание</span>
      </div>
      <ul className="space-y-1">
        {risks.map((risk, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
            <span className="text-amber-500 mt-0.5">•</span>
            {risk}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * LocusRiskBadge — компактный бейдж риска
 */
export function LocusRiskBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700',
        className
      )}>
        <span>✓</span>
        <span>Безопасно</span>
      </span>
    )
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700',
      className
    )}>
      <span>⚠️</span>
      <span>{count} {count === 1 ? 'риск' : count < 5 ? 'риска' : 'рисков'}</span>
    </span>
  )
}
