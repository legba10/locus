'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingCardV8, ListingCardV8Skeleton } from '@/domains/listing/ListingCardV8'
import { SmartSearchInput } from '@/ui-system/SmartSearchInput'
import { Card, Button } from '@/ui-system'
import { normalizeListings } from '@/core/adapters'
import { CITIES } from '@/shared/data/cities'
import { useAuthStore } from '@/domains/auth'
import { RU } from '@/core/i18n/ru'

interface ListingItem {
  id: string
  title: string
  basePrice: number
  city: string
  district?: string
  photo?: string
  score?: number
  verdict?: string
  explanation?: string
  demandLevel?: 'low' | 'medium' | 'high'
}

interface ListingsResponse {
  items: ListingItem[]
}

/**
 * HomePageV4 — Product Version
 * 
 * Новый hero:
 * "Найдите жильё, которое реально подходит вам"
 * 
 * Подзаголовок:
 * "LOCUS анализирует варианты и объясняет выбор"
 */
export function HomePageV4() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState<number | undefined>()
  const [guests, setGuests] = useState(2)

  const { data, isLoading } = useFetch<ListingsResponse>(['listings-home'], '/api/listings?limit=6')
  const isLandlord = user?.role === 'landlord'
  const isPaidTariff = user?.tariff === 'landlord_basic' || user?.tariff === 'landlord_pro'
  const hostCtaHref = isLandlord && isPaidTariff ? '/owner/dashboard?tab=add' : '/pricing?reason=host'

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (budget) params.set('priceMax', String(budget))
    if (guests) params.set('guests', String(guests))
    router.push(`/listings?${params.toString()}`)
  }

  const handleNearMe = () => {
    router.push('/listings?nearMe=true')
  }

  const normalizedListings = data?.items ? normalizeListings(data.items) : []

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 hero-section">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Hero Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Найдите жильё, которое реально подходит вам
          </h1>
          {/* Subheadline */}
          <p className="text-lg text-gray-600 mb-8">
            LOCUS анализирует варианты и объясняет выбор
          </p>

          {/* Поиск */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white rounded-xl shadow-md p-4">
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

              <Button type="submit" variant="primary" size="lg">
                Найти
              </Button>
            </div>
          </form>

          {/* Ценность */}
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
            <span>✓ Подходящие варианты</span>
            <span>✓ Понятная цена</span>
            <span>✓ Умные подсказки</span>
          </div>
        </div>
      </section>

      {/* Рекомендации */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Рекомендуем</h2>
            <Link href="/listings" className="text-blue-600 hover:underline text-sm">
              Все варианты →
            </Link>
          </div>

          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <ListingCardV8Skeleton key={i} />
              ))}
            </div>
          )}

          {normalizedListings.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {normalizedListings.slice(0, 6).map((item) => (
                <ListingCardV8
                  key={item.id}
                  id={item.id}
                  photo={item.photos[0]?.url}
                  price={item.basePrice}
                  city={item.city}
                  district={item.address}
                  decision={{
                    score: item.score,
                    reasons: item.reasons?.length > 0 ? item.reasons : (item.explanation ? [item.explanation] : []),
                    demandLevel: item.demandLevel,
                    priceDiff: item.priceDiff,
                    riskLevel: item.riskLevel,
                  }}
                />
              ))}
            </div>
          )}

          {!isLoading && normalizedListings.length === 0 && (
            <Card variant="bordered" className="p-8 text-center">
              <p className="text-gray-500">Пока нет объявлений</p>
            </Card>
          )}
        </div>
      </section>

      {/* Для владельцев */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Сдаёте жильё?
          </h2>
          <p className="text-gray-600 mb-4">
            LOCUS поможет увеличить доход
          </p>
          <Link href={hostCtaHref}>
            <Button variant="outline" size="lg">
              Кабинет владельца →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
