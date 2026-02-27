'use client'

/** TZ-52: Секция — flex column, gap 16px, margin-bottom 24px. Никаких margin-top 40+. */

import { cn } from '@/shared/utils/cn'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  as?: 'section' | 'div'
}

export function Section({ className, children, as: Tag = 'section', ...props }: SectionProps) {
  return (
    <Tag className={cn('section', className)} {...props}>
      {children}
    </Tag>
  )
}
