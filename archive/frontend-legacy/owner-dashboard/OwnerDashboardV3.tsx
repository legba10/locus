'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { LocusScoreBadge, LocusScoreCircle } from '@/shared/ui/locus/LocusScoreBadge'
import { LocusPriceBlock } from '@/shared/ui/locus/LocusPriceBlock'
import { cn } from '@/shared/utils/cn'

interface ListingInsight {
  score: number
  verdict: string
  priceDiff: number
  pricePosition: 'below_market' | 'market' | 'above_market'
  recommendedPrice: number
  demand: 'low' | 'medium' | 'high'
  bookingProbability: number
  tips: string[]
}

interface OwnerListing {
  id: string
  title: string
  city: string
  price: number
  insight: ListingInsight
}

interface OwnerDashboardData {
  summary: {
    totalListings: number
    avgScore: number
    totalRevenue: number
    avgProbability: number
  }
  listings: OwnerListing[]
  recommendations: string[]
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount)
}

// Блок 1: Общая статистика
function SummaryBlock({ summary }: { summary: OwnerDashboardData['summary'] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500">Объявления</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{summary.totalListings}</div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500">Средняя оценка</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">{summary.avgScore}</span>
          <LocusScoreBadge score={summary.avgScore} size="sm" showLabel={false} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500">Потенциальный доход</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(summary.totalRevenue)}/мес</div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500">Шанс бронирования</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{summary.avgProbability}%</div>
      </div>
    </div>
  )
}

// Блок 2: Таблица объявлений
function ListingsTable({ listings }: { listings: OwnerListing[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Мои объявления</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Объявление</th>
              <th className="px-4 py-3 font-medium">Оценка</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Рекомендуемая</th>
              <th className="px-4 py-3 font-medium">Спрос</th>
              <th className="px-4 py-3 font-medium">Шанс</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <Link href={`/listings/${listing.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {listing.title}
                    </Link>
                    <div className="text-sm text-gray-500">{listing.city}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <LocusScoreBadge score={listing.insight.score} size="sm" />
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {formatPrice(listing.price)}/ночь
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'font-medium',
                    listing.insight.pricePosition === 'below_market' ? 'text-emerald-600' :
                    listing.insight.pricePosition === 'above_market' ? 'text-amber-600' : 'text-gray-900'
                  )}>
                    {formatPrice(listing.insight.recommendedPrice)}/ночь
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    listing.insight.demand === 'high' ? 'bg-emerald-100 text-emerald-700' :
                    listing.insight.demand === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    {listing.insight.demand === 'high' ? 'Высокий' : listing.insight.demand === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {Math.round(listing.insight.bookingProbability * 100)}%
                </td>
                <td className="px-4 py-3">
                  <Link href={`/listings/${listing.id}`} className="text-blue-600 hover:underline text-sm">
                    Подробнее
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Блок 3: AI-рекомендации
function RecommendationsBlock({ recommendations }: { recommendations: string[] }) {
  if (recommendations.length === 0) return null

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
        🤖 Рекомендации LOCUS
      </h3>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
            <span className="text-blue-500 mt-0.5">→</span>
            {rec}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Блок 4: Потенциал дохода
function RevenuePotentialBlock({ listings }: { listings: OwnerListing[] }) {
  const currentTotal = listings.reduce((s, l) => s + l.price * 0.6 * 30, 0)
  const optimizedTotal = listings.reduce((s, l) => s + l.insight.recommendedPrice * 0.7 * 30, 0)
  const growth = optimizedTotal - currentTotal
  const growthPercent = currentTotal > 0 ? Math.round((growth / currentTotal) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Потенциал дохода</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Текущий прогноз</span>
          <span className="font-medium text-gray-900">{formatPrice(currentTotal)}/мес</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">При оптимизации</span>
          <span className="font-medium text-emerald-600">{formatPrice(optimizedTotal)}/мес</span>
        </div>
        <hr className="border-gray-100" />
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Потенциальный рост</span>
          <span className="font-bold text-emerald-600">+{formatPrice(growth)} (+{growthPercent}%)</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Следуйте рекомендациям LOCUS для увеличения дохода
      </p>
    </div>
  )
}

// Auth required
function AuthRequired() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center max-w-md mx-auto">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold text-gray-900">Требуется авторизация</h2>
      <p className="mt-2 text-gray-500">Войдите как владелец жилья</p>
      <Link 
        href="/auth/login" 
        className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition"
      >
        Войти
      </Link>
    </div>
  )
}

// Loading
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200" />)}
      </div>
      <div className="h-64 rounded-xl bg-gray-200" />
      <div className="h-32 rounded-xl bg-gray-200" />
    </div>
  )
}

/**
 * OwnerDashboardV3 — кабинет владельца
 * 
 * Блоки:
 * 1. Общая статистика
 * 2. Таблица объявлений
 * 3. AI-рекомендации  
 * 4. Потенциал дохода
 */
export function OwnerDashboardV3() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<OwnerDashboardData>(
    ['owner-dashboard-v3', user?.id],
    '/api/owner/dashboard',
    { enabled: isAuthenticated() && !!accessToken }
  )

  if (!isAuthenticated()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Кабинет владельца</h1>
        <AuthRequired />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Кабинет владельца</h1>
          <p className="text-gray-500">Аналитика и рекомендации LOCUS</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            🔄 Обновить
          </button>
          <Link
            href="/listings/create"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            + Добавить объявление
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Не удалось загрузить данные</p>
          <button onClick={() => refetch()} className="mt-3 text-sm text-red-700 hover:underline">
            Попробовать снова
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Блок 1: Статистика */}
          <SummaryBlock summary={data.summary} />

          {/* Блок 3: Рекомендации */}
          <RecommendationsBlock recommendations={data.recommendations} />

          {/* Блок 2: Таблица */}
          {data.listings.length > 0 && <ListingsTable listings={data.listings} />}

          {/* Блок 4: Потенциал */}
          {data.listings.length > 0 && <RevenuePotentialBlock listings={data.listings} />}

          {data.listings.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <div className="text-4xl mb-4">🏠</div>
              <p className="text-gray-500 mb-4">У вас пока нет объявлений</p>
              <Link 
                href="/listings/create" 
                className="inline-block rounded-xl bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition"
              >
                Создать первое объявление
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
