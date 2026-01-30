'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { Card, Button } from '@/ui-system'
import { cn } from '@/shared/utils/cn'
import { RU, getVerdictFromScore, formatPrice, type VerdictType } from '@/core/i18n/ru'

interface OwnerListing {
  id: string
  title: string
  score: number
  monthlyIncome: number
  problems?: string[]
  improvements?: { action: string; impact: string }[]
}

interface OwnerData {
  averageScore: number
  currentIncome: number
  potentialIncome: number
  growthPercent: number
  improvements: string[]
  listings: OwnerListing[]
}

/**
 * Получить цвета вердикта
 */
function getVerdictColors(verdict: VerdictType) {
  switch (verdict) {
    case 'excellent':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '✅' }
    case 'good':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '✓' }
    case 'average':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '⚠' }
    default:
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '⚠' }
  }
}

// Требуется авторизация
function AuthRequired() {
  return (
    <Card variant="bordered" className="p-6 text-center max-w-sm mx-auto">
      <div className="text-4xl mb-3">🔒</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {RU.auth.login_required}
      </h2>
      <p className="text-gray-500 mb-4">{RU.auth.login_to_continue}</p>
      <Link href="/auth/login">
        <Button variant="primary">{RU.auth.login}</Button>
      </Link>
    </Card>
  )
}

// Скелетон
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
    </div>
  )
}

/**
 * OwnerDashboardV5 — ПРОДУКТ ДЛЯ ВЛАДЕЛЬЦА
 * 
 * Структура:
 * 
 * 1️⃣ ВАШЕ ОБЪЯВЛЕНИЕ ГЛАЗАМИ LOCUS
 *    Оценка: Средний вариант ⚠
 *    Почему:
 *    — Цена выше рынка на 15%
 *    — Мало фото
 *    — Слабое описание
 * 
 * 2️⃣ ЧТО СДЕЛАТЬ
 *    ✓ Снизить цену на 5–10%
 *    ✓ Добавить 3 фото
 *    ✓ Переписать описание
 * 
 * 3️⃣ ПОТЕНЦИАЛ ДОХОДА
 *    Сейчас: 63 000 ₽
 *    Потенциал: +12 000 ₽ (+18%)
 */
