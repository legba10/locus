'use client'

import { cn } from '@/shared/utils/cn'
import { LocusScoreBadge } from './LocusScoreBadge'

interface LocusInsight {
  score: number
  verdict: string
  verdictText: string
  pros: string[]
  cons: string[]
  risks: string[]
  pricePosition: string
  priceText: string
  demandLevel: string
  demandText: string
  bookingProbability: number
  recommendation: string
  tips: string[]
}

interface LocusInsightCardProps {
  insight: LocusInsight
  currentPrice?: number
  className?: string
}

/**
 * LocusInsightCard — главный блок AI-анализа
 * 
 * Принцип: Пользователь получает решение, а не данные
 */
export function LocusInsightCard({ insight, currentPrice, className }: LocusInsightCardProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white overflow-hidden', className)}>
      {/* Заголовок с оценкой */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">Оценка LOCUS</h3>
            </div>
            <p className="text-gray-600">{insight.recommendation}</p>
          </div>
          <LocusScoreBadge score={insight.score} size="lg" />
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Почему это хороший вариант */}
        {insight.pros.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
              Почему это хороший вариант
            </h4>
            <ul className="space-y-1.5">
              {insight.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-emerald-500">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* На что обратить внимание */}
        {insight.cons.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
              На что обратить внимание
            </h4>
            <ul className="space-y-1.5">
              {insight.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Риски */}
        {insight.risks.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-red-700 mb-2">
              <span>⚠️</span>
              Риски
            </h4>
            <ul className="space-y-1.5">
              {insight.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5">!</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Цена и спрос */}
        <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-gray-100">
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="text-xs text-gray-500 mb-1">Цена</div>
            <div className={cn(
              'font-medium',
              insight.pricePosition === 'below_market' ? 'text-emerald-600' :
              insight.pricePosition === 'above_market' ? 'text-amber-600' : 'text-gray-900'
            )}>
              {insight.priceText}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="text-xs text-gray-500 mb-1">Спрос</div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{insight.demandText}</span>
              <DemandIndicator level={insight.demandLevel} />
            </div>
          </div>
        </div>

        {/* Вероятность бронирования */}
        <div className="rounded-xl bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Шанс бронирования</span>
            <span className="font-bold text-blue-900">{insight.bookingProbability}%</span>
          </div>
          <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${insight.bookingProbability}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function DemandIndicator({ level }: { level: string }) {
  const bars = level === 'high' ? 3 : level === 'medium' ? 2 : 1
  const color = level === 'high' ? 'bg-emerald-500' : level === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((bar) => (
        <div key={bar} className={cn('w-1.5 h-4 rounded-sm', bar <= bars ? color : 'bg-gray-200')} />
      ))}
    </div>
  )
}
