'use client'

/** TZ-33: Универсальный вертикальный контейнер с gap из токенов. */

import { cn } from '@/shared/utils/cn'
import { spacing, type SpacingKey } from '@/shared/design-tokens/spacing'

export interface StackProps {
  gap?: SpacingKey
  className?: string
  children?: React.ReactNode
  as?: 'div' | 'section' | 'main'
}

export function Stack({ gap = 'md', className, children, as: Tag = 'div' }: StackProps) {
  return (
    <Tag
      className={cn('flex flex-col', className)}
      style={{ gap: `${spacing[gap]}px` }}
    >
      {children}
    </Tag>
  )
}
