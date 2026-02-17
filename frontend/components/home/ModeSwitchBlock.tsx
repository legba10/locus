'use client'

import React from 'react'
import { cn } from '@/shared/utils/cn'

export type ModeSwitchMode = 'manual' | 'ai'

export interface ModeSwitchBlockProps {
  /** true = AI-подбор, false = Ручной. По умолчанию manual. */
  aiMode: boolean
  onChange: (ai: boolean) => void
  className?: string
}

const SUBTITLE = {
  manual: 'Настройте фильтры сами и получите точные результаты',
  ai: 'AI подберёт варианты под ваш бюджет и даты',
} as const

/**
 * Сегментированный переключатель «Ручной | AI-подбор».
 * Один контейнер, state mode = manual | ai, подпись синхронизирована с mode.
 */
export function ModeSwitchBlock({ aiMode, onChange, className }: ModeSwitchBlockProps) {
  const mode: ModeSwitchMode = aiMode ? 'ai' : 'manual'

  return (
    <div className={cn('mode-switch flex flex-col items-stretch', className)}>
      <div className="mode-switch__segment-wrap w-full max-w-[420px] mx-auto">
        <div className="mode-switch__segment flex h-[44px] rounded-[14px] p-1" role="group" aria-label="Режим подбора">
          <button
            type="button"
            onClick={() => onChange(false)}
            className={cn(
              'mode-switch__segment-btn flex-1 h-full rounded-[10px] text-[14px] font-medium transition-all duration-200',
              mode === 'manual'
                ? 'mode-switch__segment-btn--active bg-[var(--accent-gradient,linear-gradient(to_right,#7c3aed,#4f46e5))] text-white'
                : 'mode-switch__segment-btn--inactive bg-transparent text-[var(--text-secondary)]'
            )}
            aria-pressed={mode === 'manual'}
          >
            Ручной
          </button>
          <button
            type="button"
            onClick={() => onChange(true)}
            className={cn(
              'mode-switch__segment-btn flex-1 h-full rounded-[10px] text-[14px] font-medium transition-all duration-200',
              mode === 'ai'
                ? 'mode-switch__segment-btn--active bg-[var(--accent-gradient,linear-gradient(to_right,#7c3aed,#4f46e5))] text-white'
                : 'mode-switch__segment-btn--inactive bg-transparent text-[var(--text-secondary)]'
            )}
            aria-pressed={mode === 'ai'}
          >
            AI-подбор
          </button>
        </div>
      </div>
      <p className="mode-switch__hint mt-2 text-[14px] leading-relaxed max-w-[480px] mx-auto w-full text-center">
        {SUBTITLE[mode]}
      </p>
    </div>
  )
}
