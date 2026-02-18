'use client'

import { cn } from '@/shared/utils/cn'
import type { ListingPlan } from '@/shared/contracts/api'

export interface TariffCardOption {
  plan: ListingPlan
  title: string
  price: string
  features: string[]
  ctaLabel: string
  active?: boolean
}

const PLAN_STYLES: Record<ListingPlan, string> = {
  free: 'border-[var(--border-main)]',
  pro: 'border-[var(--accent)]/50 bg-[var(--accent)]/5',
  top: 'border-amber-500/50 bg-amber-500/5',
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4 shrink-0', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function TariffCard({
  option,
  onSelect,
  disabled,
}: {
  option: TariffCardOption
  onSelect: () => void
  disabled?: boolean
}) {
  const isActive = option.active
  const isPro = option.plan === 'pro'
  const isTop = option.plan === 'top'

  return (
    <div
      className={cn(
        'rounded-[16px] border p-5 md:p-6 transition-all flex flex-col',
        'bg-[var(--bg-card)]/80 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
        PLAN_STYLES[option.plan],
        isActive && 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-main)]'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            'text-[13px] font-bold uppercase tracking-wide',
            isPro && 'text-[var(--accent)]',
            isTop && 'text-amber-600 dark:text-amber-400'
          )}
        >
          {option.title}
        </span>
        {isActive && (
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">• активен</span>
        )}
      </div>
      <p className="text-[22px] font-bold text-[var(--text-primary)] mb-4">{option.price}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {option.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
            <CheckIcon className="text-[var(--accent)] mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={cn(
          'w-full rounded-[12px] py-2.5 text-[14px] font-semibold transition border',
          isActive
            ? 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-main)] cursor-default'
            : 'bg-[var(--accent)] text-[var(--button-primary-text)] border-[var(--accent)] hover:opacity-95',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        {option.ctaLabel}
      </button>
    </div>
  )
}
