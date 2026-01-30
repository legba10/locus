'use client'

import { cn } from '@/shared/utils/cn'

interface InfoBlockProps {
  title?: string
  icon?: string
  variant?: 'default' | 'success' | 'warning' | 'info'
  className?: string
  children: React.ReactNode
}

const variants = {
  default: 'bg-gray-50 border-gray-200',
  success: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
}

export function InfoBlock({ title, icon, variant = 'default', className, children }: InfoBlockProps) {
  return (
    <div className={cn('rounded-xl border p-4', variants[variant], className)}>
      {title && (
        <div className="flex items-center gap-2 mb-2">
          {icon && <span>{icon}</span>}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  )
}

/**
 * ProsList — список плюсов
 */
export function ProsList({ items, className }: { items: string[]; className?: string }) {
  if (!items.length) return null
  
  return (
    <ul className={cn('space-y-1.5', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="text-emerald-500 mt-0.5">✓</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

/**
 * RisksList — список рисков
 */
export function RisksList({ items, className }: { items: string[]; className?: string }) {
  if (!items.length) return null
  
  return (
    <ul className={cn('space-y-1.5', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
          <span className="mt-0.5">⚠</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

/**
 * TipBlock — совет
 */
export function TipBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-sm text-blue-700', className)}>
      <span>💡</span>
      <span>{children}</span>
    </div>
  )
}
