'use client'

import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { DS } from '@/shared/lib/design-system'

/**
 * ТЗ-MAIN-REDESIGN: AI-блок — градиент фон, CTA «Попробовать AI подбор».
 */
export function AIBlock() {
  return (
    <section className="py-16" aria-label="AI подбор">
      <div className="market-container max-w-5xl mx-auto">
        <div
          className={cn(
            'rounded-2xl p-8 md:p-10',
            'bg-gradient-to-r from-violet-600/20 to-indigo-600/20',
            'border border-[var(--border)]',
            DS.transition,
            'hover:from-violet-600/25 hover:to-indigo-600/25'
          )}
        >
          <h2 className="text-[22px] md:text-[26px] font-bold text-[var(--text)] mb-2">
            LOCUS анализирует рынок за вас
          </h2>
          <p className="text-[var(--sub)] text-[15px] mb-6 max-w-xl">
            Умный подбор по бюджету, локации и предпочтениям с объяснением рекомендаций
          </p>
          <Link
            href="/listings?ai=true"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[15px] font-semibold',
              'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
              DS.transition,
              'hover:opacity-95 active:scale-[0.98]'
            )}
          >
            Попробовать AI подбор
          </Link>
        </div>
      </div>
    </section>
  )
}
