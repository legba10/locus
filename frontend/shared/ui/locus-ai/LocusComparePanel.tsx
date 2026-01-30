'use client'

import { cn } from '@/shared/utils/cn'
import { LocusScoreBadge } from './LocusScoreBadge'

interface CompareItem {
  id: string
  title: string
  price: number
  score: number
  pros: string[]
  cons: string[]
  photo?: string
}

interface LocusComparePanelProps {
  items: CompareItem[]
  onRemove?: (id: string) => void
  className?: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount)
}

/**
 * LocusComparePanel — сравнение вариантов
 * 
 * Помогает пользователю выбрать лучший вариант
 */
export function LocusComparePanel({ items, onRemove, className }: LocusComparePanelProps) {
  if (items.length === 0) {
    return (
      <div className={cn('rounded-xl border border-gray-200 bg-gray-50 p-6 text-center', className)}>
        <div className="text-3xl mb-2">⚖️</div>
        <p className="text-gray-500">Добавьте объявления для сравнения</p>
      </div>
    )
  }

  // Определяем лучший вариант
  const bestItem = items.reduce((best, item) => item.score > best.score ? item : best, items[0])

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white overflow-hidden', className)}>
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Сравнение вариантов</h3>
        <p className="text-sm text-gray-500">LOCUS рекомендует: {bestItem.title}</p>
      </div>

      <div className="grid divide-x divide-gray-200" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => (
          <div key={item.id} className={cn('p-4', item.id === bestItem.id && 'bg-blue-50')}>
            {/* Бейдж лучшего */}
            {item.id === bestItem.id && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                  ⭐ Лучший выбор
                </span>
              </div>
            )}

            {/* Фото */}
            <div className="aspect-[4/3] rounded-lg bg-gray-100 mb-3 overflow-hidden">
              {item.photo ? (
                <img src={item.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">🏠</div>
              )}
            </div>

            {/* Заголовок и цена */}
            <h4 className="font-medium text-gray-900 truncate mb-1">{item.title}</h4>
            <p className="text-lg font-bold text-gray-900 mb-2">{formatPrice(item.price)}/ночь</p>

            {/* Оценка */}
            <div className="mb-3">
              <LocusScoreBadge score={item.score} size="sm" />
            </div>

            {/* Плюсы */}
            {item.pros.length > 0 && (
              <div className="mb-2">
                {item.pros.slice(0, 2).map((pro, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-emerald-600">
                    <span>✓</span>
                    <span className="truncate">{pro}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Минусы */}
            {item.cons.length > 0 && (
              <div className="mb-3">
                {item.cons.slice(0, 1).map((con, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-amber-600">
                    <span>•</span>
                    <span className="truncate">{con}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Удалить */}
            {onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                className="w-full text-center text-xs text-gray-400 hover:text-red-500 transition"
              >
                Убрать из сравнения
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
