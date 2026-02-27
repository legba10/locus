'use client'

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ContentShellProps {
  children: React.ReactNode
  className?: string
}

export function ContentShell({ children, className }: ContentShellProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[720px] mx-auto px-4',
        '[&>*+*]:mt-6',
        className
      )}
    >
      {children}
    </div>
  )
}
