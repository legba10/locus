'use client'

import { cn } from '@/shared/utils/cn'

interface LocusRecommendationBlockProps {
  recommendation: string
  tips?: string[]
  variant?: 'default' | 'compact'
  className?: string
}

/**
 * LocusRecommendationBlock — блок рекомендаций
 * 
 * Используется: на карточках и страницах
 */
export function LocusRecommendationBlock({ 
  recommendation, 
  tips = [], 
  variant = 'default',
  className 
}: LocusRecommendationBlockProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <span className="text-blue-500">💡</span>
        <span className="text-gray-700 truncate">{recommendation}</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-blue-200 bg-blue-50 p-4', className)}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🤖</span>
        <div>
          <p className="font-medium text-blue-900 mb-2">{recommendation}</p>
          {tips.length > 0 && (
            <ul className="space-y-1.5">
              {tips.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="text-blue-500 mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * LocusQuickTip — однострочная подсказка
 */
export function LocusQuickTip({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800',
      className
    )}>
      <span>💡</span>
      <span>{text}</span>
    </div>
  )
}
