'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'

interface OwnerListing {
  id: string
  title: string
  city: string
  price: number
  monthlyRevenue: number
  potentialGrowth: number
  mainTip: string
  hasError: boolean
  errorText?: string
}

interface OwnerData {
  currentRevenue: number
  potentialRevenue: number
  growthPercent: number
  mainTip: string
  listings: OwnerListing[]
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

// Блок 1: Доход сейчас
function RevenueBlock({ current, potential, growth }: { current: number; potential: number; growth: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-500 mb-1">Ваш доход сейчас</div>
      <div className="text-3xl font-bold text-gray-900">{formatMoney(current)} ₽/мес</div>
      
      {/* Блок 2: Потенциал роста */}
      <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-emerald-800 font-medium">Потенциал дохода</span>
          <span className="text-emerald-600 font-bold">+{growth}%</span>
        </div>
        <div className="text-sm text-emerald-700 mt-1">
          До {formatMoney(potential)} ₽/мес
        </div>
      </div>
    </div>
  )
}

// Блок 3: Что улучшить
function TipBlock({ tip }: { tip: string }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <div className="font-medium text-blue-900">Совет</div>
          <div className="text-blue-800">{tip}</div>
        </div>
      </div>
    </div>
  )
}

// Блок 4: Ошибки объявления
function ErrorBlock({ listing }: { listing: OwnerListing }) {
  if (!listing.hasError) return null
  
  return (
    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
      <span>⚠</span>
      <span>{listing.errorText || 'Есть проблема'}</span>
    </div>
  )
}

// Карточка объявления владельца
function OwnerListingCard({ listing }: { listing: OwnerListing }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Link href={`/listings/${listing.id}`} className="font-medium text-gray-900 hover:text-blue-600">
            {listing.title}
          </Link>
          <div className="text-sm text-gray-500">{listing.city}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">{formatMoney(listing.monthlyRevenue)} ₽</div>
          <div className="text-xs text-gray-500">в месяц</div>
        </div>
      </div>

      {/* Потенциал */}
      {listing.potentialGrowth > 0 && (
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Потенциал роста</span>
          <span className="text-emerald-600 font-medium">+{listing.potentialGrowth}%</span>
        </div>
      )}

      {/* Совет */}
      <div className="text-sm text-blue-600 mb-2">
        💡 {listing.mainTip}
      </div>

      {/* Ошибка */}
      <ErrorBlock listing={listing} />
    </div>
  )
}

// Auth required
function AuthRequired() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center max-w-md mx-auto">
      <div className="text-3xl mb-3">🔒</div>
      <h2 className="text-lg font-semibold text-gray-900">Войдите в аккаунт</h2>
      <p className="text-gray-500 mt-1">Чтобы видеть свой доход</p>
      <Link href="/auth/login" className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700">
        Войти
      </Link>
    </div>
  )
}

// Skeleton
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="h-20 bg-gray-200 rounded-xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * OwnerDashboardSimple — кабинет владельца про деньги
 * 
 * Блоки:
 * 1. Доход сейчас
 * 2. Потенциал роста  
 * 3. Что улучшить
 * 4. Ошибки объявления
 */
export function OwnerDashboardSimple() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<OwnerData>(
    ['owner-dashboard-simple', user?.id],
    '/api/owner/dashboard',
    { enabled: isAuthenticated() && !!accessToken }
  )

  if (!isAuthenticated()) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Кабинет владельца</h1>
        <AuthRequired />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ваш доход</h1>
        <button onClick={() => refetch()} className="text-sm text-gray-500 hover:text-gray-700">
          🔄 Обновить
        </button>
      </div>

      {isLoading && <PageSkeleton />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-700">Ошибка загрузки</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-red-600 hover:underline">
            Попробовать снова
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Блок 1+2: Доход и потенциал */}
          <RevenueBlock 
            current={data.currentRevenue} 
            potential={data.potentialRevenue} 
            growth={data.growthPercent} 
          />

          {/* Блок 3: Совет */}
          <TipBlock tip={data.mainTip} />

          {/* Объявления */}
          {data.listings.length > 0 ? (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900">Мои объявления</h2>
              {data.listings.map(listing => (
                <OwnerListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="text-3xl mb-3">🏠</div>
              <p className="text-gray-500">У вас пока нет объявлений</p>
              <Link href="/listings/create" className="mt-3 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700">
                Создать объявление
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
