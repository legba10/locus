'use client'

import { cn } from '@/shared/utils/cn'
import { InsightBadge } from './InsightBadge'
import { PriceHint } from './PriceHint'
import { DemandIndicator } from './DemandIndicator'

interface AIInsight {
  score: number
  scoreLabel: string
  pros: string[]
  risks: string[]
  priceRecommendation: number
  pricePosition: 'below_market' | 'market' | 'above_market'
  priceDiff: number
  demandLevel: 'low' | 'medium' | 'high'
  bookingProbability: number
  tips: string[]
  summary: string
}

interface InsightPanelProps {
  insight: AIInsight
  currentPrice: number
  className?: string
}

/**
 * InsightPanel — полный блок AI-анализа объявления
 * Показывает все данные понятным языком
 */
export function InsightPanel({ insight, currentPrice, className }: InsightPanelProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white overflow-hidden', className)}>
      {/* Заголовок с оценкой */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Анализ от LOCUS</h3>
            <p className="text-sm text-gray-600 mt-0.5">{insight.summary}</p>
          </div>
          <InsightBadge score={insight.score} size="lg" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Почему это хороший вариант */}
        {insight.pros.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
              <span className="text-lg">👍</span>
              Почему это хороший вариант
            </h4>
            <ul className="space-y-1.5">
              {insight.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Риски */}
        {insight.risks.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
              <span className="text-lg">⚠️</span>
              Обратите внимание
            </h4>
            <ul className="space-y-1.5">
              {insight.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5">!</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Цена и спрос */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-gray-100">
          <PriceHint
            currentPrice={currentPrice}
            recommendedPrice={insight.priceRecommendation}
            position={insight.pricePosition}
            diff={insight.priceDiff}
          />
          <DemandIndicator
            level={insight.demandLevel}
            bookingProbability={insight.bookingProbability}
          />
        </div>

        {/* Советы от LOCUS */}
        {insight.tips.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <h4 className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
              <span className="text-lg">🤖</span>
              Советы от LOCUS
            </h4>
            <ul className="space-y-1.5">
              {insight.tips.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * InsightPanelCompact — компактная версия для карточек
 */
export function InsightPanelCompact({ insight }: { insight: AIInsight }) {
  return (
    <div className="space-y-2">
      {/* Плюсы (макс 2) */}
      {insight.pros.slice(0, 2).map((pro, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-700">
          <span>✓</span>
          <span className="truncate">{pro}</span>
        </div>
      ))}
      {/* Риски (макс 1) */}
      {insight.risks.slice(0, 1).map((risk, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-amber-700">
          <span>!</span>
          <span className="truncate">{risk}</span>
        </div>
      ))}
    </div>
  )
}
