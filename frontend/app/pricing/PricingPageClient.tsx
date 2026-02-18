"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/domains/auth'

type PlanFeature = {
  text: string
  icon: 'check' | 'spark'
}

type PlanCard = {
  id: string
  title: string
  price: string
  description?: string
  features: PlanFeature[]
  ctaLabel: string
  href: string
  badge?: string
  highlight?: boolean
  theme?: 'light' | 'primary'
}

const Icon = ({ name, className }: { name: PlanFeature['icon']; className?: string }) => {
  if (name === 'spark') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('h-5 w-5', className)}>
        <path
          d="M12 3l1.9 4.9L19 9.8l-4.1 2.9L15.9 18 12 14.9 8.1 18l1-5.3L5 9.8l5.1-1.9L12 3z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('h-5 w-5', className)}>
      <path
        d="M9.2 16.2L5.7 12.7l-1.4 1.4 4.9 4.9L20 8.1l-1.4-1.4-9.4 9.5z"
        fill="currentColor"
      />
    </svg>
  )
}

const PlanCardItem = ({ plan }: { plan: PlanCard }) => {
  return (
    <div
      className={cn(
        'relative rounded-[26px] border p-6 md:p-7 transition-all',
        plan.highlight ? 'md:scale-[1.02]' : 'hover:-translate-y-0.5',
        plan.theme === 'primary'
          ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_20px_60px_rgba(124,58,237,0.15)]'
          : 'bg-[var(--bg-card)] border-[var(--border-main)] shadow-[0_12px_36px_rgba(0,0,0,0.06)]'
      )}
    >
      {plan.highlight && (
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-[var(--accent)]/10 blur-2xl" />
      )}
      {plan.badge && (
        <div
          className={cn(
            'absolute right-5 top-5 rounded-full px-3 py-1 text-[12px] font-semibold border',
            plan.theme === 'primary'
              ? 'bg-[var(--accent)]/20 text-[var(--text-primary)] border-[var(--accent)]/40'
              : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-main)]'
          )}
        >
          {plan.badge}
        </div>
      )}
      <h3 className="text-[18px] font-semibold mb-2 text-[var(--text-primary)]">
        {plan.title}
      </h3>
      {plan.description && (
        <p className="text-[13px] mb-3 text-[var(--text-secondary)]">
          {plan.description}
        </p>
      )}
      <p className="text-[28px] font-bold mb-4 text-[var(--text-primary)]">
        {plan.price}
      </p>
      <ul className="text-[14px] space-y-3 mb-6 text-[var(--text-secondary)]">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2">
            <Icon name={feature.icon} className="text-[var(--accent)] shrink-0" />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.href}
        className={cn(
          'inline-flex items-center justify-center w-full px-4 py-2.5 rounded-[14px] text-[14px] font-semibold transition border',
          'bg-[var(--accent)] text-[var(--button-primary-text)] border-[var(--accent)] hover:opacity-95'
        )}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  )
}

