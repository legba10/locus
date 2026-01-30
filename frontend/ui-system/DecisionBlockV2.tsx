'use client'

import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { ScoreBadgeV2 } from './ScoreBadgeV2'
import { ReasonList, createReasonsFromDecision } from './ReasonList'
import { AIHint } from './AIHint'
import { RU, getVerdictFromScore } from '@/core/i18n/ru'

export interface DecisionData {
  score: number
  verdict?: string
  reasons?: string[]
  risks?: string[]
  priceDiff?: number
  demandLevel?: 'low' | 'medium' | 'high'
  recommendation?: string
  personalizedReasons?: string[]
}

interface DecisionBlockV2Props {
  decision: DecisionData
  variant?: 'card' | 'page' | 'compact'
  title?: string
  className?: string
}

/**
 * DecisionBlockV2 — Блок AI решения
 * 
 * Phase 7: AI объясняет, а не считает
 * 
 * ❌ 78 / 100
 * ✅ Хороший вариант
 * 
 * ❌ demandLevel = medium
 * ✅ Средний спрос
 */
export function DecisionBlockV2({
  decision,
  variant = 'page',
  title = RU.block.locus_analysis,
  className,
}: DecisionBlockV2Props) {
  const [expanded, setExpanded] = useState(variant === 'page')
  const verdictType = getVerdictFromScore(decision.score)
  const verdictText = decision.verdict || RU.verdict[verdictType]

  const reasons = createReasonsFromDecision(decision)

  // Compact variant for cards
  if (variant === 'compact') {
    return (
      <div className={cn('', className)}>
        <ScoreBadgeV2 score={decision.score} size="sm" showLabel />
        {reasons.length > 0 && (
          <div className="mt-1.5">
            <ReasonList reasons={reasons} maxItems={2} />
          </div>
        )}
      </div>
    )
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className={cn('', className)}>
        <ScoreBadgeV2 score={decision.score} size="md" showLabel />
        {reasons.length > 0 && (
          <div className="mt-2">
            <ReasonList reasons={reasons} maxItems={3} />
          </div>
        )}
        {decision.recommendation && (
          <div className="mt-2">
            <AIHint text={decision.recommendation} variant="tip" />
          </div>
        )}
      </div>
    )
  }

  // Full page variant
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white', className)}>
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="p-4">
        {/* Вердикт (без числа!) */}
        <div className="mb-4">
          <ScoreBadgeV2 score={decision.score} size="lg" showLabel />
        </div>

        {/* Почему подходит */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              {RU.block.why_fits}:
            </div>
            <ReasonList reasons={reasons} maxItems={3} />
          </div>
        )}

        {/* Подходит именно вам */}
        {decision.personalizedReasons && decision.personalizedReasons.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-sm font-medium text-emerald-900 mb-1">
              {RU.block.for_you}:
            </div>
            <ul className="space-y-1">
              {decision.personalizedReasons.slice(0, 3).map((r, i) => (
                <li key={i} className="text-sm text-emerald-800 flex items-center gap-1">
                  <span>✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Рекомендация LOCUS */}
        {decision.recommendation && (
          <div className="pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500 mb-1">
              {RU.block.locus_recommends}:
            </div>
            <p className="font-medium text-gray-900">{decision.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  )
}
