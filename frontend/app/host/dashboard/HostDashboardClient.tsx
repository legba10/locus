'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'

// Types
interface PropertyIntelligence {
  listingId: string
  title: string
  city: string
  currentPrice: number
  status: string
  intelligence: {
    qualityScore: number
    demandScore: number
    riskScore: number
    riskLevel: string
    bookingProbability: number
    recommendedPrice: number
    priceDeltaPercent: number
    marketPosition: string
  }
  explanation: {
    text: string
    bullets: string[]
    suggestions: string[]
  }
}

interface HostIntelligenceResponse {
  summary: {
    totalListings: number
    revenueForecast: number
    occupancyForecast: number
    riskLevel: 'low' | 'medium' | 'high'
    overallHealth: 'excellent' | 'good' | 'needs_attention'
    avgQuality: number
    avgDemand: number
  }
  properties: PropertyIntelligence[]
  recommendations: string[]
}

// Format price
function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount)
}

// Score circle
function ScoreCircle({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 75 ? 'text-green-400 stroke-green-400' : score >= 50 ? 'text-yellow-400 stroke-yellow-400' : 'text-red-400 stroke-red-400'
  const circumference = 2 * Math.PI * 16
  const strokeDashoffset = circumference - (score / 100) * circumference
  const sizeClass = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'

  return (
    <div className={cn('relative', sizeClass)}>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
        <circle
          cx="20" cy="20" r="16" fill="none" strokeWidth="3" strokeLinecap="round"
          className={color}
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className={cn('absolute inset-0 flex items-center justify-center font-bold', textSize, color)}>
        {score}
      </div>
    </div>
  )
}

// Health badge
function HealthBadge({ health }: { health: 'excellent' | 'good' | 'needs_attention' }) {
  const config = {
    excellent: { label: 'Отлично', color: 'bg-green-500/20 text-green-400', icon: '🎉' },
    good: { label: 'Хорошо', color: 'bg-blue-500/20 text-blue-400', icon: '👍' },
    needs_attention: { label: 'Требует внимания', color: 'bg-orange-500/20 text-orange-400', icon: '⚠️' },
  }
  const c = config[health]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium', c.color)}>
      {c.icon} {c.label}
    </span>
  )
}

// Risk level badge
function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { label: string; color: string }> = {
    low: { label: 'Низкий', color: 'bg-green-500/20 text-green-400' },
    medium: { label: 'Средний', color: 'bg-yellow-500/20 text-yellow-400' },
    high: { label: 'Высокий', color: 'bg-red-500/20 text-red-400' },
  }
  const c = config[level] || config.medium
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', c.color)}>{c.label}</span>
}

// Market position badge
function MarketBadge({ position }: { position: string }) {
  const config: Record<string, { label: string; color: string; icon: string }> = {
    below_market: { label: 'Ниже рынка', color: 'text-green-400', icon: '↓' },
    at_market: { label: 'По рынку', color: 'text-blue-400', icon: '=' },
    above_market: { label: 'Выше рынка', color: 'text-orange-400', icon: '↑' },
  }
  const c = config[position] || config.at_market
  return <span className={cn('text-xs font-medium', c.color)}>{c.icon} {c.label}</span>
}

