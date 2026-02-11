'use client'

import { cn } from '@/shared/utils/cn'
import { LocusScoreBadge } from './LocusScoreBadge'

interface LocusInsightBlockProps {
  score: number
  verdict: string
  priceText: string
  recommendation: string
  pros?: string[]
  cons?: string[]
  risks?: string[]
  demand?: 'low' | 'medium' | 'high'
  bookingProbability?: number
  tips?: string[]
  className?: string
}

/**
 * LocusInsightBlock — блок AI-анализа
 * 
 * Использование:
 * <LocusInsightBlock
 *   score={78}
 *   verdict="Хороший вариант"
 *   priceText="Цена ниже рынка на 12%"
 *   recommendation="Выгодно бронировать сейчас"
 * />
 */
export function LocusInsightBlock({
  score,
  verdict,
  priceText,
  recommendation,
  pros = [],
  cons = [],
  risks = [],
  demand,
  bookingProbability,
  tips = [],
  className,
}: LocusInsightBlockProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white overflow-hidden', className)}>
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Анализ LOCUS</h3>
            <p className="text-gray-600">{recommendation}</p>
          </div>
          <LocusScoreBadge score={score} size="lg" />
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Почему хороший вариант */}
        {pros.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
              Почему это хороший вариант
            </h4>
            <ul className="space-y-1.5">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* На что обратить внимание */}
        {cons.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
              На что обратить внимание
            </h4>
            <ul className="space-y-1.5">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Риски */}
        {risks.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-red-700 mb-2">
              ⚠️ Риски
            </h4>
            <ul className="space-y-1.5">
              {risks.map((risk, i) => (
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
            <div className="font-medium text-gray-900">{priceText}</div>
          </div>
          {demand && (
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-gray-500 mb-1">Спрос</div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {demand === 'high' ? 'Высокий' : demand === 'medium' ? 'Средний' : 'Низкий'}
                </span>
                <DemandBars level={demand} />
              </div>
            </div>
          )}
        </div>

        {/* Вероятность бронирования */}
        {bookingProbability !== undefined && (
          <div className="rounded-xl bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Шанс бронирования</span>
              <span className="font-bold text-blue-900">{Math.round(bookingProbability * 100)}%</span>
            </div>
            <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${bookingProbability * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Советы */}
        {tips.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Советы</h4>
            <ul className="space-y-1.5">
              {tips.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
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

function DemandBars({ level }: { level: 'low' | 'medium' | 'high' }) {
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

/**
 * LocusInsightMini — компактная версия для карточек
 */
export function LocusInsightMini({ verdict, priceText, className }: { 
  verdict: string
  priceText: string
  className?: string 
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="text-sm font-medium text-gray-900">{verdict}</div>
      <div className="text-xs text-gray-500">{priceText}</div>
    </div>
  )
}
