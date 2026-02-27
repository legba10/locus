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
        <div className="progress-bg flex-1 mx-4 h-2 rounded-full overflow-hidden">
          <div
            className="progress-fill h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className={cn(
          'form-step form-step-box rounded-[16px] border p-6 sm:p-[24px]',
          'border-[var(--border-main)] bg-[var(--bg-card)]',
          'shadow-[var(--shadow-card)]'
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
