'use client'

import Link from 'next/link'
import { ListingCard, ListingCardSkeleton } from '@/domains/listing/ListingCard'
import type { ListingsResponse } from '@/domains/listing/listing-api'
import { useFetch } from '@/shared/hooks/useFetch'
import { useAuthStore } from '@/domains/auth'
import { SearchBarAdvanced } from '@/domains/search/SearchBarAdvanced'

// Hero section
function HeroSection() {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/20 via-surface-2 to-brand-2/10 p-8 md:p-12">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-2/10 blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-2 text-sm text-brand mb-4">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          AI-powered поиск жилья
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
          Найдите идеальное жильё с LOCUS
        </h1>
        
        <p className="text-text-mut max-w-2xl mb-6">
          Умный поиск с AI-рекомендациями. Каждое объявление оценено по качеству, 
          и вы видите реальные прогнозы и риски.
          {isAuthenticated() && user && (
            <span className="block mt-2 text-brand">
              Добро пожаловать, {user.email}!
            </span>
          )}
        </p>

        {/* Search bar */}
        <SearchBarAdvanced />
      </div>
    </section>
  )
}

// Category pills
function CategoryPills() {
  const categories = [
    { label: 'Все', icon: '🏠', active: true },
    { label: 'Квартиры', icon: '🏢' },
    { label: 'Дома', icon: '🏡' },
    { label: 'Студии', icon: '🛋️' },
    { label: 'У метро', icon: '🚇' },
    { label: 'Тихие', icon: '🤫' },
    { label: 'С парковкой', icon: '🚗' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.label}
          className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
            cat.active
              ? 'bg-brand text-white'
              : 'bg-surface-2 text-text-mut hover:bg-white/10 hover:text-text'
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  )
}

// Stats section
function StatsSection() {
  const stats = [
    { label: 'Объявлений', value: '1,200+', icon: '🏠' },
    { label: 'Городов', value: '15', icon: '🌆' },
    { label: 'Хостов', value: '500+', icon: '👥' },
    { label: 'AI оценок', value: '10K+', icon: '🤖' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl bg-surface-2 border border-border p-4 text-center">
          <span className="text-2xl">{stat.icon}</span>
          <p className="mt-2 text-2xl font-bold text-text">{stat.value}</p>
          <p className="text-sm text-text-dim">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

// Error state
function ErrorState() {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-red-300">Не удалось загрузить объявления</h3>
      <p className="mt-2 text-sm text-red-200/70">
        Убедитесь, что backend запущен на порту 4000
      </p>
      <code className="mt-3 inline-block rounded bg-red-500/20 px-3 py-1 text-xs text-red-200">
        cd backend && npm run dev
      </code>
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
      <svg className="mx-auto h-16 w-16 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-text">Пока нет объявлений</h3>
      <p className="mt-2 text-sm text-text-mut">
        Запустите seed чтобы добавить тестовые данные
      </p>
      <code className="mt-3 inline-block rounded bg-surface-3 px-3 py-1 text-xs text-text-dim">
        cd backend && npm run db:seed
      </code>
    </div>
  )
}

// Features section
function FeaturesSection() {
  const features = [
    {
      title: 'AI Quality Score',
      description: 'Каждое объявление оценивается по 100-балльной шкале',
      icon: '🎯',
    },
    {
      title: 'Умный поиск',
      description: 'Понимает естественный язык: "тихая квартира у метро"',
      icon: '🔍',
    },
    {
      title: 'Прогноз бронирования',
      description: 'AI предсказывает вероятность успешного бронирования',
      icon: '📊',
    },
    {
      title: 'Рекомендации цены',
      description: 'Оптимальная цена на основе анализа рынка',
      icon: '💰',
    },
  ]

  return (
    <div className="rounded-3xl bg-surface-2 border border-border p-6 md:p-8">
      <h2 className="text-xl font-bold text-text mb-6">Почему LOCUS?</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex gap-4 rounded-xl bg-surface-3/50 p-4">
            <span className="text-3xl">{feature.icon}</span>
            <div>
              <h3 className="font-semibold text-text">{feature.title}</h3>
              <p className="mt-1 text-sm text-text-mut">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main component
export function HomePageClient() {
  const { data, isLoading, error } = useFetch<ListingsResponse>(
    ['listings-home'],
    '/api/listings?limit=9',
  )
  const apiDocsUrl = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/docs`
    : ''

  return (
    <div className="space-y-8">
      <HeroSection />
      
      <CategoryPills />

      {/* Popular listings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-text">Популярные объявления</h2>
            <p className="text-sm text-text-mut">Лучшие варианты по оценке AI</p>
          </div>
          <Link 
            href="/search" 
            className="flex items-center gap-1 text-sm text-brand hover:underline"
          >
            Смотреть все
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        )}
        
        {error && <ErrorState />}

        {!isLoading && !error && data?.items && data.items.length === 0 && <EmptyState />}

        {!isLoading && !error && data?.items && data.items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <StatsSection />
      
      <FeaturesSection />

      {/* Quick access for hosts/admins */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link 
          href="/host/dashboard"
          className="group rounded-2xl border border-border bg-surface-2 p-6 transition hover:border-brand/50 hover:bg-surface-3"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-brand/20 p-3">
              <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text group-hover:text-brand transition">Кабинет хоста</h3>
              <p className="text-sm text-text-mut">AI-аналитика ваших объявлений</p>
            </div>
          </div>
        </Link>

        <a 
          href={apiDocsUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-border bg-surface-2 p-6 transition hover:border-brand-2/50 hover:bg-surface-3"
          aria-disabled={!apiDocsUrl}
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-brand-2/20 p-3">
              <svg className="h-6 w-6 text-brand-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text group-hover:text-brand-2 transition">API документация</h3>
              <p className="text-sm text-text-mut">Swagger UI для разработчиков</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
