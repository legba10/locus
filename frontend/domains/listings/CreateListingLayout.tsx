'use client'

import { cn } from '@/shared/utils/cn'

export interface CreateListingLayoutProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  children: React.ReactNode
  /** Скрыть кнопку «Далее» (например на шаге предпросмотра) */
  hideNext?: boolean
}

export function CreateListingLayout({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel = 'Далее',
  nextDisabled,
  children,
  hideNext,
}: CreateListingLayoutProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="flex flex-col min-h-0 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[14px] font-medium text-[var(--text-secondary)] tabular-nums">
          {currentStep} / {totalSteps}
        </span>
        <div className="flex-1 mx-4 h-2 rounded-full bg-[var(--bg-input)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className={cn(
          'rounded-[16px] border border-[var(--border-main)] p-6 sm:p-[24px]',
          'bg-[var(--bg-card)]/80 backdrop-blur-sm',
          'shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
        )}
      >
        {children}
      </div>

      <div className="flex items-center justify-between gap-4 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[12px] px-5 py-3 font-semibold text-[15px] text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-main)] hover:bg-[var(--border-main)]/30 transition-colors"
        >
          Назад
        </button>
        {!hideNext && onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className={cn(
              'rounded-[12px] px-5 py-3 font-semibold text-[15px] transition-colors',
              nextDisabled
                ? 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95'
            )}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}
