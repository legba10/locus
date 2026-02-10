'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { Card, CardTitle, Button, ScoreBadge, MoneyMetric, Divider, ProsList } from '@/ui-system'
import { cn } from '@/shared/utils/cn'

interface OwnerListing {
  id: string
  title: string
  score: number
  monthlyIncome: number
}

interface OwnerData {
  // Состояние объявлений
  averageScore: number
  
  // Деньги
  currentIncome: number
  potentialIncome: number
  growthPercent: number
  
  // Что улучшить
  improvements: string[]
  
  // Объявления
  listings: OwnerListing[]
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

// Auth required
function AuthRequired() {
  return (
    <Card variant="bordered" className="p-6 text-center max-w-sm mx-auto">
      <div className="text-4xl mb-3">🔒</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Войдите в аккаунт</h2>
      <p className="text-gray-500 mb-4">Чтобы видеть аналитику</p>
      <Link href="/auth/login">
        <Button variant="primary">Войти</Button>
      </Link>
    </Card>
  )
}

// Skeleton
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 bg-gray-200 rounded-xl" />
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
      <div className="h-16 bg-gray-200 rounded-xl" />
    </div>
  )
}

/**
 * OwnerDashboardV4 — Product Version
 * 
 * Кабинет владельца ≠ админка
 * Кабинет владельца = деньги + решения
 * 
 * Блоки:
 * 1) Состояние объявлений
 * 2) Деньги (главный блок)
 * 3) Что улучшить прямо сейчас
 * 4) Простые действия
 */
export function OwnerDashboardV4() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<OwnerData>(
    ['owner-dashboard-v4', user?.id],
    '/api/owner/dashboard',
    { enabled: isAuthenticated() && !!accessToken }
  )

  // Fallback data for demo
  const fallbackData: OwnerData = {
    averageScore: 72,
    currentIncome: 63000,
    potentialIncome: 75000,
    growthPercent: 18,
    improvements: [
      'Добавить фото кухни',
      'Скорректировать цену',
      'Улучшить описание',
    ],
    listings: [],
  }

  if (!isAuthenticated()) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Кабинет владельца</h1>
        <AuthRequired />
      </div>
    )
  }

  const dashboard = data || fallbackData

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Кабинет владельца</h1>
        <button onClick={() => refetch()} className="text-gray-400 hover:text-gray-600 text-lg">🔄</button>
      </div>

      {isLoading && <PageSkeleton />}

      {error && (
        <Card variant="bordered" className="p-4 text-center">
          <p className="text-red-600 mb-2">Ошибка загрузки</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Повторить
          </Button>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {/* ═══════════════════════════════════════════════════════════════
              БЛОК 1 — Состояние объявлений
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Средняя оценка</div>
                <div className="flex items-center gap-2">
                  <ScoreBadge score={dashboard.averageScore} size="lg" />
                  <span className="text-gray-500">/ 100</span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                {dashboard.listings.length} объявлений
              </div>
            </div>
          </Card>

          {/* ═══════════════════════════════════════════════════════════════
              БЛОК 2 — Деньги (ГЛАВНЫЙ БЛОК)
              ═══════════════════════════════════════════════════════════════ */}
          <Card variant="bordered">
            <CardTitle className="mb-3">Ваш доход</CardTitle>
            
            {/* Текущий доход */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Доход сейчас</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatMoney(dashboard.currentIncome)} ₽
                <span className="text-lg font-normal text-gray-500"> / мес</span>
              </div>
            </div>

            {/* Потенциал */}
            {dashboard.potentialIncome > dashboard.currentIncome && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-sm text-emerald-700 mb-1">Если улучшить объявление:</div>
                <div className="text-2xl font-bold text-emerald-700">
                  +{formatMoney(dashboard.potentialIncome - dashboard.currentIncome)} ₽
                  <span className="text-base font-normal"> / мес</span>
                </div>
                <div className="text-sm text-emerald-600 mt-1">
                  Потенциал роста: +{dashboard.growthPercent}%
                </div>
              </div>
            )}
          </Card>

          {/* ═══════════════════════════════════════════════════════════════
              БЛОК 3 — Что улучшить прямо сейчас
              ═══════════════════════════════════════════════════════════════ */}
          {dashboard.improvements.length > 0 && (
            <Card variant="bordered">
              <CardTitle className="mb-3">Что улучшить прямо сейчас</CardTitle>
              <ul className="space-y-2">
                {dashboard.improvements.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="text-blue-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              БЛОК 4 — Простые действия
              ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="primary" size="lg" icon="📸">
              Добавить фото
            </Button>
            <Button variant="outline" size="lg" icon="💰">
              Изменить цену
            </Button>
          </div>
          <Button variant="secondary" fullWidth icon="✏️">
            Улучшить описание
          </Button>

          {/* Объявления */}
          {dashboard.listings.length > 0 && (
            <>
              <Divider label="Мои объявления" />
              <div className="space-y-2">
                {dashboard.listings.map(listing => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card variant="bordered" hoverable>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ScoreBadge score={listing.score} size="sm" />
                          <span className="text-gray-900">{listing.title}</span>
                        </div>
                        <span className="font-medium text-gray-700">
                          {formatMoney(listing.monthlyIncome)} ₽
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