export function OwnerDashboardV5() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<OwnerData>(
    ['owner-dashboard-v5', user?.id],
    '/api/owner/dashboard',
    { enabled: isAuthenticated() && !!accessToken }
  )

  // Данные по умолчанию
  const fallbackData: OwnerData = {
    averageScore: 58,
    currentIncome: 63000,
    potentialIncome: 75000,
    growthPercent: 18,
    improvements: [
      'Снизить цену на 5–10%',
      'Добавить 3 фото интерьера',
      'Переписать описание подробнее',
    ],
    listings: [
      {
        id: 'demo-1',
        title: 'Квартира в центре',
        score: 58,
        monthlyIncome: 63000,
        problems: [
          'Цена выше рынка на 15%',
          'Всего 2 фотографии',
          'Короткое описание',
        ],
        improvements: [
          { action: 'Снизить цену', impact: '+12% бронирований' },
          { action: 'Добавить 3 фото', impact: '+8% просмотров' },
          { action: 'Улучшить описание', impact: '+5% конверсии' },
        ],
      },
    ],
  }

  if (!isAuthenticated()) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          {RU.owner.dashboard_title}
        </h1>
        <AuthRequired />
      </div>
    )
  }

  const dashboard = data || fallbackData
  const listing = dashboard.listings[0] // Основное объявление
  const verdictType = getVerdictFromScore(dashboard.averageScore)
  const verdictColors = getVerdictColors(verdictType)
  const verdictText = RU.verdict[verdictType]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {RU.owner.dashboard_title}
        </h1>
        <button 
          onClick={() => refetch()} 
          className="text-gray-400 hover:text-gray-600 text-lg"
          aria-label="Обновить"
        >
          🔄
        </button>
      </div>

      {isLoading && <PageSkeleton />}

      {error && (
        <Card variant="bordered" className="p-4 text-center">
          <p className="text-red-600 mb-2">{RU.common.error}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {RU.common.retry}
          </Button>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {/* ═══════════════════════════════════════════════════════════════
              1️⃣ ВАШЕ ОБЪЯВЛЕНИЕ ГЛАЗАМИ LOCUS
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered" className="overflow-hidden">
            <div className={cn('px-4 py-3', verdictColors.bg, verdictColors.border, 'border-b')}>
              <h2 className="font-semibold text-gray-900">
                {RU.block.owner_view}
              </h2>
            </div>
            
            <div className="p-4">
              {/* Вердикт */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{verdictColors.icon}</span>
                <div>
                  <div className={cn('text-xl font-bold', verdictColors.text)}>
                    {verdictText}
                  </div>
                  <div className="text-sm text-gray-500">
                    {RU.block.locus_analysis}
                  </div>
                </div>
              </div>

              {/* Проблемы */}
              {listing?.problems && listing.problems.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {RU.block.why_not_fits}:
                  </p>
                  <div className="space-y-2">
                    {listing.problems.map((problem, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-amber-700">
                        <span className="font-bold">—</span>
                        <span>{problem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ═══════════════════════════════════════════════════════════════
              2️⃣ ЧТО СДЕЛАТЬ
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <h2 className="font-semibold text-gray-900 mb-4">
              {RU.block.what_to_do}
            </h2>
            
            <div className="space-y-3">
              {(listing?.improvements || dashboard.improvements.map(a => ({ action: a, impact: '' }))).map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100"
                >
                  <span className="text-emerald-600 font-bold">✓</span>
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium">
                      {typeof item === 'string' ? item : item.action}
                    </div>
                    {typeof item !== 'string' && item.impact && (
                      <div className="text-sm text-emerald-600">
                        {item.impact}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Быстрые действия */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button variant="primary" icon="📸">
                {RU.owner.add_photos}
              </Button>
              <Button variant="outline" icon="💰">
                {RU.owner.lower_price}
              </Button>
            </div>
          </Card>

          {/* ═══════════════════════════════════════════════════════════════
              3️⃣ ПОТЕНЦИАЛ ДОХОДА
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <h2 className="font-semibold text-gray-900 mb-4">
              {RU.block.potential_income}
            </h2>

            {/* Текущий доход */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">
                {RU.owner.current_income}
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(dashboard.currentIncome, 'month')}
              </div>
            </div>

            {/* Потенциал */}
            {dashboard.potentialIncome > dashboard.currentIncome && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
                <div className="text-sm text-emerald-700 mb-1">
                  Если улучшить объявление:
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  +{formatPrice(dashboard.potentialIncome - dashboard.currentIncome, 'month')}
                </div>
                <div className="text-sm text-emerald-600 mt-1">
                  {RU.owner.growth_potential}: +{dashboard.growthPercent}%
                </div>
              </div>
            )}
          </Card>

          {/* Объявления */}
          {dashboard.listings.length > 1 && (
            <Card variant="bordered">
              <h2 className="font-semibold text-gray-900 mb-4">
                {RU.owner.your_listings}
              </h2>
              <div className="space-y-2">
                {dashboard.listings.map(l => {
                  const listingVerdict = getVerdictFromScore(l.score)
                  const listingColors = getVerdictColors(listingVerdict)
                  return (
                    <Link key={l.id} href={`/listings/${l.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{listingColors.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{l.title}</div>
                            <div className={cn('text-sm', listingColors.text)}>
                              {RU.verdict[listingVerdict]}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatPrice(l.monthlyIncome, 'month')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Ссылка на просмотр как гость */}
          <div className="text-center">
            <Link 
              href={`/listings/${listing?.id || ''}`}
              className="text-blue-600 hover:underline text-sm"
            >
              {RU.owner.listing_view} →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
