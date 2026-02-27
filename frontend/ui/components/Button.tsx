'use client'

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface UIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary'
  size?: 'default' | 'small'
  children: React.ReactNode
}

const heightClass = { default: 'h-[52px]', small: 'h-[40px]' } as const

export function UIButton({ variant, size = 'default', className, children, ...props }: UIButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-[12px] font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-[var(--primary)] text-white hover:opacity-95 active:scale-[0.98]',
        variant === 'secondary' && 'border border-[var(--border-main)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface)]',
        heightClass[size],
        size === 'default' ? 'px-6' : 'px-4',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
