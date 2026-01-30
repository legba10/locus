'use client'

import { cn } from '@/shared/utils/cn'

interface TipsBlockProps {
  tips: string[]
  title?: string
  maxTips?: number
  className?: string
}

/**
 * TipsBlock — блок советов от LOCUS AI
 */
export function TipsBlock({ 
  tips, 
  title = 'Советы от LOCUS', 
  maxTips = 5, 
  className 
}: TipsBlockProps) {
  if (!tips.length) return null

  return (
    <div className={cn('rounded-lg border border-blue-200 bg-blue-50 p-4', className)}>
      <h4 className="flex items-center gap-2 font-medium text-blue-800 mb-3">
        <span className="text-lg">🤖</span>
        {title}
      </h4>
      <ul className="space-y-2">
        {tips.slice(0, maxTips).map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-blue-900">
            <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * TipsBlockInline — однострочные советы
 */
export function TipsBlockInline({ tips }: { tips: string[] }) {
  if (!tips.length) return null
  
  return (
    <div className="flex items-center gap-2 text-sm text-blue-700">
      <span>💡</span>
      <span className="truncate">{tips[0]}</span>
    </div>
  )
}

/**
 * QuickTip — один совет в компактном виде
 */
export function QuickTip({ tip, className }: { tip: string; className?: string }) {
  return (
    <div className={cn(
      'flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm',
      className,
    )}>
      <span className="text-blue-500 mt-0.5">💡</span>
      <span className="text-blue-900">{tip}</span>
    </div>
  )
}
