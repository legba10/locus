'use client'

import { cn } from '@/shared/utils/cn'
import { DS } from '@/shared/lib/design-system'

const STEPS = [
  {
    num: 1,
    title: 'Вы выбираете параметры',
    description: 'Город, тип жилья, бюджет и другие критерии',
  },
  {
    num: 2,
    title: 'LOCUS анализирует',
    description: 'Изучаем тысячи объявлений по десяткам параметров',
  },
  {
    num: 3,
    title: 'Вы получаете варианты',
    description: 'С объяснением, почему они вам подходят',
  },
]

/**
 * ТЗ-MAIN-REDESIGN: Как работает — 3 карточки, bg-[var(--card)] p-6 rounded-2xl border.
 */
export function HowItWorks() {
  return (
    <section
      className={cn('py-16 bg-[var(--bg)]')}
      aria-label="Как это работает"
    >
      <div className="market-container max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={cn(DS.sectionTitle, 'mb-2')}>
            Как это работает
          </h2>
          <p className={cn(DS.sectionSub)}>
            Три простых шага до идеального жилья
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ num, title, description }) => (
            <div
              key={num}
              className={cn(
                'rounded-2xl p-6 border bg-[var(--card)] border-[var(--border)]',
                DS.transition,
                'hover:shadow-lg'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] mb-4',
                  'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                )}
              >
                {num}
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--text)] mb-2">
                {title}
              </h3>
              <p className="text-[var(--sub)] text-[14px] leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
