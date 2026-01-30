'use client'

import { cn } from '@/shared/utils/cn'

interface LocusDecisionBlockProps {
  /** Оценка 0-100 */
  score: number
  /** Вывод: "Подходит", "Хороший вариант", и т.д. */
  verdict: string
  /** Почему (1-2 аргумента) */
  reasons?: string[]
  /** Совет (1 строка) */
  tip?: string
  /** Размер */
  size?: 'sm' | 'md' | 'lg'
  /** Показывать кнопку "Подробнее" */
  showMore?: boolean
  onShowMore?: () => void
  className?: string
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-gray-400'
}

/**
 * LocusDecisionBlock — единый компонент AI-решения
 * 
 * Правило 3-3-1:
 * - 3 факта
 * - 3 аргумента  
 * - 1 вывод
 * 
 * Используется:
 * - в карточке (sm)
 * - на странице объявления (md/lg)
 * - в кабинете владельца (md)
 */
export function LocusDecisionBlock({
  score,
  verdict,
  reasons = [],
  tip,
  size = 'md',
  showMore = false,
  onShowMore,
  className,
}: LocusDecisionBlockProps) {
  const scoreColor = getScoreColor(score)

  // Размеры
  const sizes = {
    sm: { score: 'text-sm px-2 py-0.5', text: 'text-sm', gap: 'gap-2' },
    md: { score: 'text-base px-2.5 py-1', text: 'text-base', gap: 'gap-3' },
    lg: { score: 'text-lg px-3 py-1.5', text: 'text-base', gap: 'gap-4' },
  }
  const s = sizes[size]

  return (
    <div className={cn('', className)}>
      {/* Оценка + вердикт */}
      <div className={cn('flex items-center', s.gap)}>
        <span className={cn('rounded-lg font-bold text-white', scoreColor, s.score)}>
          {score}
        </span>
        <span className={cn('font-medium text-gray-900', s.text)}>
          {verdict}
        </span>
      </div>

      {/* Почему (1-2 аргумента) */}
      {reasons.length > 0 && (
        <div className="mt-2 space-y-1">
          {reasons.slice(0, 2).map((reason, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-emerald-500">✓</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Совет */}
      {tip && (
        <div className="mt-2 text-sm text-blue-600">
          💡 {tip}
        </div>
      )}

      {/* Кнопка подробнее */}
      {showMore && onShowMore && (
        <button 
          onClick={onShowMore}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Подробнее →
        </button>
      )}
    </div>
  )
}

/**
 * LocusDecisionBadge — мини-версия для карточек
 */
export function LocusDecisionBadge({ score, verdict }: { score: number; verdict: string }) {
  const scoreColor = getScoreColor(score)
  
  return (
    <div className="flex items-center gap-2">
      <span className={cn('rounded px-1.5 py-0.5 text-xs font-bold text-white', scoreColor)}>
        {score}
      </span>
      <span className="text-sm text-gray-700">{verdict}</span>
    </div>
  )
}
