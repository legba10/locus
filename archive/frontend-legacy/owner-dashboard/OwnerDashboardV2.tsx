'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { LocusScoreBadge, LocusScoreCircle } from '@/shared/ui/locus-ai/LocusScoreBadge'
import { LocusRecommendationBlock } from '@/shared/ui/locus-ai/LocusRecommendationBlock'
import { cn } from '@/shared/utils/cn'

// Types
interface OwnerInsight {
  score: number
  verdict: string
  verdictText: string
  pros: string[]
  cons: string[]
  risks: string[]
  pricePosition: string
  priceText: string
  recommendedPrice: number
  demandLevel: string
  demandText: string
  bookingProbability: number
  recommendation: string
  tips: string[]
  monthlyRevenueForecast: number
  potentialGrowth: Array<{
    action: string
    impact: string
    percentIncrease: number
  }>
}

interface ListingWithInsight {
  id: string
  title: string
  insight: OwnerInsight
}

interface OwnerDashboardData {
  listings: ListingWithInsight[]
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount)
}

// Summary cards
function SummaryCards({ listings }: { listings: ListingWithInsight[] }) {
  const totalListings = listings.length
  const avgScore = listings.length > 0 
    ? Math.round(listings.reduce((s, l) => s + l.insight.score, 0) / listings.length)
    : 0
  const totalRevenue = listings.reduce((s, l) => s + l.insight.monthlyRevenueForecast, 0)
  const avgProbability = listings.length > 0
    ? Math.round(listings.reduce((s, l) => s + l.insight.bookingProbability, 0) / listings.length)
    : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500 mb-1">Объявления</div>
        <div className="text-2xl font-bold text-gray-900">{totalListings}</div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500 mb-1">Средняя оценка</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{avgScore}</span>
          <LocusScoreBadge score={avgScore} size="sm" showLabel={false} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500 mb-1">Прогноз дохода/мес</div>
        <div className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500 mb-1">Шанс бронирования</div>
        <div className="text-2xl font-bold text-gray-900">{avgProbability}%</div>
      </div>
    </div>
  )
}

// Listing card for owner
function OwnerListingCard({ listing }: { listing: ListingWithInsight }) {
  const { insight } = listing
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <Link href={`/listings/${listing.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition">
              {listing.title}
            </Link>
            <p className="text-sm text-gray-500 mt-1">{insight.verdictText}</p>
          </div>
          <LocusScoreCircle score={insight.score} size="md" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Рекомендуемая цена</div>
            <div className="font-semibold text-emerald-600">{formatPrice(insight.recommendedPrice)}/ночь</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Прогноз дохода</div>
            <div className="font-semibold text-gray-900">{formatPrice(insight.monthlyRevenueForecast)}/мес</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Цена vs рынок</div>
            <div className={cn(
              'font-semibold',
              insight.pricePosition === 'below_market' ? 'text-emerald-600' :
              insight.pricePosition === 'above_market' ? 'text-amber-600' : 'text-gray-900'
            )}>
              {insight.priceText}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Шанс бронирования</div>
            <div className="font-semibold text-blue-600">{insight.bookingProbability}%</div>
          </div>
        </div>

        {/* Growth potential */}
        {insight.potentialGrowth.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Как увеличить доход</h4>
            <div className="space-y-2">
              {insight.potentialGrowth.slice(0, 2).map((growth, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{growth.action}</span>
                  <span className="font-medium text-emerald-600">+{growth.percentIncrease}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {insight.tips.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-blue-800">
              <span className="mt-0.5">💡</span>
              <span>{insight.tips[0]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Auth required
function AuthRequired() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center max-w-md mx-auto">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold text-gray-900">Требуется авторизация</h2>
      <p className="mt-2 text-gray-500">Войдите как владелец жилья для доступа к кабинету</p>
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
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  )
}

// Main component
export function OwnerDashboardV2() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<OwnerDashboardData>(
    ['owner-insight', user?.id],
    '/api/owner/insight',
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
          <h1 className="text-2xl font-bold text-gray-900">Ваши объявления глазами LOCUS</h1>
          <p className="text-gray-500">
            AI-анализ и рекомендации для увеличения дохода
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            🔄 Обновить
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            ← На главную
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Не удалось загрузить данные</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-xl bg-red-100 px-4 py-2 text-sm text-red-700 hover:bg-red-200 transition"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {data && data.listings.length > 0 && (
        <div className="space-y-6">
          <SummaryCards listings={data.listings} />
          
          {/* AI recommendation */}
          <LocusRecommendationBlock 
            recommendation="Если вы улучшите фото и снизите цену на 5%, ваш доход может вырасти на 20%"
            tips={[
              'Добавьте фото кухни и ванной',
              'Укажите все доступные удобства',
              'Ответьте на отзывы гостей',
            ]}
          />

          {/* Listings grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Мои объявления</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {data.listings.map((listing) => (
                <OwnerListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (!data || data.listings.length === 0) && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="text-4xl mb-4">🏠</div>
          <p className="text-gray-500 mb-4">У вас пока нет объявлений</p>
          <Link 
            href="/listings/create" 
            className="inline-block rounded-xl bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition"
          >
            Создать объявление
          </Link>
        </div>
      )}
    </div>
  )
}
