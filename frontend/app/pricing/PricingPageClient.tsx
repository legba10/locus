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
          ? 'bg-violet-600 text-white border-violet-600 shadow-[0_20px_60px_rgba(99,102,241,0.35)]'
          : 'bg-white text-[#1C1F26] border-gray-100 shadow-[0_12px_36px_rgba(17,24,39,0.08)]'
      )}
    >
      {plan.highlight && (
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-violet-400/20 blur-2xl" />
      )}
      {plan.badge && (
        <div
          className={cn(
            'absolute right-5 top-5 rounded-full px-3 py-1 text-[12px] font-semibold',
            plan.theme === 'primary' ? 'bg-white/15 text-white' : 'bg-violet-100 text-violet-700'
          )}
        >
          {plan.badge}
        </div>
      )}
      <h3 className={cn('text-[18px] font-semibold mb-2', plan.theme === 'primary' ? 'text-white' : 'text-[#1C1F26]')}>
        {plan.title}
      </h3>
      {plan.description && (
        <p className={cn('text-[13px] mb-3', plan.theme === 'primary' ? 'text-white/80' : 'text-[#6B7280]')}>
          {plan.description}
        </p>
      )}
      <p className={cn('text-[28px] font-bold mb-4', plan.theme === 'primary' ? 'text-white' : 'text-[#1C1F26]')}>
        {plan.price}
      </p>
      <ul className={cn('text-[14px] space-y-3 mb-6', plan.theme === 'primary' ? 'text-white/90' : 'text-[#6B7280]')}>
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2">
            <Icon name={feature.icon} className={plan.theme === 'primary' ? 'text-white' : 'text-violet-600'} />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.href}
        className={cn(
          'inline-flex items-center justify-center w-full px-4 py-2.5 rounded-[14px] text-[14px] font-semibold transition',
          plan.theme === 'primary'
            ? 'bg-white text-violet-700 hover:bg-white/90'
            : 'bg-violet-600 text-white hover:bg-violet-500'
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
          id: 'basic',
          title: 'BASIC',
          price: '990 ₽/мес',
          description: 'Для собственников: до 10 объявлений.',
          features: [
            { text: 'До 10 объявлений', icon: 'check' },
            { text: 'Сообщения', icon: 'check' },
            { text: 'Управление', icon: 'check' },
          ],
          ctaLabel: 'Начать',
          href: '/pricing#cta',
          theme: 'light',
        },
        {
          id: 'pro',
          title: 'PRO',
          price: '1990 ₽/мес',
          description: 'Для активной сдачи: безлимит объявлений.',
          features: [
            { text: 'Безлимит объявлений', icon: 'spark' },
            { text: 'Всё из Basic', icon: 'check' },
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
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#F7F8FA]">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-[30px] md:text-[40px] font-bold text-[#1C1F26] mb-3">Тарифы LOCUS</h1>
          <p className="text-[15px] md:text-[16px] text-[#6B7280]">
            Выберите тариф под ваши задачи и получите максимум пользы от LOCUS.
          </p>
          {reason === 'host' && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-violet-50 px-4 py-2 text-[13px] text-violet-700">
              Можно разместить 1 объявление бесплатно. Для большего лимита — PRO/AGENCY.
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
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
                    ? 'bg-violet-600 text-white shadow-[0_8px_18px_rgba(99,102,241,0.35)]'
                    : 'text-[#6B7280] hover:text-[#1C1F26]'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[13px] text-[#94A3B8]">
            Переключайтесь между тарифами для жильцов и арендодателей.
          </p>
        </div>

        {userType === 'landlord' && (
          <div className="mb-8 md:mb-10 rounded-[22px] border border-violet-100 bg-white p-6 md:p-7 shadow-[0_12px_40px_rgba(99,102,241,0.10)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-[16px] font-extrabold text-[#1C1F26]">1 объявление бесплатно</div>
                <div className="mt-1 text-[13px] text-[#6B7280]">
                  Разместите первое объявление на FREE и начните получать заявки. Лимит — 1 объявление.
                </div>
              </div>
              <Link
                href={freeCreateHref}
                className="inline-flex items-center justify-center rounded-[14px] bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-violet-500"
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
            'bg-white border border-gray-100 shadow-[0_12px_40px_rgba(15,23,42,0.08)]'
          )}
        >
          <h3 className="text-[18px] md:text-[20px] font-bold text-[#1C1F26] mb-2">Готовы подключить тариф?</h3>
          <p className="text-[14px] text-[#6B7280] mb-5">
            Оставьте заявку, и мы подберём оптимальный план под ваши цели.
          </p>
          <a
            href="mailto:support@locus.app"
            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500 transition"
          >
            Оставить заявку
          </a>
        </div>
      </div>
    </div>
  )
}

