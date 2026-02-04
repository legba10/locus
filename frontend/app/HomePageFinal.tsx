'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingCardFinal, ListingCardFinalSkeleton } from '@/domains/listing/ListingCardFinal'
import { CITIES } from '@/shared/data/cities'
import { useAuthStore } from '@/domains/auth'

interface ListingItem {
  id: string
  title: string
  basePrice: number
  city: string
  photo?: string
  locusScore?: number
  locusVerdict?: string
  locusTip?: string
}

interface ListingsResponse {
  items: ListingItem[]
}

/**
 * HomePageFinal — главная страница LOCUS
 * 
 * Цель: не показать возможности, а дать действие
 * 
 * Структура:
 * 1. Заголовок
 * 2. Поисковый блок
 * 3. Мини-блок ценности (1 строка)
 * 4. Рекомендации
 */
export function HomePageFinal() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [city, setCity] = useState('')
  const [guests, setGuests] = useState(2)

  const { data, isLoading } = useFetch<ListingsResponse>(['listings-home'], '/api/listings?limit=6')
  const isLandlord = user?.role === 'landlord'
  const isPaidTariff = user?.tariff === 'landlord_basic' || user?.tariff === 'landlord_pro'
  const hostCtaHref = isLandlord && isPaidTariff ? '/owner/dashboard?tab=add' : '/pricing?reason=host'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (guests) params.set('guests', String(guests))
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">
      {/* Секция 1: Заголовок + Поиск */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* 1. Заголовок */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Найдите жильё, которое вам подходит
          </h1>
          <p className="text-gray-600 mb-8">
            LOCUS поможет выбрать лучший вариант
          </p>

          {/* 2. Поисковый блок */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-gray-200 px-4 py-3 text-gray-900"
              >
                <option value="">Выберите город</option>
                {CITIES.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
              </select>

              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-4 py-3 text-gray-900"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
              >
                Найти
              </button>
            </div>
          </form>

          {/* 3. Мини-блок ценности (одна строка) */}
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
            <span>✓ Подходящие варианты</span>
            <span>✓ Понятная цена</span>
            <span>✓ Умные подсказки</span>
          </div>
        </div>
      </section>

      {/* Секция 2: Рекомендации */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Рекомендуем</h2>
            <Link href="/listings" className="text-blue-600 hover:underline text-sm">
              Все варианты →
            </Link>
          </div>

          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <ListingCardFinalSkeleton key={i} />
              ))}
            </div>
          )}

          {data?.items && data.items.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.slice(0, 6).map((item) => (
                <ListingCardFinal
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.basePrice}
                  image={item.photo}
                  city={item.city}
                  locusScore={item.locusScore ?? 75}
                  locusVerdict={item.locusVerdict ?? 'Хороший вариант'}
                  locusTip={item.locusTip ?? 'Цена соответствует рынку'}
                />
              ))}
            </div>
          )}

          {!isLoading && (!data?.items || data.items.length === 0) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">Пока нет объявлений</p>
            </div>
          )}
        </div>
      </section>

      {/* Секция 3: Для владельцев */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Сдаёте жильё?
          </h2>
          <p className="text-gray-600 mb-4">
            LOCUS поможет увеличить доход
          </p>
          <Link
            href={hostCtaHref}
            className="inline-block rounded-lg bg-white border border-gray-200 px-6 py-3 font-medium text-gray-900 hover:border-gray-300 transition"
          >
            Кабинет владельца →
          </Link>
        </div>
      </section>
    </div>
  )
}
