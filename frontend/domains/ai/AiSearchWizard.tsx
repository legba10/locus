'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { CITIES } from '@/shared/data/cities'

interface AiSearchWizardProps {
  onSearch: (params: AiSearchParams) => void
  initialParams?: Partial<AiSearchParams>
}

export interface AiSearchParams {
  city: string
  priceMin: number
  priceMax: number
  type: string
  rooms: number
  rentPeriod: string
  priorities: {
    price: boolean
    location: boolean
    infrastructure: boolean
    safety: boolean
    rating: boolean
  }
}

/**
 * AI-мастер подбора жилья
 * 
 * Поля:
 * - Город
 * - Бюджет (мин/макс)
 * - Тип жилья
 * - Комнаты
 * - Срок аренды
 * - Приоритеты (чекбоксы)
 */
export function AiSearchWizard({ onSearch, initialParams }: AiSearchWizardProps) {
  const [city, setCity] = useState(initialParams?.city || '')
  const [priceMin, setPriceMin] = useState(initialParams?.priceMin || 0)
  const [priceMax, setPriceMax] = useState(initialParams?.priceMax || 0)
  const [type, setType] = useState(initialParams?.type || '')
  const [rooms, setRooms] = useState(initialParams?.rooms || 0)
  const [rentPeriod, setRentPeriod] = useState(initialParams?.rentPeriod || '')
  const [priorities, setPriorities] = useState(initialParams?.priorities || {
    price: false,
    location: false,
    infrastructure: false,
    safety: false,
    rating: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({
      city,
      priceMin,
      priceMax,
      type,
      rooms,
      rentPeriod,
      priorities,
    })
  }

  const togglePriority = (key: keyof typeof priorities) => {
    setPriorities(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className={cn(
      'rounded-[20px] p-6 mb-6',
      'bg-[var(--bg-card)] border border-[var(--border-main)]',
      'shadow-[var(--shadow-card)]'
    )}>
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        <h2 className="text-[20px] font-bold text-[var(--text-primary)]">AI-мастер подбора жилья</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Город */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Город</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={cn(
              'w-full rounded-[14px] px-4 py-3',
              'border border-[var(--border-main)] bg-[var(--bg-input)]',
              'text-[var(--text-primary)] text-[14px] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
            )}
          >
            <option value="">Выберите город</option>
            {CITIES.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
        </div>

        {/* Бюджет */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Бюджет от (₽/мес)</label>
            <input
              type="number"
              value={priceMin || ''}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              placeholder="0"
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-[var(--border-main)] bg-[var(--bg-input)]',
                'text-[var(--text-primary)] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Бюджет до (₽/мес)</label>
            <input
              type="number"
              value={priceMax || ''}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              placeholder="100000"
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-[var(--border-main)] bg-[var(--bg-input)]',
                'text-[var(--text-primary)] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]'
              )}
            />
          </div>
        </div>

        {/* Тип жилья */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Тип жилья</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={cn(
              'w-full rounded-[14px] px-4 py-3',
              'border border-[var(--border-main)] bg-[var(--bg-input)]',
              'text-[var(--text-primary)] text-[14px] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
            )}
          >
            <option value="">Любой</option>
            <option value="apartment">Квартира</option>
            <option value="room">Комната</option>
            <option value="house">Дом</option>
            <option value="studio">Студия</option>
          </select>
        </div>

        {/* Комнаты */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Комнаты</label>
          <select
            value={rooms || ''}
            onChange={(e) => setRooms(Number(e.target.value))}
            className={cn(
              'w-full rounded-[14px] px-4 py-3',
              'border border-[var(--border-main)] bg-[var(--bg-input)]',
              'text-[var(--text-primary)] text-[14px] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
            )}
          >
            <option value="0">Любое</option>
            <option value="1">1 комната</option>
            <option value="2">2 комнаты</option>
            <option value="3">3 комнаты</option>
            <option value="4">4+ комнаты</option>
          </select>
        </div>

        {/* Срок аренды */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Срок аренды</label>
          <select
            value={rentPeriod}
            onChange={(e) => setRentPeriod(e.target.value)}
            className={cn(
              'w-full rounded-[14px] px-4 py-3',
              'border border-[var(--border-main)] bg-[var(--bg-input)]',
              'text-[var(--text-primary)] text-[14px] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
            )}
          >
            <option value="">Любой</option>
            <option value="short">Краткосрочная (до 1 месяца)</option>
            <option value="medium">Средняя (1-6 месяцев)</option>
            <option value="long">Долгосрочная (от 6 месяцев)</option>
          </select>
        </div>

        {/* Приоритеты */}
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-3">Приоритеты</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'price' as const, label: 'Цена' },
              { key: 'location' as const, label: 'Расположение' },
              { key: 'infrastructure' as const, label: 'Инфраструктура' },
              { key: 'safety' as const, label: 'Безопасность' },
              { key: 'rating' as const, label: 'Рейтинг' },
            ].map(priority => (
              <label
                key={priority.key}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-[12px] cursor-pointer',
                  'border border-[var(--border-main)] bg-[var(--bg-input)]',
                  'hover:bg-[var(--bg-secondary)] transition-colors',
                  priorities[priority.key] && 'bg-[var(--accent)]/10 border-[var(--accent)]'
                )}
              >
                <input
                  type="checkbox"
                  checked={priorities[priority.key]}
                  onChange={() => togglePriority(priority.key)}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-[14px] font-medium text-[var(--text-primary)]">{priority.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Кнопка */}
        <button
          type="submit"
          className={cn(
            'w-full py-3 rounded-[14px]',
            'bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[15px]',
            'hover:bg-violet-500 transition-colors',
            'shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
          )}
        >
          Подобрать
        </button>
      </form>
    </div>
  )
}
