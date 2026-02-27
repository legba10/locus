'use client'

/** TZ-52: Единый контейнер страницы — max-width 720px (desktop 900px), padding 16px. */

import { cn } from '@/shared/utils/cn'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Узкий контейнер для профиля/форм */
  narrow?: boolean
}

export function Container({ className, narrow, ...props }: ContainerProps) {
  return (
    <div
      className={cn('container-ds', narrow && 'max-w-[720px]', className)}
      {...props}
    />
  )
}
