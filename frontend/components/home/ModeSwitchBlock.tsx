'use client'

import React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ModeSwitchBlockProps {
  aiMode: boolean
  onChange: (ai: boolean) => void
  className?: string
}

/**
 * Блок «Ручной | AI-подбор» — без question-иконки, с фиксированными цветами (нет засвета в light theme).
 * ТЗ: высота 44px, radius 12px, gap 8px, padding 4px; активный = gradient + white, неактивный = border + theme-цвет.
 */
export function ModeSwitchBlock({ aiMode, onChange, className }: ModeSwitchBlockProps) {
  return (
    <div className={cn('mode-switch flex flex-col items-stretch', className)}>
      <div className="mode-switch__segment-wrap w-full max-w-[420px] mx-auto">
        <div className="mode-switch__segment flex h-[44px] rounded-[12px] p-1 gap-2">
          <button
            type="button"
            onClick={() => onChange(false)}
            className={cn(
              'mode-switch__segment-btn flex-1 h-full rounded-[10px] text-[14px] font-semibold transition-all duration-[0.25s] ease-out',
              !aiMode
                ? 'bg-[var(--accent-gradient,linear-gradient(to_right,#7c3aed,#4f46e5))] text-white shadow-sm'
                : 'mode-switch__segment-btn--inactive bg-transparent border border-[var(--border)]'
            )}
          >
            Ручной
          </button>
          <button
            type="button"
            onClick={() => onChange(true)}
            className={cn(
              'mode-switch__segment-btn flex-1 h-full rounded-[10px] text-[14px] font-semibold transition-all duration-[0.25s] ease-out',
              aiMode
                ? 'bg-[var(--accent-gradient,linear-gradient(to_right,#7c3aed,#4f46e5))] text-white shadow-sm'
                : 'mode-switch__segment-btn--inactive bg-transparent border border-[var(--border)]'
            )}
          >
            AI-подбор
          </button>
        </div>
      </div>

      <p
        className="mode-switch__hint mt-2 text-[14px] leading-relaxed max-w-[480px] mx-auto w-full"
        key={aiMode ? 'ai' : 'manual'}
      >
        {aiMode
          ? 'AI подберёт лучшие варианты под ваш бюджет и даты'
          : 'Настройте фильтры сами и получите точные результаты'}
      </p>
    </div>
  )
}
