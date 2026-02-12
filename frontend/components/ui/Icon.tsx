'use client'

import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export type IconColor = 'primary' | 'secondary' | 'accent' | 'muted'

const colorClass: Record<IconColor, string> = {
  primary: 'text-[var(--icon-primary)]',
  secondary: 'text-[var(--icon-secondary)]',
  accent: 'text-[var(--icon-accent)]',
  muted: 'text-[var(--icon-muted)]',
}

export interface IconProps {
  /** ТЗ-4: только токены. Запрещён svg с жёстким цветом (fill/stroke). */
  color?: IconColor
  size?: number
  className?: string
  children: React.ReactNode
}

export function Icon({ color = 'primary', size = 24, className, children }: IconProps) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0', colorClass[color], className)}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  )
}

/** Обёртка для Lucide/других иконок: прокидывает size и currentColor в svg */
export function IconSvg({
  color = 'primary',
  size = 24,
  className,
  children,
}: IconProps) {
  return (
    <span
      className={cn('inline-flex shrink-0 [&_svg]:shrink-0', colorClass[color], className)}
      style={{ width: size, height: size }}
    >
      {React.Children.map(children, (child) =>
        typeof child === 'object' && child !== null && 'type' in child && (child as React.ReactElement).type === 'svg'
          ? React.cloneElement(child as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
              width: size,
              height: size,
              className: cn('text-current', (child as React.ReactElement).props?.className),
            })
          : child
      )}
    </span>
  )
}
