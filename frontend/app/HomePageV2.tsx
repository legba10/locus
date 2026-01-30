'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingCardV2, ListingCardV2Skeleton } from '@/domains/listing/ListingCardV2'
import { LocusScoreBadge } from '@/shared/ui/locus-ai/LocusScoreBadge'
import { cn } from '@/shared/utils/cn'

// Types
interface ListingItem {
  id: string
  title: string
  city: string
  basePrice: number
  photo?: string
  score?: number
  verdict?: string
  priceText?: string
  demandLevel?: 'low' | 'medium' | 'high'
  rating?: number
  reviewCount?: number
}

interface ListingsResponse {
  items: ListingItem[]
  total: number
}

// Hero section with search
function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [guests, setGuests] = useState(2)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (guests) params.set('guests', String(guests))
    if (query) params.set('q', query)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative py-16 lg:py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 -z-10" />
      
      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Main headline */}
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Найдите жильё, которое
          <br />
          <span className="text-blue-600">действительно вам подходит</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          LOCUS анализирует рынок и показывает лучшие варианты, а не просто объявления.
          AI помогает выбрать и объясняет, почему это хороший вариант.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
            {/* City */}
            <div className="relative">
              <label className="text-xs text-gray-500 mb-1 block text-left">Куда</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Любой город</option>
                <option value="Москва">Москва</option>
                <option value="Санкт-Петербург">Санкт-Петербург</option>
                <option value="Сочи">Сочи</option>
                <option value="Казань">Казань</option>
              </select>
            </div>

            {/* Query */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block text-left">Что ищете</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Квартира, дом, студия..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block text-left">Гости</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full md:w-auto rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 transition"
              >
                Найти
              </button>
            </div>
          </div>
        </form>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            AI-рекомендации
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            Честная оценка
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            Анализ цен
          </div>
        </div>
      </div>
    </section>
  )
}

// How it works section
function HowItWorksSection() {
  const steps = [
    {
      icon: '🔍',
      title: 'Найдите жильё',
      description: 'Введите город и дату — LOCUS покажет лучшие варианты',
    },
    {
      icon: '🤖',
      title: 'Получите AI-анализ',
      description: 'Узнайте плюсы, минусы и риски каждого варианта',
    },
    {
      icon: '✓',
      title: 'Примите решение',
      description: 'Выберите лучший вариант и забронируйте',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Как LOCUS помогает выбрать
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Recommended listings section
function RecommendedSection() {
  const { data, isLoading, error } = useFetch<ListingsResponse>(
    ['listings-home'],
    '/api/listings?limit=6',
  )

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Рекомендации LOCUS</h2>
            <p className="text-gray-600">Лучшие варианты по оценке AI</p>
          </div>
          <Link href="/search" className="text-blue-600 hover:underline font-medium">
            Смотреть все →
          </Link>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ListingCardV2Skeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">Не удалось загрузить объявления</p>
          </div>
        )}

        {data?.items && data.items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.slice(0, 6).map((item) => (
              <ListingCardV2
                key={item.id}
                id={item.id}
                title={item.title}
                city={item.city}
                price={item.basePrice}
                photo={item.photo}
                score={item.score ?? 70}
                verdict={item.verdict ?? 'Хороший вариант'}
                priceText={item.priceText}
                demandLevel={item.demandLevel ?? 'medium'}
                rating={item.rating}
                reviewCount={item.reviewCount}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && (!data?.items || data.items.length === 0) && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
            <div className="text-4xl mb-4">🏠</div>
            <p className="text-gray-500">Пока нет объявлений</p>
          </div>
        )}
      </div>
    </section>
  )
}

// For owners section
function ForOwnersSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 mb-4">
              Для владельцев жилья
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Сдавайте жильё выгоднее с LOCUS
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              AI анализирует ваше объявление и подсказывает, как увеличить доход:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-emerald-500">✓</span>
                Оптимальная цена на основе анализа рынка
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-emerald-500">✓</span>
                Советы по улучшению объявления
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-emerald-500">✓</span>
                Прогноз дохода и спроса
              </li>
            </ul>
            <Link
              href="/owner/dashboard"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
            >
              Кабинет владельца →
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Ваше объявление</span>
              <LocusScoreBadge score={78} size="md" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Текущая цена</span>
                <span className="font-medium text-gray-900">4 500 ₽/ночь</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Рекомендуемая цена</span>
                <span className="font-medium text-emerald-600">4 800 ₽/ночь</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Потенциальный рост</span>
                <span className="font-medium text-blue-600">+18%</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <span>💡</span>
                <span>Добавьте 3 фото кухни — это увеличит интерес на 15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Main component
export function HomePageV2() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <RecommendedSection />
      <ForOwnersSection />
    </div>
  )
}
