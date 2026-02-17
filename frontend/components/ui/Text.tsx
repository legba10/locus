'use client'

import { cn } from '@/shared/utils/cn'

/**
 * ТЗ №3: типографика без засветов — 3 уровня через CSS-переменные темы.
 * primary / secondary / muted. Запрет: text-white, opacity на тексте.
 */
export interface TextProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function H1({ children, className, as: Tag = 'h1' }: TextProps) {
  const Comp = Tag as 'h1'
  return (
    <Comp className={cn(className)} style={{ color: 'var(--text-primary)' }}>
      {children}
    </Comp>
  )
}

export function P({ children, className, as: Tag = 'p' }: TextProps) {
  const Comp = Tag as 'p'
  return (
    <Comp className={cn(className)} style={{ color: 'var(--text-secondary)' }}>
      {children}
    </Comp>
  )
}

export function Small({ children, className, as: Tag = 'span' }: TextProps) {
  const Comp = Tag as 'span'
  return (
    <Comp className={cn(className)} style={{ color: 'var(--text-muted)' }}>
      {children}
    </Comp>
  )
}
