'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'

const TOOLTIP_TEXT = 'AI-подбор: LOCUS сам подберёт варианты по вашим параметрам'

export interface ModeSwitchBlockProps {
  aiMode: boolean
  onChange: (ai: boolean) => void
  className?: string
}

/**
 * ТЗ-2: единый блок «Ручной | AI-подбор» + подсказка (?).
 * SegmentControl (одна высота, центрирование) + InfoTooltip (desktop hover, mobile tap → popover).
 */
export function ModeSwitchBlock({ aiMode, onChange, className }: ModeSwitchBlockProps) {
  const [infoOpen, setInfoOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const h = () => setIsMobile(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  useEffect(() => {
    if (!infoOpen) return
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setInfoOpen(false)
    }
    document.addEventListener('click', close, { capture: true })
    return () => document.removeEventListener('click', close, { capture: true })
  }, [infoOpen])

  return (
    <div className={cn('mode-switch flex flex-col gap-3', className)}>
      <div className="mode-switch__row flex flex-wrap items-center gap-3 md:gap-4">
        {/* SegmentControl: единый контейнер, не две кнопки */}
        <div
          className="mode-switch__segment flex h-11 flex-1 min-w-0 max-w-[320px] rounded-[14px] p-1"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <button
            type="button"
            onClick={() => onChange(false)}
            className={cn(
              'mode-switch__segment-btn flex-1 h-full rounded-[10px] text-[14px] font-medium transition-all duration-[0.25s] ease-out',
              !aiMode
                ? 'bg-[var(--accent-gradient,linear-gradient(to_right,#7c3aed,#4f46e5))] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            )}
          >
            Ручной
          </button>
          <button
            type="button"
            onClick={() => onChange(true)}
            className={cn(
              'mode-switch__segment-btn flex-1 h-full rounded-[10px] text-[14px] font-medium transition-all duration-[0.25s] ease-out',
              aiMode
                ? 'bg-[var(--accent-gradient,linear-gradient(to_right,#7c3aed,#4f46e5))] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            )}
          >
            AI-подбор
          </button>
        </div>

        {/* InfoTooltip: ? — desktop hover на обёртке, mobile tap → popover */}
        <div
          className="mode-switch__info relative flex-shrink-0"
          ref={wrapperRef}
          onMouseEnter={() => !isMobile && setInfoOpen(true)}
          onMouseLeave={() => !isMobile && setInfoOpen(false)}
        >
          <button
            type="button"
            onClick={() => isMobile && setInfoOpen((v) => !v)}
            className="mode-switch__info-btn flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-colors text-[15px] font-semibold"
            aria-label="Подсказка: что такое AI-подбор?"
          >
            ?
          </button>
          {/* Tooltip (desktop) / Popover (mobile) */}
          {infoOpen && (
            <div
              className={cn(
                'mode-switch__tooltip absolute z-50 max-w-[260px] rounded-[10px] p-3 text-[13px] leading-relaxed shadow-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-main)]',
                isMobile
                  ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                  : 'left-full top-1/2 -translate-y-1/2 ml-2'
              )}
              role="tooltip"
            >
              <p>{TOOLTIP_TEXT}</p>
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setInfoOpen(false)}
                  className="mt-2 flex items-center justify-center w-full py-1.5 rounded-lg text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  aria-label="Закрыть"
                >
                  Закрыть
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Подсказка под переключателем */}
      <p
        className="mode-switch__hint text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-[480px] transition-opacity duration-150"
        key={aiMode ? 'ai' : 'manual'}
      >
        {aiMode
          ? 'AI подберёт лучшие варианты под ваш бюджет и даты'
          : 'Настройте фильтры сами и получите точные результаты'}
      </p>
    </div>
  )
}