export function PricingPageClient({ reason }: { reason?: string | null }) {
  const [userType, setUserType] = useState<'seeker' | 'landlord'>('seeker')
  const { user, isAuthenticated } = useAuthStore()
  const limit = user?.listingLimit ?? 1
  const used = user?.listingUsed ?? 0
  const freeCreateHref = isAuthenticated() && used >= limit ? '/pricing?reason=limit' : '/owner/dashboard?tab=add'

  const plans = useMemo<PlanCard[]>(() => {
    if (userType === 'landlord') {
      return [
        {
          id: 'pro',
          title: 'PRO',
          price: '990 ₽/мес',
          description: 'До 50 объявлений.',
          features: [
            { text: 'До 50 объявлений', icon: 'check' },
            { text: 'Сообщения', icon: 'check' },
            { text: 'Управление', icon: 'check' },
          ],
          ctaLabel: 'Подключить',
          href: '/pricing#cta',
          theme: 'light',
        },
        {
          id: 'max',
          title: 'MAX',
          price: '1990 ₽/мес',
          description: 'Безлимит объявлений + максимальный приоритет.',
          features: [
            { text: 'Безлимит объявлений', icon: 'spark' },
            { text: 'Всё из PRO', icon: 'check' },
            { text: 'Приоритет', icon: 'check' },
            { text: 'Аналитика', icon: 'check' },
            { text: 'AI рекомендации', icon: 'spark' },
          ],
          ctaLabel: 'Подключить',
          href: '/pricing#cta',
          badge: 'Рекомендуем',
          highlight: true,
          theme: 'primary',
        },
      ]
    }

    return [
      {
        id: 'free',
        title: 'FREE',
        price: '0 ₽',
        description: 'Базовые возможности для старта.',
        features: [
          { text: 'Просмотр объявлений', icon: 'check' },
          { text: 'Избранное', icon: 'check' },
          { text: 'Сообщения', icon: 'check' },
          { text: 'Бронирование', icon: 'check' },
        ],
        ctaLabel: 'Начать поиск',
        href: '/listings',
        theme: 'light',
      },
      {
        id: 'ai-pro',
        title: 'AI PRO',
        price: '299 ₽/мес',
        description: 'Для быстрого поиска идеального жилья.',
        features: [
          { text: 'AI подбор жилья', icon: 'spark' },
          { text: 'Умные рекомендации', icon: 'spark' },
          { text: 'Быстрый поиск', icon: 'check' },
          { text: 'Приоритетные объявления', icon: 'check' },
        ],
        ctaLabel: 'Подключить',
        href: '/pricing#cta',
        badge: 'Популярный',
        highlight: true,
        theme: 'primary',
      },
    ]
  }, [userType])

  return (
    <div className="min-h-screen">
      <div className="container py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-[30px] md:text-[40px] font-bold text-[var(--text-primary)] mb-3">Тарифы LOCUS</h1>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)]">
            Выберите тариф под ваши задачи и получите максимум пользы от LOCUS.
          </p>
          {reason === 'host' && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-4 py-2 text-[13px] text-[var(--text-primary)]">
              Можно разместить 1 объявление бесплатно. Для большего лимита — PRO/AGENCY.
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="inline-flex items-center rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            {[
              { value: 'seeker', label: 'Ищу жильё' },
              { value: 'landlord', label: 'Сдаю жильё' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setUserType(item.value as 'seeker' | 'landlord')}
                aria-pressed={userType === item.value}
                className={cn(
                  'px-4 md:px-5 py-2 rounded-full text-[13px] md:text-[14px] font-semibold transition',
                  userType === item.value
                    ? 'bg-[var(--accent)] text-[var(--button-primary-text)] shadow-[0_2px_8px_rgba(124,58,237,0.25)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Переключайтесь между тарифами для жильцов и арендодателей.
          </p>
        </div>

        {userType === 'landlord' && (
          <div className="mb-8 md:mb-10 rounded-[22px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-[16px] font-extrabold text-[var(--text-primary)]">1 объявление бесплатно</div>
                <div className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  Разместите первое объявление на FREE и начните получать заявки. Лимит — 1 объявление.
                </div>
              </div>
              <Link
                href={freeCreateHref}
                className="inline-flex items-center justify-center rounded-[14px] bg-[var(--accent)] border border-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-[var(--button-primary-text)] hover:opacity-95"
              >
                Разместить бесплатно
              </Link>
            </div>
          </div>
        )}

        <div
          className={cn(
            'grid gap-6',
            userType === 'landlord'
              ? 'grid-cols-1 md:grid-cols-2 md:max-w-5xl md:mx-auto'
              : 'grid-cols-1 md:grid-cols-2 md:max-w-4xl md:mx-auto'
          )}
        >
          {plans.map((plan) => (
            <PlanCardItem key={plan.id} plan={plan} />
          ))}
        </div>

        <div
          id="cta"
          className={cn(
            'mt-12 rounded-[22px] p-6 md:p-8 text-center',
            'bg-[var(--bg-card)] border border-[var(--border-main)] shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
          )}
        >
          <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)] mb-2">Готовы подключить тариф?</h3>
          <p className="text-[14px] text-[var(--text-secondary)] mb-5">
            Оставьте заявку, и мы подберём оптимальный план под ваши цели.
          </p>
          <a
            href="mailto:support@locus.app"
            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-95 transition border border-[var(--accent)]"
          >
            Оставить заявку
          </a>
        </div>
      </div>
    </div>
  )
}

