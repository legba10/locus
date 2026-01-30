'use client'

import { cn } from '@/shared/utils/cn'

interface Explanation {
  summary?: string
  pros?: string[]
  cons?: string[]
  tips?: string[]
}

interface ExplanationBlockProps {
  title?: string
  explanation: Explanation
  className?: string
}

/**
 * Блок объяснения оценки LOCUS - понятный человеческий язык
 */
export function ExplanationBlock({ 
  title = 'Почему LOCUS рекомендует этот вариант',
  explanation, 
  className 
}: ExplanationBlockProps) {
  const { summary, pros = [], cons = [], tips = [] } = explanation

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {summary && (
        <p className="text-gray-600 mb-4">{summary}</p>
      )}

      <div className="space-y-4">
        {/* Плюсы */}
        {pros.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Преимущества
            </h4>
            <ul className="space-y-1.5">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Минусы */}
        {cons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Обратите внимание
            </h4>
            <ul className="space-y-1.5">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-amber-500 mt-0.5">!</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Советы */}
        {tips.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Рекомендации
            </h4>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
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

/**
 * Компактный блок объяснения для карточки
 */
export function ExplanationBadges({ pros = [], cons = [] }: { pros?: string[]; cons?: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {pros.slice(0, 2).map((pro, i) => (
        <span 
          key={`pro-${i}`} 
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700"
        >
          <span>✓</span>
          {pro.length > 25 ? pro.substring(0, 25) + '...' : pro}
        </span>
      ))}
      {cons.slice(0, 1).map((con, i) => (
        <span 
          key={`con-${i}`} 
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700"
        >
          <span>!</span>
          {con.length > 25 ? con.substring(0, 25) + '...' : con}
        </span>
      ))}
    </div>
  )
}