// Summary cards
function SummaryCards({ summary }: { summary: HostIntelligenceResponse['summary'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-2xl">🏠</span>
          <HealthBadge health={summary.overallHealth} />
        </div>
        <p className="mt-4 text-3xl font-bold text-text">{summary.totalListings}</p>
        <p className="text-sm text-text-mut">Объявлений</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-2xl">💰</span>
          <span className="text-xs text-text-dim">прогноз 30д</span>
        </div>
        <p className="mt-4 text-3xl font-bold text-brand">{formatPrice(summary.revenueForecast)}</p>
        <p className="text-sm text-text-mut">Ожидаемый доход</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-2xl">📊</span>
          <span className="text-xs text-text-dim">средняя</span>
        </div>
        <p className="mt-4 text-3xl font-bold text-brand-2">{Math.round(summary.occupancyForecast * 100)}%</p>
        <p className="text-sm text-text-mut">Вероятность брони</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-text-dim mb-2">Качество</p>
            <ScoreCircle score={summary.avgQuality} size="sm" />
          </div>
          <div>
            <p className="text-xs text-text-dim mb-2">Спрос</p>
            <ScoreCircle score={summary.avgDemand} size="sm" />
          </div>
        </div>
        <p className="mt-2 text-sm text-text-mut">Средние показатели</p>
      </div>
    </div>
  )
}

// Properties table
function PropertiesTable({ properties }: { properties: PropertyIntelligence[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-text">Ваши объявления</h2>
        <p className="text-sm text-text-mut">AI-метрики для каждого объекта</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-surface-3/50">
            <tr className="text-xs text-text-dim">
              <th className="px-5 py-3 text-left font-medium">Объявление</th>
              <th className="px-3 py-3 text-center font-medium">Качество</th>
              <th className="px-3 py-3 text-center font-medium">Спрос</th>
              <th className="px-3 py-3 text-center font-medium">Риск</th>
              <th className="px-3 py-3 text-right font-medium">Текущая цена</th>
              <th className="px-3 py-3 text-right font-medium">Рекомендация</th>
              <th className="px-3 py-3 text-center font-medium">Позиция</th>
              <th className="px-5 py-3 text-center font-medium">Бронь</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {properties.map((p) => (
              <tr key={p.listingId} className="hover:bg-white/5 transition">
                <td className="px-5 py-4">
                  <Link href={`/listings/${p.listingId}`} className="group">
                    <p className="font-medium text-text group-hover:text-brand transition">{p.title}</p>
                    <p className="text-xs text-text-dim">{p.city}</p>
                  </Link>
                </td>
                <td className="px-3 py-4 text-center">
                  <ScoreCircle score={p.intelligence.qualityScore} size="sm" />
                </td>
                <td className="px-3 py-4 text-center">
                  <ScoreCircle score={p.intelligence.demandScore} size="sm" />
                </td>
                <td className="px-3 py-4 text-center">
                  <RiskBadge level={p.intelligence.riskLevel} />
                </td>
                <td className="px-3 py-4 text-right text-sm text-text">
                  {formatPrice(p.currentPrice)}
                </td>
                <td className="px-3 py-4 text-right">
                  <p className="text-sm font-medium text-brand-2">{formatPrice(p.intelligence.recommendedPrice)}</p>
                  {p.intelligence.priceDeltaPercent !== 0 && (
                    <p className={cn(
                      'text-xs',
                      p.intelligence.priceDeltaPercent > 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {p.intelligence.priceDeltaPercent > 0 ? '+' : ''}{p.intelligence.priceDeltaPercent}%
                    </p>
                  )}
                </td>
                <td className="px-3 py-4 text-center">
                  <MarketBadge position={p.intelligence.marketPosition} />
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-lg font-bold text-brand">{Math.round(p.intelligence.bookingProbability * 100)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Recommendations panel
function RecommendationsPanel({ recommendations }: { recommendations: string[] }) {
  if (!recommendations.length) return null

  return (
    <div className="rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-surface-2 to-brand-2/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl bg-brand/20 p-2">
          <svg className="h-5 w-5 text-brand" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-text">AI Рекомендации</h3>
          <p className="text-sm text-text-mut">Что можно улучшить</p>
        </div>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-surface-3/50 p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/20 text-xs font-medium text-brand">
              {i + 1}
            </span>
            <p className="text-sm text-text-mut">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface-3" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-surface-3" />
      <div className="h-48 animate-pulse rounded-2xl bg-surface-3" />
    </div>
  )
}

// Auth required component
function AuthRequired() {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
      <svg className="mx-auto h-16 w-16 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h2 className="mt-4 text-xl font-semibold text-text">Требуется авторизация</h2>
      <p className="mt-2 text-text-mut">Войдите как хост для доступа к панели управления</p>
      <Link href="/auth/login" className="mt-4 inline-block rounded-xl bg-brand px-6 py-2 font-medium text-white hover:bg-brand/90">
        Войти
      </Link>
    </div>
  )
}

// Main component
export function HostDashboardClient() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  // Fetch intelligence data
  const { data, isLoading, error, refetch } = useFetch<HostIntelligenceResponse>(
    ['host-intelligence', user?.id],
    '/api/host/intelligence',
    {
      enabled: isAuthenticated() && !!accessToken,
    }
  )

  // Check auth
  if (!isAuthenticated()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Кабинет хоста</h1>
          <p className="text-text-mut">AI-аналитика ваших объявлений</p>
        </div>
        <AuthRequired />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Кабинет хоста</h1>
          <p className="text-text-mut">
            AI-аналитика ваших объявлений
            {user && <span className="text-brand ml-2">• {user.email}</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-3 px-4 py-2 text-sm text-text-mut hover:bg-white/10 hover:text-text transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Обновить
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-3 px-4 py-2 text-sm text-text-mut hover:bg-white/10 hover:text-text transition"
          >
            ← На главную
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">Не удалось загрузить данные. Убедитесь, что backend запущен.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {data && (
        <>
          <SummaryCards summary={data.summary} />
          <RecommendationsPanel recommendations={data.recommendations} />
          <PropertiesTable properties={data.properties} />
        </>
      )}

      {!isLoading && !error && !data && (
        <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
          <p className="text-text-mut">У вас пока нет объявлений</p>
          <Link href="/host/create" className="mt-4 inline-block text-brand hover:underline">
            Создать первое объявление
          </Link>
        </div>
      )}
    </div>
  )
}