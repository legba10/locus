'use client'

import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { ScoreBadge } from './Badge'
import { ProsList, RisksList, TipBlock } from './InfoBlock'

/**
 * LocusDecision — единый формат AI-решения
 */
export interface LocusDecision {
  /** Оценка 0-100 */
  score: number
  /** Вердикт: "Отличный вариант", "Хороший вариант", "Сомнительно", "Не рекомендуем" */
  verdict: string
  /** Краткое объяснение (1 строка) */
  explanation: string
  /** Плюсы (max 3) */
  pros: string[]
  /** Риски (max 2) */
  risks: string[]
  /** Разница с рынком (%) */
  priceDiff: number
  /** Уровень спроса */
  demandLevel: 'low' | 'medium' | 'high'
  /** Рекомендация (1 строка) */
  recommendation: string
}

interface DecisionBlockProps {
  decision: LocusDecision
  /** Вариант отображения */
  variant?: 'full' | 'compact' | 'mini'
  /** Заголовок блока */
  title?: string
  className?: string
}

function getVerdictColor(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function getPriceText(diff: number) {
  if (diff > 0) return `Цена ниже рынка на ${diff}%`
  if (diff < 0) return `Цена выше рынка на ${Math.abs(diff)}%`
  return 'Цена по рынку'
}

const demandLabels = {
  low: 'Низкий спрос',
  medium: 'Средний спрос',
  high: 'Высокий спрос',
}

/**
 * DecisionBlock — главный AI-компонент продукта
 * 
 * На экране показывать:
 * - score
 * - verdict
 * - explanation
 * - recommendation
 * 
 * Все остальное — раскрываемое.
 */
export function DecisionBlock({
  decision,
  variant = 'full',
  title = 'Почему это жильё вам подходит',
  className,
}: DecisionBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const { score, verdict, explanation, pros, risks, priceDiff, demandLevel, recommendation } = decision
  const verdictColor = getVerdictColor(score)

  // Mini — только score + verdict
  if (variant === 'mini') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <ScoreBadge score={score} size="sm" />
        <span className={cn('text-sm font-medium', verdictColor)}>{verdict}</span>
      </div>
    )
  }

  // Compact — score, verdict, explanation
  if (variant === 'compact') {
    return (
      <div className={cn('', className)}>
        <div className="flex items-center gap-2 mb-1">
          <ScoreBadge score={score} size="md" />
          <span className={cn('font-medium', verdictColor)}>{verdict}</span>
        </div>
        <p className="text-sm text-gray-600">{explanation}</p>
      </div>
    )
  }

  // Full — все детали
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white', className)}>
      {/* Заголовок */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="p-4">
        {/* Score + Verdict */}
        <div className="flex items-center gap-3 mb-3">
          <ScoreBadge score={score} size="lg" />
          <div>
            <div className={cn('text-lg font-semibold', verdictColor)}>{verdict}</div>
            <div className="text-sm text-gray-500">Оценка: {score} / 100</div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-gray-700 mb-3">{explanation}</p>

        {/* Price + Demand */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm">
          <span className={priceDiff > 0 ? 'text-emerald-600' : priceDiff < 0 ? 'text-amber-600' : 'text-gray-600'}>
            {getPriceText(priceDiff)}
          </span>
          <span className="text-gray-400">•</span>
          <span className={demandLevel === 'high' ? 'text-emerald-600' : demandLevel === 'low' ? 'text-amber-600' : 'text-gray-600'}>
            {demandLabels[demandLevel]}
          </span>
        </div>

        {/* Pros (visible) */}
        {pros.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-1">Почему подходит:</div>
            <ProsList items={pros.slice(0, 3)} />
          </div>
        )}

        {/* Expandable section */}
        {(risks.length > 0 || expanded) && (
          <>
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Показать риски и детали →
              </button>
            ) : (
              <>
                {/* Risks */}
                {risks.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-amber-700 mb-1">На что обратить внимание:</div>
                    <RisksList items={risks.slice(0, 2)} />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Recommendation */}
        {recommendation && (
          <TipBlock className="mt-3">{recommendation}</TipBlock>
        )}
      </div>
    </div>
  )
}

/**
 * PersonalizedFitBlock — "Подходит именно вам"
 */
interface PersonalizedFitBlockProps {
  reasons: string[]
  className?: string
}

export function PersonalizedFitBlock({ reasons, className }: PersonalizedFitBlockProps) {
  if (!reasons.length) return null
  
  return (
    <div className={cn('rounded-xl border border-emerald-200 bg-emerald-50 p-4', className)}>
      <h3 className="font-semibold text-emerald-900 mb-2">Подходит именно вам</h3>
      <ul className="space-y-1.5">
        {reasons.slice(0, 3).map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
            <span className="mt-0.5">✓</span>
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}
