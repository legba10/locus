'use client'

import { cn } from '@/shared/utils/cn'

const inputCls = cn(
  'w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)]',
  'text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'
)

export interface StepRulesProps {
  checkIn: string
  checkOut: string
  pets: string
  smoking: string
  parties: string
  onCheckInChange: (v: string) => void
  onCheckOutChange: (v: string) => void
  onPetsChange: (v: string) => void
  onSmokingChange: (v: string) => void
  onPartiesChange: (v: string) => void
}

/** ТЗ-5: Правила — заезд, выезд, животные, курение, вечеринки */
export function StepRules({
  checkIn,
  checkOut,
  pets,
  smoking,
  parties,
  onCheckInChange,
  onCheckOutChange,
  onPetsChange,
  onSmokingChange,
  onPartiesChange,
}: StepRulesProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Заезд</label>
        <input value={checkIn} onChange={(e) => onCheckInChange(e.target.value)} className={inputCls} placeholder="После 14:00" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Выезд</label>
        <input value={checkOut} onChange={(e) => onCheckOutChange(e.target.value)} className={inputCls} placeholder="До 12:00" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Животные</label>
        <input value={pets} onChange={(e) => onPetsChange(e.target.value)} className={inputCls} placeholder="Нельзя / по согласованию" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Курение</label>
        <input value={smoking} onChange={(e) => onSmokingChange(e.target.value)} className={inputCls} placeholder="Нельзя" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Вечеринки</label>
        <input value={parties} onChange={(e) => onPartiesChange(e.target.value)} className={inputCls} placeholder="Запрещены" />
      </div>
    </div>
  )
}
