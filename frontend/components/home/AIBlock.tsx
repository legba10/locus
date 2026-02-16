'use client'

import { cn } from '@/shared/utils/cn'

/**
 * ТЗ-5: блок «Подберём жильё за 10 секунд» — без перехода на поиск.
 * Кнопка вызывает onStartClick (открытие модалки пошагового подбора). Если onStartClick не передан — кнопка не ведёт на search.
 */
export interface AIBlockProps {
  /** При нажатии «Начать подбор» — открыть модалку wizard (не переход на /listings) */
  onStartClick?: () => void
}

export function AIBlock({ onStartClick }: AIBlockProps) {
  return (
    <section className="py-16" aria-label="AI подбор">
      <div className="market-container max-w-5xl mx-auto">
        <div
          className={cn(
            'rounded-2xl p-8 md:p-10 border border-[var(--border)] bg-[var(--card-bg)]'
          )}
        >
          <h2 className="text-[22px] md:text-[26px] font-bold text-[var(--text-main)] mb-2">
            Подберём жильё за 10 секунд
          </h2>
          <p className="text-[var(--text-secondary)] text-[15px] mb-6 max-w-xl">
            AI найдёт лучшие варианты под вас
          </p>
          <button
            type="button"
            onClick={onStartClick}
            disabled={!onStartClick}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[15px] font-semibold',
              'bg-[var(--accent)] text-white',
              'hover:opacity-95 active:scale-[0.98] transition-all',
              !onStartClick && 'opacity-60 cursor-not-allowed'
            )}
          >
            Начать подбор
          </button>
        </div>
      </div>
    </section>
  )
}
