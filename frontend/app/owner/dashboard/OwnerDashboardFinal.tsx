'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { LocusDecisionBlock } from '@/shared/ui/locus/LocusDecisionBlock'
import { cn } from '@/shared/utils/cn'

interface OwnerListing {
  id: string
  title: string
  city: string
  score: number
  verdict: string
  monthlyRevenue: number
  potentialGrowth: number
  mainTip: string
  errors: string[]
}

interface OwnerData {
  // Блок 1: Состояние
  totalScore: number
  totalVerdict: string
  
  // Блок 2: Деньги
  currentRevenue: number
  potentialRevenue: number
  growthPercent: number
  
  // Блок 3: Что улучшить
  improvements: string[]
  
  // Объявления
  listings: OwnerListing[]
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

// Блок 1: Состояние объявления
function StatusBlock({ score, verdict }: { score: number; verdict: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500 mb-2">Ваше объявление</div>
      <LocusDecisionBlock score={score} verdict={verdict} size="lg" />
    </div>
  )
}

// Блок 2: Деньги
function MoneyBlock({ current, potential, growth }: { current: number; potential: number; growth: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500 mb-1">Ваш доход сейчас</div>
      <div className="text-3xl font-bold text-gray-900 mb-4">{formatMoney(current)} ₽/мес</div>
      
      {growth > 0 && (
        <div className="p-3 bg-emerald-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-emerald-800">Если улучшить объявление:</span>
            <span className="text-emerald-600 font-bold">+{formatMoney(potential - current)} ₽</span>
          </div>
          <div className="text-sm text-emerald-700 mt-1">
            Потенциал дохода: +{growth}%
          </div>
        </div>
      )}
    </div>
  )
}

// Блок 3: Что улучшить
function ImprovementsBlock({ items }: { items: string[] }) {
  if (items.length === 0) return null
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Что можно улучшить</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700">
            <span className="text-blue-500 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Блок 4: Простые действия
function ActionsBlock() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Действия</h3>
      <div className="grid gap-2">
        <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
          📸 Добавить фото
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition">
          💰 Изменить цену
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition">
          ✏️ Улучшить описание
        </button>
      </div>
    </div>
  )
}

// Карточка объявления
function ListingItem({ listing }: { listing: OwnerListing }) {
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

      <LocusDecisionBlock 
        score={listing.score} 
        verdict={listing.verdict}
        tip={listing.mainTip}
        size="sm"
      />

      {/* Ошибки */}
      {listing.errors.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {listing.errors.map((err, i) => (
            <div key={i} className="text-sm text-amber-700">⚠ {err}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// Auth
function AuthRequired() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center max-w-md mx-auto">
      <div className="text-3xl mb-3">🔒</div>
      <h2 className="text-lg font-semibold text-gray-900">Войдите в аккаунт</h2>
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
      <div className="h-20 bg-gray-200 rounded-xl" />
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
    </div>
  )
}

/**
 * OwnerDashboardFinal — помощник дохода
 * 
 * Блоки:
 * 1. Состояние объявления (оценка)
 * 2. Деньги (текущий доход + потенциал)
 * 3. Что улучшить
 * 4. Простые действия
 */
export function OwnerDashboardFinal() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  
  const { data, isLoading, error, refetch } = useFetch<OwnerData>(
    ['owner-dashboard-final', user?.id],
    '/api/owner/dashboard',
    { enabled: isAuthenticated() && !!accessToken }
  )

  if (!isAuthenticated()) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Кабинет владельца</h1>
        <AuthRequired />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ваш доход</h1>
        <button onClick={() => refetch()} className="text-sm text-gray-500 hover:text-gray-700">
          🔄
        </button>
      </div>

      {isLoading && <PageSkeleton />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-700">Ошибка</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-red-600 hover:underline">
            Повторить
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Блок 1: Состояние */}
          <StatusBlock score={data.totalScore} verdict={data.totalVerdict} />

          {/* Блок 2: Деньги */}
          <MoneyBlock 
            current={data.currentRevenue} 
            potential={data.potentialRevenue}
            growth={data.growthPercent}
          />

          {/* Блок 3: Что улучшить */}
          <ImprovementsBlock items={data.improvements} />

          {/* Блок 4: Действия */}
          <ActionsBlock />

          {/* Объявления */}
          {data.listings.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="font-semibold text-gray-900">Мои объявления</h2>
              {data.listings.map(listing => (
                <ListingItem key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
