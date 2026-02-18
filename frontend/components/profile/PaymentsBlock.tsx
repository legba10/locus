'use client'

import { ProfileCard } from './ProfileCard'

export function PaymentsBlock() {
  return (
    <div className="space-y-6">
      <ProfileCard title="Платежи">
        <p className="text-[14px] text-[var(--text-secondary)] mb-4">Баланс: <span className="font-semibold text-[var(--text-primary)]">0 ₽</span></p>
        <p className="text-[14px] text-[var(--text-secondary)] mb-4">Метод выплат: <span className="font-semibold text-[var(--text-primary)]">не указан</span></p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="px-4 py-2.5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-95">
            Добавить карту
          </button>
          <button type="button" className="px-4 py-2.5 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] font-medium hover:bg-[var(--bg-main)]">
            История выплат
          </button>
        </div>
      </ProfileCard>
    </div>
  )
}
