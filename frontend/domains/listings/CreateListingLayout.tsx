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
  /** TZ-63: текст «Осталось N шагов до публикации» */
  stepsLeft?: number
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
  stepsLeft,
}: CreateListingLayoutProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="flex flex-col min-h-0 max-w-2xl mx-auto">
      {/* TZ-63: прогресс — подпись «Шаг X из N», полоска с анимацией */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[var(--text-primary)] tabular-nums">
            Шаг {currentStep} из {totalSteps}
          </span>
          <span className="text-[12px] text-[var(--text-secondary)] tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="progress-bg h-2 rounded-full overflow-hidden">
          <div
            className="progress-fill h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className={cn(
          'form-step form-step-box rounded-[16px] border p-6 sm:p-[24px]',
          'border-[var(--border-main)] bg-[var(--bg-card)]'
        )}
      >
        {children}
      </div>

      {/* TZ-63: «Осталось N шагов до публикации» */}
      {typeof stepsLeft === 'number' && stepsLeft > 0 && (
        <p className="mt-4 text-[13px] text-[var(--text-secondary)] text-center">
          Осталось {stepsLeft} {stepsLeft === 1 ? 'шаг' : stepsLeft < 5 ? 'шага' : 'шагов'} до публикации
        </p>
      )}

      <div className="form-navigation">
        <button
          type="button"
          onClick={onBack}
          className="form-nav-back"
        >
          Назад
        </button>
        {!hideNext && onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="form-nav-next"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}
