'use client'

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface UICardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'md' | 'lg'
}

const paddingClass = { none: '', md: 'p-4', lg: 'p-6' } as const

export function UICard({ children, className, padding = 'lg' }: UICardProps) {
  return (
    <div
      className={cn(
        'rounded-[20px] bg-[var(--bg-card)] shadow-[var(--shadow-e1-light,0_4px_16px_rgba(0,0,0,0.08))]',
        paddingClass[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
