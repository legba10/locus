'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

export interface UIMenuItemProps {
  icon?: React.ReactNode
  title: string
  href: string
  active?: boolean
  className?: string
}

export function UIMenuItem({ icon, title, href, active, className }: UIMenuItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-4 rounded-[16px] px-4 py-3 transition-colors hover:bg-[var(--bg-surface)]',
        active && 'bg-[var(--bg-surface)] text-[var(--primary)]',
        className
      )}
    >
      {icon && <span className="flex shrink-0 w-10 h-10 items-center justify-center text-[var(--text-secondary)]">{icon}</span>}
      <span className="font-medium text-[var(--text-primary)]">{title}</span>
    </Link>
  )
}
