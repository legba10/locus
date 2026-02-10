'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { GlassCard, GlassButton, GlassSelect } from '@/ui-system/glass'
import { normalizeListings } from '@/core/adapters'
import { RU } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'
import { CITIES } from '@/shared/data/cities'
import { useAuthStore } from '@/domains/auth'
import { ListingCardGlass, ListingCardGlassSkeleton } from '@/domains/listing/ListingCardGlass'

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
 * HomePageV5 — LOCUS Home в стиле Liquid Glass
 * 
 * Hero секция:
 * - Заголовок: "Найдите жильё, которое действительно подходит вам"
 * - Подзаголовок: "LOCUS анализирует варианты и объясняет выбор"
 * - Поисковый блок = GlassCard
 * - Кнопка "Найти" = AI Purple gradient
 */
export function HomePageV5() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [city, setCity] = useState('')
  const [guests, setGuests] = useState('2')
  const [budget, setBudget] = useState('')

  const { data, isLoading } = useFetch<ListingsResponse>(['listings-home'], '/api/listings?limit=6')
  const isLandlord = user?.role === 'landlord'
  const isPaidTariff = user?.tariff === 'landlord_basic' || user?.tariff === 'landlord_pro'
  const hostCtaHref = isLandlord && isPaidTariff ? '/owner/dashboard?tab=add' : '/pricing?reason=host'

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (guests) params.set('guests', guests)
    if (budget) params.set('priceMax', budget)
    router.push(`/listings?${params.toString()}`)
  }

  const normalizedListings = data?.items ? normalizeListings(data.items) : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-purple-600/20 blur-[100px]" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] rounded-full bg-blue-600/15 blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          {/* Logo accent */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.15] mb-8">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LOCUS
            </span>
            <span className="text-white/60 text-sm">AI для выбора жилья</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Найдите жильё, которое{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              действительно подходит
            </span>{' '}
            вам
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            LOCUS анализирует варианты и объясняет выбор — вы понимаете, почему это жильё подходит именно вам
          </p>

          {/* Search Block */}
          <GlassCard variant="default" padding="lg" className="max-w-2xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
                {/* City */}
                <GlassSelect
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                >
                  <option value="">Выберите город</option>
                  {CITIES.map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                </GlassSelect>

                {/* Guests */}
                <GlassSelect
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}
                    </option>
                  ))}
                </GlassSelect>

                {/* Search button */}
                <GlassButton type="submit" variant="primary" size="lg">
                  {RU.search.title}
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Value props */}
          <div className="flex justify-center gap-8 mt-8 text-sm text-white/60">
            <span className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              AI анализ каждого варианта
            </span>
            <span className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              Понятные объяснения
            </span>
            <span className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              Персональные рекомендации
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          RECOMMENDATIONS SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Рекомендуем
              </h2>
              <p className="text-white/60">
                Варианты, подобранные AI специально для вас
              </p>
            </div>
            <Link 
              href="/listings" 
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Все варианты →
            </Link>
          </div>

          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <ListingCardGlassSkeleton key={i} />
              ))}
            </div>
          )}

          {normalizedListings.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {normalizedListings.slice(0, 6).map((item) => (
                <ListingCardGlass
                  key={item.id}
                  id={item.id}
                  photo={item.photos[0]?.url}
                  price={item.basePrice}
                  city={item.city}
                  district={item.address}
                  decision={{
                    score: item.score,
                    reasons: item.reasons?.length > 0 ? item.reasons : [],
                    demandLevel: item.demandLevel === 'high' ? 'высокий' : item.demandLevel === 'low' ? 'низкий' : 'средний',
                  }}
                />
              ))}
            </div>
          )}

          {!isLoading && normalizedListings.length === 0 && (
            <GlassCard variant="subtle" padding="lg" className="text-center">
              <p className="text-white/60">{RU.empty.no_listings}</p>
            </GlassCard>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          OWNER CTA SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <GlassCard variant="glow" padding="lg" className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Сдаёте жильё?
            </h2>
            <p className="text-white/70 mb-6">
              LOCUS поможет увеличить доход — анализируйте рынок и улучшайте объявления
            </p>
            <Link href={hostCtaHref}>
              <GlassButton variant="primary" size="lg">
                {RU.owner.dashboard_title} →
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </section>
    </div>
  )
}
