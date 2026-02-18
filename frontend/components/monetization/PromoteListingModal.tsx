'use client'

import { cn } from '@/shared/utils/cn'
import type { ListingPlan } from '@/shared/contracts/api'
import { TariffCard, type TariffCardOption } from './TariffCard'

const OPTIONS: TariffCardOption[] = [
  {
    plan: 'free',
    title: 'Базовый',
    price: '0 ₽',
    features: ['Обычный показ', 'Без поднятия', 'Без приоритета'],
    ctaLabel: 'Базовый',
  },
  {
    plan: 'pro',
    title: 'PRO',
    price: '299 ₽',
    features: ['Показы в 2× выше', 'Значок PRO', 'AI-описание', 'Статистика'],
    ctaLabel: 'Активировать PRO',
  },
  {
    plan: 'top',
    title: 'TOP',
    price: '599 ₽',
    features: ['В топе поиска', 'Бейдж TOP', 'Приоритет', 'Пуш-показы'],
    ctaLabel: 'TOP размещение',
  },
]

export interface PromoteListingModalProps {
  open: boolean
  onClose: () => void
  listingId: string | null
  currentPlan?: ListingPlan
  onSelectPlan: (listingId: string, plan: ListingPlan) => void | Promise<void>
  isLoading?: boolean
}

export function PromoteListingModal({
  open,
  onClose,
  listingId,
  currentPlan = 'free',
  onSelectPlan,
  isLoading,
}: PromoteListingModalProps) {
  if (!open) return null

  const options = OPTIONS.map((o) => ({ ...o, active: o.plan === currentPlan, ctaLabel: o.plan === currentPlan ? 'Текущий' : o.ctaLabel }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          'w-full max-w-2xl rounded-[20px] border border-[var(--border-main)] p-6 md:p-8',
          'bg-[var(--bg-card)]/95 backdrop-blur-xl shadow-xl',
          'flex flex-col max-h-[90vh] overflow-hidden'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)]">Продвинуть объявление?</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[10px] text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] mb-6">
          Выберите тариф размещения. PRO и TOP увеличивают просмотры и конверсию.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-y-auto">
          {options.map((opt) => (
            <TariffCard
              key={opt.plan}
              option={opt}
              onSelect={() => listingId && onSelectPlan(listingId, opt.plan)}
              disabled={isLoading || opt.plan === currentPlan}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
