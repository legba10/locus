'use client'

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface UIInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function UIInput(props: UIInputProps) {
  const { className, error, ...rest } = props
  return (
    <input
      className={cn(
        'h-[52px] w-full rounded-[12px] border px-4',
        'bg-[var(--bg-surface)] text-[var(--text-primary)]',
        'border-[var(--border-main)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20',
        error && 'border-red-500',
        className
      )}
      {...rest}
    />
  )
}
