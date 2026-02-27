'use client'

/** TZ-57: Модалка «Продвинуть объявление» — bottom sheet, лёгкий overlay, без обрезания карточек. */

import { useEffect, useState } from 'react'
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (open) {
      setExiting(false)
      document.body.style.overflow = 'hidden'
      document.body.classList.add('modal-open')
      requestAnimationFrame(() => setSheetOpen(true))
    } else {
      setSheetOpen(false)
      setExiting(true)
    }
  }, [open])

  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(() => {
      setExiting(false)
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }, 300)
    return () => clearTimeout(t)
  }, [exiting])

  if (!open && !exiting) return null

  const options = OPTIONS.map((o) => ({
    ...o,
    active: o.plan === currentPlan,
    ctaLabel: o.plan === currentPlan ? 'Текущий' : o.ctaLabel,
  }))

  const handleOverlayClick = () => onClose()

  return (
    <div
      className="promotion-overlay-tz57"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Продвинуть объявление"
    >
      <div
        className={cn('promotion-bottom-sheet-tz57', sheetOpen && !exiting && 'promotion-bottom-sheet-tz57--open')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative pb-2">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] pr-12">Продвинуть объявление?</h2>
          <button
            type="button"
            onClick={onClose}
            className="promotion-modal-close-tz57"
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
        <div className="flex flex-col">
          {options.map((opt) => (
            <TariffCard
              key={opt.plan}
              option={opt}
              onSelect={() => listingId && onSelectPlan(listingId, opt.plan)}
              disabled={isLoading || opt.plan === currentPlan}
              className={cn('tariff-card', opt.active && 'active')}
              buttonClassName={opt.active ? 'tariff-current' : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
