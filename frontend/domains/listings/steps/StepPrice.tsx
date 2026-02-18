'use client'

import { cn } from '@/shared/utils/cn'
import type { RentMode } from './StepType'

const inputCls = cn(
  'w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)]',
  'text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'
)

export interface StepPriceProps {
  rentMode: RentMode
  price: string
  deposit: string
  commission: string
  utilities: string
  onPriceChange: (v: string) => void
  onDepositChange: (v: string) => void
  onCommissionChange: (v: string) => void
  onUtilitiesChange: (v: string) => void
}

export function StepPrice({
  rentMode,
  price,
  deposit,
  commission,
  utilities,
  onPriceChange,
  onDepositChange,
  onCommissionChange,
  onUtilitiesChange,
}: StepPriceProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-2">Режим</p>
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">
          {rentMode === 'night' ? 'За сутки' : 'За месяц'}
        </p>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Цена, ₽</label>
        <input value={price} onChange={(e) => onPriceChange(e.target.value)} className={inputCls} type="number" min={0} placeholder={rentMode === 'night' ? '5000' : '45000'} />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Залог, ₽</label>
        <input value={deposit} onChange={(e) => onDepositChange(e.target.value)} className={inputCls} type="number" min={0} placeholder="0" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Комиссия</label>
        <input value={commission} onChange={(e) => onCommissionChange(e.target.value)} className={inputCls} placeholder="Нет" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Коммуналка</label>
        <input value={utilities} onChange={(e) => onUtilitiesChange(e.target.value)} className={inputCls} placeholder="Включена / отдельно" />
      </div>
    </div>
  )
}
