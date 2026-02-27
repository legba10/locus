'use client'

/**
 * TZ-73: UI Kit ChatBubble. Чат не кастомизируется вручную. max-width 75%, padding 12px 16px, radius 18px.
 */

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface UIChatBubbleProps {
  type: 'incoming' | 'outgoing'
  children: React.ReactNode
  time?: string
  className?: string
}

export function UIChatBubble({ type, children, time, className }: UIChatBubbleProps) {
  return (
    <div
      className={cn(
        'max-w-[75%] rounded-[18px] px-4 py-3',
        type === 'outgoing' &&
          'self-end rounded-br-[4px] bg-[var(--primary)] text-white',
        type === 'incoming' &&
          'self-start rounded-bl-[4px] bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-main)]',
        className
      )}
    >
      <div className="break-words">{children}</div>
      {time && (
        <div
          className={cn(
            'mt-1 text-[11px] opacity-85',
            type === 'outgoing' ? 'text-white/90' : 'text-[var(--text-secondary)]'
          )}
        >
          {time}
        </div>
      )}
    </div>
  )
}
