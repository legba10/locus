'use client'

/** TZ-33: Блок с внутренним padding 16px и отступом между блоками 24px. */

import { cn } from '@/shared/utils/cn'

export interface BlockProps {
  className?: string
  children?: React.ReactNode
  as?: 'div' | 'article' | 'aside'
}

export function Block({ className, children, as: Tag = 'div' }: BlockProps) {
  return (
    <Tag className={cn('p-4 mb-6 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-[0_2px_12px_rgba(0,0,0,0.06)]', className)}>
      {children}
    </Tag>
  )
}
