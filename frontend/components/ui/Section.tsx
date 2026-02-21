'use client'

/** TZ-33: Секция с отступом снизу (между секциями 32px). */

import { cn } from '@/shared/utils/cn'

export interface SectionProps {
  className?: string
  children?: React.ReactNode
  as?: 'section' | 'div'
}

export function Section({ className, children, as: Tag = 'section' }: SectionProps) {
  return (
    <Tag className={cn('mb-8', className)}>
      {children}
    </Tag>
  )
}
