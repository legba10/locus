'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { LocusRating, LocusRatingCircle } from '@/shared/ui/LocusRating'
import { cn } from '@/shared/utils/cn'

// Types
interface PropertyItem {
  listingId: string
  title: string
  city: string
  currentPrice: number
  status: string
  locusRating: number
  ratingLabel: string
  priceAdvice: {
    recommended: number
    position: string
    diffPercent: number
  }
  riskLevel: string
  bookingProbability: number
}

interface DashboardResponse {
  summary: {
    totalListings: number
    publishedListings: number
    avgLocusRating: number
    revenue30d: number
    pendingBookings: number
    riskLevel: string
  }
  properties: PropertyItem[]
  recommendations: string[]
  recentBookings: any[]
}

// Format price
function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount)
}

// Status badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    PUBLISHED: { label: 'Активно', classes: 'bg-emerald-100 text-emerald-700' },
    DRAFT: { label: 'Черновик', classes: 'bg-gray-100 text-gray-600' },
    BLOCKED: { label: 'Заблокировано', classes: 'bg-red-100 text-red-700' },
    ARCHIVED: { label: 'В архиве', classes: 'bg-gray-100 text-gray-500' },
  }
  const c = config[status] || config.DRAFT
  return <span className={cn('rounded px-2 py-0.5 text-xs font-medium', c.classes)}>{c.label}</span>
}

// Price position badge
function PricePositionBadge({ position, diffPercent }: { position: string; diffPercent: number }) {
  const config: Record<string, { label: string; classes: string }> = {
    below_market: { label: 'Ниже рынка', classes: 'text-emerald-600' },
    market: { label: 'По рынку', classes: 'text-blue-600' },
    above_market: { label: 'Выше рынка', classes: 'text-amber-600' },
  }
  const c = config[position] || config.market
  return (
    <span className={cn('text-xs font-medium', c.classes)}>
      {c.label} {diffPercent !== 0 && `(${diffPercent > 0 ? '+' : ''}${diffPercent}%)`}
    </span>
  )
}

// Summary cards
function SummaryCards({ summary }: { summary: DashboardResponse['summary'] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Объявления</span>
          <span className="text-xl">🏠</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{summary.publishedListings}</p>
        <p className="text-xs text-gray-400">из {summary.totalListings} всего</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Рейтинг LOCUS</span>
          <LocusRatingCircle score={summary.avgLocusRating} size="sm" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{summary.avgLocusRating}</p>
        <p className="text-xs text-gray-400">средний по объявлениям</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Доход за 30 дней</span>
          <span className="text-xl">💰</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.revenue30d)}</p>
        <p className="text-xs text-gray-400">подтверждённые бронирования</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Ожидают подтверждения</span>
          <span className="text-xl">📋</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{summary.pendingBookings}</p>
        <p className="text-xs text-gray-400">новых заявок</p>
      </div>
    </div>
  )
}

// Recommendations panel
function RecommendationsPanel({ recommendations }: { recommendations: string[] }) {
  if (!recommendations.length) return null

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Рекомендации LOCUS
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

// Properties table
function PropertiesTable({ properties }: { properties: PropertyItem[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Мои объявления</h2>
        <p className="text-sm text-gray-500">Рейтинг и рекомендации LOCUS</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Объявление</th>
              <th className="px-3 py-3 text-center font-medium">Рейтинг</th>
              <th className="px-3 py-3 text-center font-medium">Статус</th>
              <th className="px-3 py-3 text-right font-medium">Цена</th>
              <th className="px-3 py-3 text-right font-medium">Рекомендация</th>
              <th className="px-5 py-3 text-center font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties.map((p) => (
              <tr key={p.listingId} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <Link href={`/listings/${p.listingId}`} className="group">
                    <p className="font-medium text-gray-900 group-hover:text-primary-600 transition">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.city}</p>
                  </Link>
                </td>
                <td className="px-3 py-4 text-center">
                  <LocusRating score={p.locusRating} size="sm" showLabel={false} />
                </td>
                <td className="px-3 py-4 text-center">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-4 text-right text-sm text-gray-900">
                  {formatPrice(p.currentPrice)}
                </td>
                <td className="px-3 py-4 text-right">
                  <p className="text-sm font-medium text-primary-600">{formatPrice(p.priceAdvice.recommended)}</p>
                  <PricePositionBadge position={p.priceAdvice.position} diffPercent={p.priceAdvice.diffPercent} />
                </td>
                <td className="px-5 py-4 text-center">
                  <Link 
                    href={`/listings/${p.listingId}/analysis`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Анализ →
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

// Auth required component
function AuthRequired() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Требуется авторизация</h2>
      <p className="mt-2 text-gray-500">Войдите как арендодатель для доступа к панели управления</p>
      <Link href="/auth/login" className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 font-medium text-white hover:bg-primary-700 transition">
        Войти
      </Link>
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-gray-200" />
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>
  )
}

// Main component
export default function LandlordDashboardPage() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<DashboardResponse>(
    ['landlord-dashboard', user?.id],
    '/api/landlord/dashboard',
    { enabled: isAuthenticated() && !!accessToken }
  )

  if (!isAuthenticated()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Кабинет арендодателя</h1>
        <AuthRequired />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Кабинет арендодателя</h1>
          <p className="text-gray-500">
            Аналитика и рекомендации LOCUS
            {user && <span className="text-primary-600 ml-2">• {user.email}</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Обновить
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            ← На главную
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Не удалось загрузить данные. Убедитесь, что backend запущен.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700 hover:bg-red-200 transition"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <SummaryCards summary={data.summary} />
          <RecommendationsPanel recommendations={data.recommendations} />
          <PropertiesTable properties={data.properties} />
        </div>
      )}

      {!isLoading && !error && !data && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">У вас пока нет объявлений</p>
          <Link href="/listings/create" className="mt-4 inline-block text-primary-600 hover:underline">
            Создать первое объявление
          </Link>
        </div>
      )}
    </div>
  )
}
