'use client'

import { cn } from '@/shared/utils/cn'

export type PropertyType = 'apartment' | 'studio' | 'house' | 'room' | 'apartment_suite'
export type RentMode = 'night' | 'month'

const TYPES: { id: PropertyType; label: string }[] = [
  { id: 'apartment', label: 'Квартира' },
  { id: 'studio', label: 'Студия' },
  { id: 'house', label: 'Дом' },
  { id: 'room', label: 'Комната' },
  { id: 'apartment_suite', label: 'Апартаменты' },
]

export interface StepTypeProps {
  type: PropertyType
  rentMode: RentMode
  onTypeChange: (t: PropertyType) => void
  onRentModeChange: (m: RentMode) => void
}

export function StepType({ type, rentMode, onTypeChange, onRentModeChange }: StepTypeProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-3">Тип жилья</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTypeChange(t.id)}
              className={cn(
                'rounded-[16px] p-5 border-2 text-left font-semibold text-[15px] transition-all',
                type === t.id
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_2px_12px_rgba(124,58,237,0.2)]'
                  : 'border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-[var(--accent)]/50'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-3">Режим</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onRentModeChange('night')}
            className={cn(
              'flex-1 rounded-[16px] p-4 border-2 font-semibold text-[15px] transition-all',
              rentMode === 'night'
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-[var(--accent)]/50'
            )}
          >
            Посуточно
          </button>
          <button
            type="button"
            onClick={() => onRentModeChange('month')}
            className={cn(
              'flex-1 rounded-[16px] p-4 border-2 font-semibold text-[15px] transition-all',
              rentMode === 'month'
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-[var(--accent)]/50'
            )}
          >
            Длительно
          </button>
        </div>
      </div>
    </div>
  )
}
