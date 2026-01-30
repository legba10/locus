'use client'

import { cn } from '@/shared/utils/cn'

interface AIHintProps {
  text: string
  variant?: 'tip' | 'warning' | 'success' | 'info'
  icon?: string
  className?: string
}

const variants = {
  tip: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '💡' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '⚠' },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '✓' },
  info: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'ℹ' },
}

/**
 * AIHint — подсказка от AI
 */
export function AIHint({ text, variant = 'tip', icon, className }: AIHintProps) {
  const config = variants[variant]

  return (
    <div className={cn('flex items-start gap-2 px-3 py-2 rounded-lg border', config.bg, config.border, config.text, className)}>
      <span>{icon || config.icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  )
}
