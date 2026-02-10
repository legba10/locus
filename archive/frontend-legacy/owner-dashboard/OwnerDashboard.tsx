'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'

interface OwnerData {
  // Current income
  currentIncome: number
  
  // Potential income
  potentialIncome: number
  
  // Quick actions
  actions: Array<{
    id: string
    label: string
    icon: string
  }>
  
  // Listings summary
  listings: Array<{
    id: string
    title: string
    income: number
  }>
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

// Auth required
function AuthRequired() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center max-w-sm mx-auto">
      <div className="text-4xl mb-3">🔒</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Войдите в аккаунт</h2>
      <Link href="/auth/login" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700">
        Войти
      </Link>
    </div>
  )
}

// Skeleton
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-gray-200 rounded-xl" />
      <div className="h-20 bg-gray-200 rounded-xl" />
      <div className="h-32 bg-gray-200 rounded-xl" />
    </div>
  )
}

/**
 * OwnerDashboard — Money-First Product
 * 
 * MAIN UI:
 * 
 * Current income:
 * 63 000 ₽ / month
 * 
 * Potential income:
 * +12 000 ₽ / month
 * 
 * Quick actions:
 * • Add kitchen photos
 * • Adjust price
 * 
 * [Add photos]
 * [Change price]
 * 
 * REMOVED:
 * - complex tables
 * - technical metrics
 */
export function OwnerDashboard() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<OwnerData>(
    ['owner-dashboard', user?.id],
    '/api/owner/dashboard',
    { enabled: isAuthenticated() && !!accessToken }
  )

  // Fallback data for demo
  const fallbackData: OwnerData = {
    currentIncome: 63000,
    potentialIncome: 75000,
    actions: [
      { id: 'photos', label: 'Добавить фото кухни', icon: '📸' },
      { id: 'price', label: 'Скорректировать цену', icon: '💰' },
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

  const dashboardData = data || fallbackData

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ваш доход</h1>
        <button onClick={() => refetch()} className="text-gray-400 hover:text-gray-600">🔄</button>
      </div>

      {isLoading && <PageSkeleton />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-700">Ошибка загрузки</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-red-600 hover:underline">
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {/* CURRENT INCOME */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500 mb-1">Доход сейчас</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatMoney(dashboardData.currentIncome)} ₽
              <span className="text-lg font-normal text-gray-500"> / мес</span>
            </div>
          </div>

          {/* POTENTIAL INCOME */}
          {dashboardData.potentialIncome > dashboardData.currentIncome && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-sm text-emerald-700 mb-1">Потенциал дохода</div>
              <div className="text-2xl font-bold text-emerald-700">
                +{formatMoney(dashboardData.potentialIncome - dashboardData.currentIncome)} ₽
                <span className="text-base font-normal"> / мес</span>
              </div>
            </div>
          )}

          {/* QUICK ACTIONS */}
          {dashboardData.actions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Что улучшить</h2>
              <div className="space-y-2">
                {dashboardData.actions.map((action) => (
                  <button
                    key={action.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-left"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              📸 Добавить фото
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition">
              💰 Изменить цену
            </button>
          </div>

          {/* LISTINGS (simple) */}
          {dashboardData.listings.length > 0 && (
            <div className="pt-4">
              <h2 className="font-semibold text-gray-900 mb-3">Мои объявления</h2>
              <div className="space-y-2">
                {dashboardData.listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition"
                  >
                    <span className="text-gray-900">{listing.title}</span>
                    <span className="font-medium text-gray-700">{formatMoney(listing.income)} ₽</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
