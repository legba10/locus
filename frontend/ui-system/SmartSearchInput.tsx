'use client'

import { cn } from '@/shared/utils/cn'
import { CITIES } from '@/shared/data/cities'

interface SmartSearchInputProps {
  city: string
  onCityChange: (city: string) => void
  budget?: number
  onBudgetChange?: (budget: number) => void
  guests: number
  onGuestsChange: (guests: number) => void
  onSubmit: () => void
  exampleHint?: string
  className?: string
}

/**
 * SmartSearchInput — продуктовый поиск с AI
 * 
 * Must look like product tool, not form
 * AI icon + label: "Smart search"
 */
export function SmartSearchInput({
  city,
  onCityChange,
  budget,
  onBudgetChange,
  guests,
  onGuestsChange,
  onSubmit,
  exampleHint,
  className,
}: SmartSearchInputProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-lg p-4', className)}>
      {/* AI Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <span className="text-sm font-medium text-gray-700">Умный поиск</span>
      </div>

      {/* Inputs */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-3 text-gray-900 bg-white"
        >
          <option value="">Выберите город</option>
          {CITIES.map((cityOption) => (
            <option key={cityOption} value={cityOption}>
              {cityOption}
            </option>
          ))}
        </select>

        {onBudgetChange && (
          <input
            type="number"
            placeholder="Бюджет"
            value={budget || ''}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-4 py-3 text-gray-900 bg-white"
          />
        )}

        <select
          value={guests}
          onChange={(e) => onGuestsChange(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-4 py-3 text-gray-900 bg-white"
        >
          {[1, 2, 3, 4, 5, 6].map(n => (
            <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
          ))}
        </select>

        <button
          onClick={onSubmit}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
        >
          Найти
        </button>
      </div>

      {/* Example hint */}
      {exampleHint && (
        <p className="text-xs text-gray-500 mt-2">{exampleHint}</p>
      )}
    </div>
  )
}
