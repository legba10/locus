'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { HeroTitle } from '@/shared/ui/HeroTitle'
import { MarketAnalysisBlock } from '@/shared/ui/MarketAnalysisBlock'
import { ListingCardLight, ListingCardLightSkeleton } from '@/domains/listing/ListingCardLight'
import { useAuthStore } from '@/domains/auth'
import { CITIES } from '@/shared/data/cities'
import { CityInput } from '@/shared/components/CityInput'
import SearchIcon from '@/components/lottie/SearchIcon'
import { track } from '@/shared/analytics/events'

interface ListingsResponse {
  items: any[]
}

/**
 * HomePageV6 — Real Estate Marketplace v4
 * 
 * 🎯 PRODUCT GOAL: Real estate marketplace, not AI platform
 * 
 * Priority:
 * 1. Real estate marketplace feeling
 * 2. Density of listings (6-12 cards on homepage)
 * 3. Clear search UX
 * 4. AI as invisible assistant
 * 5. Premium but simple UI
 * 
 * По ТЗ v4:
 * - Hero: новый текст (real estate language)
 * - Search panel доминирует (blur 22px, radius 20px)
 * - Listings блок сразу после hero
 * - AI toggle в search
 */
export function HomePageV6() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [rentPeriod, setRentPeriod] = useState('')
  const [smartSearch, setSmartSearch] = useState(true) // AI toggle
  const [aiOpen, setAiOpen] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [aiPreparing, setAiPreparing] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1)
  const [viewsCount, setViewsCount] = useState(0)
  const [showHelpNudge, setShowHelpNudge] = useState(false)
  const [showQuickFab, setShowQuickFab] = useState(false)
  const [quickCity, setQuickCity] = useState('')
  const [quickBudget, setQuickBudget] = useState('')
  const [highlightFirstCard, setHighlightFirstCard] = useState(false)

  const { data, isLoading } = useFetch<ListingsResponse>(['listings-home'], '/api/listings?limit=12')
  const isLandlord = user?.role === 'landlord'
  const isPaidTariff = user?.tariff === 'landlord_basic' || user?.tariff === 'landlord_pro'
  const hostCtaHref = isLandlord && isPaidTariff ? '/owner/dashboard?tab=add' : '/pricing?reason=host'

  const handleAiStart = () => {
    const params = new URLSearchParams()
    params.set('ai', 'true')
    if (city) params.set('city', city)
    if (priceRange) {
      const [min, max] = priceRange.split('-')
      if (min) params.set('priceMin', min)
      if (max) params.set('priceMax', max)
    }
    if (propertyType) params.set('type', propertyType)
    if (rentPeriod === 'long') params.set('rooms', '1')
    params.set('sort', 'ai')
    setAiOpen(false)
    setDragOffset(0)
    router.push(`/search?${params.toString()}`)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (propertyType) params.set('type', propertyType)
    if (priceRange) params.set('priceRange', priceRange)
    if (rentPeriod) params.set('period', rentPeriod)
    if (smartSearch) params.set('smart', 'true')
    const hasSeenSearch = typeof window !== 'undefined' && localStorage.getItem('locus_first_search_done') === 'true'
    if (!hasSeenSearch && typeof window !== 'undefined') {
      localStorage.setItem('locus_first_search_done', 'true')
      track('search_first', { city, priceRange, rentPeriod, propertyType })
    }
    router.push(`/listings?${params.toString()}`)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = localStorage.getItem('onboarding_seen') === 'true'
    const prefsRaw = localStorage.getItem('user.preferences')
    if (!seen) {
      setShowOnboarding(true)
      return
    }
    if (prefsRaw) {
      try {
        const prefs = JSON.parse(prefsRaw) as { city?: string; budget?: string; period?: string }
        if (prefs.city) setCity(prefs.city)
        if (prefs.budget) setPriceRange(prefs.budget)
        if (prefs.period) setRentPeriod(prefs.period)
      } catch {}
    }
    const viewed = Number(localStorage.getItem('locus_viewed_count') || '0')
    setViewsCount(Number.isFinite(viewed) ? viewed : 0)
    const firstMatchSeen = localStorage.getItem('locus_first_match_seen') === 'true'
    setHighlightFirstCard(!firstMatchSeen)
  }, [])

  useEffect(() => {
    const onCardViewed = () => {
      if (typeof window === 'undefined') return
      const next = Number(localStorage.getItem('locus_viewed_count') || '0')
      setViewsCount(next)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('locus:listing-viewed', onCardViewed)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('locus:listing-viewed', onCardViewed)
      }
    }
  }, [])

  useEffect(() => {
    if (isLoading) {
      setAiPreparing(true)
      return
    }
    const timer = setTimeout(() => setAiPreparing(false), 1500)
    return () => clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    const t = setTimeout(() => setShowHelpNudge(true), 30000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const lastSeen = Number(localStorage.getItem('locus_last_activity') || '0')
    const now = Date.now()
    const twoDays = 2 * 24 * 60 * 60 * 1000
    if (lastSeen > 0 && now - lastSeen > twoDays && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Новые варианты под ваш бюджет')
      } catch {}
    }
    localStorage.setItem('locus_last_activity', String(now))
  }, [])

  const listingCount = data?.items?.length ?? 0
  useEffect(() => {
    if (!aiPreparing && listingCount > 0 && highlightFirstCard && typeof window !== 'undefined') {
      const t = setTimeout(() => {
        localStorage.setItem('locus_first_match_seen', 'true')
        setHighlightFirstCard(false)
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [aiPreparing, listingCount, highlightFirstCard])

  const smartHeroText = useMemo(() => {
    if (!city && !priceRange) return null
    const budgetLabel = priceRange ? ` до ${priceRange.includes('-') ? priceRange.split('-')[1] : priceRange}` : ''
    return `Подбор для вас в ${city || 'вашем городе'}${budgetLabel}`
  }, [city, priceRange])

  const saveOnboarding = () => {
    if (typeof window === 'undefined') return
    const prefs = { city, budget: priceRange, period: rentPeriod }
    localStorage.setItem('user.preferences', JSON.stringify(prefs))
    localStorage.setItem('onboarding_seen', 'true')
    setShowOnboarding(false)
    track('onboarding_complete', prefs)
  }

  // Используем данные напрямую из API (они уже содержат все нужные поля)
  // HYDRATION-SAFE: No Math.random() or Date.now() - use data from API only
  const listingCards = (data?.items || []).map((listing: any, index: number) => {
    // Извлекаем фото (backend отправляет photos, но legacy может быть images)
    const photo = listing.photos?.[0]?.url || listing.images?.[0]?.url || null
    
    // District из API
    const district = listing.district || null
    
    // Views из API (backend отправляет viewsCount)
    const views = listing.viewsCount || listing.views || 0
    
    // isNew из API (backend должен присылать)
    const isNew = listing.isNew || false
    
    // Определяем isVerified (высокий score = проверено)
    const isVerified = (listing.score || 0) >= 70
    
    // Генерируем tags из reasons
    const tags = (listing.reasons || []).slice(0, 2).map((reason: string) => {
      if (reason.includes('ниже рынка') || reason.includes('Выгодная')) return 'Выгодная цена'
      if (reason.includes('метро') || reason.includes('транспорт')) return 'Рядом метро'
      if (reason.includes('спрос') || reason.includes('Популярное')) return 'Популярное'
      return null
    }).filter(Boolean) as string[]

    // Очищаем заголовок от лишних надписей
    let cleanTitle = listing.title || 'Без названия'
    cleanTitle = cleanTitle
      .replace(/квартира рядом с метро #?\d*/gi, '')
      .replace(/тихая квартира #?\d*/gi, '')
      .replace(/рядом с метро #?\d*/gi, '')
      .replace(/метро #?\d*/gi, '')
      .replace(/квартира #?\d*/gi, '')
      .trim()
    
    // Если заголовок стал пустым, используем дефолтный
    if (!cleanTitle || cleanTitle.length < 3) {
      cleanTitle = `Квартира ${listing.city || ''}`.trim() || 'Без названия'
    }

    const cache = listing.ratingCache as { rating?: number; positive_ratio?: number; cleanliness?: number; noise?: number } | null | undefined
    return {
      id: listing.id,
      photo,
      title: cleanTitle,
      price: listing.pricePerNight || listing.basePrice || 0,
      city: listing.city || 'Не указан',
      district,
      rooms: listing.bedrooms || listing.rooms || 1,
      area: listing.area || 40,
      floor: listing.floor || 1,
      totalFloors: listing.totalFloors || 5,
      views,
      isNew,
      isVerified,
      score: listing.score || 50,
      verdict: listing.verdict || 'Средний вариант',
      reasons: listing.reasons || [],
      tags: tags.length > 0 ? tags : (listing.score >= 70 ? ['Рекомендуем'] : []),
      rating: cache?.rating ?? null,
      reviewPercent: cache?.positive_ratio != null ? Math.round(cache.positive_ratio * 100) : null,
      cleanliness: cache?.cleanliness ?? null,
      noise: cache?.noise ?? null,
    }
  })

  // Единый стиль полей hero-search по TZ-4
  const selectStyles = cn(
    'hero-search-control',
    'pl-10',
    'appearance-none cursor-pointer'
  )

  return (
    <div className="min-h-screen font-sans antialiased">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — v4 (real estate language, search доминирует)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="home-hero">
        <div className="home-hero-container">
          <HeroTitle />

          {/* Subtitle — по ТЗ v4 */}
          <p className="home-hero-subtitle">
            Тысячи объявлений с умным подбором
          </p>
          {smartHeroText && (
            <div className="mt-2 mb-3 inline-flex items-center gap-2 rounded-[12px] bg-[var(--accent-soft)] px-3 py-2 text-[13px] text-[var(--text-main)]">
              <span>{smartHeroText}</span>
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Изменить параметры
              </button>
            </div>
          )}
          {viewsCount > 0 && (
            <p className="text-[13px] text-[var(--text-secondary)] mb-2">
              Вы посмотрели {viewsCount} вариантов
            </p>
          )}
          {viewsCount >= 8 && (
            <p className="text-[13px] text-[var(--accent)] mb-2">Похожие квартиры найдены</p>
          )}

          <div className="home-hero-hint">
            Сначала выберите город — мы подберём лучшие варианты под ваш бюджет.
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              GLASS SEARCH PANEL — по ТЗ v4 (доминирует)
              - backdrop-filter: blur(22px)
              - background: rgba(255,255,255,0.75)
              - border-radius: 20px
              - shadow: 0 20px 60px rgba(0,0,0,0.12)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="hero-search-shell glass">
            <form className="hero-search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="hero-search-grid">
                {/* Город */}
                <div className="lg:col-span-1">
                  <label className="hero-search-label">
                    Город
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <CityInput
                      value={city}
                      onChange={setCity}
                      placeholder="Все города"
                      className={selectStyles}
                    />
                  </div>
                </div>

                {/* Тип жилья */}
                <div className="lg:col-span-1">
                  <label className="hero-search-label">
                    Тип жилья
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className={selectStyles}
                    >
                      <option value="">Любой</option>
                      <option value="apartment">Квартира</option>
                      <option value="room">Комната</option>
                      <option value="house">Дом</option>
                      <option value="studio">Студия</option>
                    </select>
                  </div>
                </div>

                {/* Бюджет */}
                <div className="lg:col-span-1">
                  <label className="hero-search-label">
                    Бюджет
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className={selectStyles}
                    >
                      <option value="">Любой</option>
                      <option value="0-30000">до 30 000 ₽</option>
                      <option value="30000-50000">30 — 50 тыс. ₽</option>
                      <option value="50000-80000">50 — 80 тыс. ₽</option>
                      <option value="80000-150000">80 — 150 тыс. ₽</option>
                      <option value="150000+">от 150 тыс. ₽</option>
                    </select>
                  </div>
                </div>

                {/* Срок аренды */}
                <div className="lg:col-span-1">
                  <label className="hero-search-label">
                    Срок
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <select
                      value={rentPeriod}
                      onChange={(e) => setRentPeriod(e.target.value)}
                      className={selectStyles}
                    >
                      <option value="">Любой</option>
                      <option value="long">Длительный</option>
                      <option value="short">Посуточно</option>
                    </select>
                  </div>
                </div>

                {/* CTA Button — фиолетовая с мощной тенью */}
                <div className="lg:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="hero-search-submit"
                  >
                    <SearchIcon />
                    Найти
                  </button>
                </div>
              </div>
              
              {/* AI Toggle — по ТЗ v4 */}
              <div className="hero-smart-toggle">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={smartSearch}
                    onChange={(e) => setSmartSearch(e.target.checked)}
                    className="hero-smart-checkbox"
                  />
                  <span className="hero-smart-label">
                    Умный подбор
                  </span>
                  <svg className="w-3.5 h-3.5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </label>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          АКТУАЛЬНЫЕ ПРЕДЛОЖЕНИЯ — по ТЗ v4 (6-12 карточек)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16" style={{ background: 'radial-gradient(800px 400px at 50% 0%, rgba(124,58,237,0.05), transparent 60%)' }}>
        <div className="market-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold text-[#1C1F26]">
              Актуальные предложения
            </h2>
            <Link 
              href="/listings"
              className="text-[14px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Смотреть все →
            </Link>
          </div>

          {/* Grid: 3-4 columns desktop, fixed card height */}
          <div className="listing-grid">
            {isLoading || aiPreparing ? (
              <div className="col-span-full glass rounded-[20px] p-5 text-center">
                <p className="text-[15px] font-semibold text-[var(--text-main)]">AI подбирает варианты...</p>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">анализируем рынок...</p>
              </div>
            ) : (
              listingCards.length > 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ListingCardLightSkeleton key={i} />
              ))
            ) : null)}
            {!isLoading && !aiPreparing && listingCards.length > 0 ? (
              listingCards.map((listing) => (
                <ListingCardLight
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photo || undefined}
                  title={listing.title}
                  price={listing.price}
                  city={listing.city}
                  district={listing.district || undefined}
                  rooms={listing.rooms}
                  area={listing.area}
                  floor={listing.floor}
                  totalFloors={listing.totalFloors}
                  views={listing.views}
                  isNew={listing.isNew}
                  isVerified={listing.isVerified}
                  score={listing.score}
                  verdict={listing.verdict}
                  reasons={listing.reasons}
                  tags={listing.tags}
                  rating={listing.rating}
                  reviewPercent={listing.reviewPercent}
                  cleanliness={listing.cleanliness}
                  noise={listing.noise}
                  highlight={highlightFirstCard && listing.id === listingCards[0]?.id}
                />
              ))
            ) : !isLoading && !aiPreparing ? (
              <div className="col-span-full">
                <div className="glass rounded-[20px] p-6 md:p-8 text-center">
                  <div className="mx-auto mb-3 w-10 h-10 rounded-[10px] bg-[var(--accent-soft)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--text-main)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7.5h18M6 4.5h12a2 2 0 012 2V18a2 2 0 01-2 2H6a2 2 0 01-2-2V6.5a2 2 0 012-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h8M8 16h5" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-semibold text-[var(--text-main)]">Пока нет объявлений</p>
                  <p className="mt-2 text-[14px] text-[var(--text-secondary)]">Подберите параметры и попробуйте расширить поиск.</p>
                  <Link href="/listings" className="btn-primary mt-4 inline-flex items-center justify-center text-white">
                    Смотреть все объявления
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          НОВЫЙ ПРОДУКТОВЫЙ БЛОК — доверие после объявлений
          ═══════════════════════════════════════════════════════════════ */}
      <div className="border-t border-gray-100">
        <MarketAnalysisBlock />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          КАК РАБОТАЕТ LOCUS — 3 шага (v3: плотнее, subtle bg)
          ═══════════════════════════════════════════════════════════════ */}
      <section 
        className="py-10 md:py-14"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-2">
              Как это работает
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-[15px]">
              Три простых шага до идеального жилья
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {/* Шаг 1 */}
            <div className="relative bg-white rounded-xl p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <div className="absolute -top-2.5 left-5 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold text-[12px]">
                1
              </div>
              <div className="pt-2">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">Выберите параметры</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">
                  Город, тип жилья, бюджет и другие критерии
                </p>
              </div>
            </div>

            {/* Шаг 2 */}
            <div className="relative bg-white rounded-xl p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <div className="absolute -top-2.5 left-5 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold text-[12px]">
                2
              </div>
              <div className="pt-2">
                <h3 className="text-[16px] font-semibold text-gray-900 mb-2">LOCUS анализирует</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">
                  Изучаем тысячи объявлений по десяткам параметров
                </p>
              </div>
            </div>

            {/* Шаг 3 */}
            <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="absolute -top-3 left-6 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-[13px]">
                3
              </div>
              <div className="pt-3">
                <h3 className="text-[16px] font-semibold text-gray-900 mb-2">Получите варианты</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">
                  С объяснением, почему они вам подходят
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          РЕКОМЕНДУЕМЫЕ ОБЪЯВЛЕНИЯ — marketplace style
          ═══════════════════════════════════════════════════════════════ */}
      <section 
        className="py-12 md:py-16"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}
      >
        <div className="market-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-1">
                Рекомендуемые объявления
              </h2>
              <p className="text-gray-500 text-[14px]">
                Лучшие варианты по версии LOCUS
              </p>
            </div>
            <Link 
              href="/listings" 
              className={cn(
                'hidden md:flex items-center gap-1.5',
                'text-blue-600 hover:text-blue-700',
                'font-medium text-[14px] transition-colors'
              )}
            >
              Все объявления
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Grid: 3 columns desktop */}
          <div className="listing-grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ListingCardLightSkeleton key={i} />
              ))
            ) : listingCards.length > 0 ? (
              listingCards.slice(0, 6).map((listing) => (
                <ListingCardLight
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photo || undefined}
                  title={listing.title}
                  price={listing.price}
                  city={listing.city}
                  district={listing.district || undefined}
                  rooms={listing.rooms}
                  area={listing.area}
                  floor={listing.floor}
                  totalFloors={listing.totalFloors}
                  views={listing.views}
                  isNew={listing.isNew}
                  isVerified={listing.isVerified}
                  score={listing.score}
                  verdict={listing.verdict}
                  reasons={listing.reasons}
                  tags={listing.tags}
                  rating={listing.rating}
                  reviewPercent={listing.reviewPercent}
                  cleanliness={listing.cleanliness}
                  noise={listing.noise}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-1 text-[15px]">Пока нет объявлений</p>
                <p className="text-gray-500 text-[13px]">Объявления скоро появятся</p>
              </div>
            )}
          </div>

          {/* Mobile "View All" button */}
          <div className="mt-6 text-center md:hidden">
            <Link 
              href="/listings"
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'bg-white border border-gray-200',
                'text-gray-900 font-medium text-[14px]',
                'hover:bg-gray-50 active:bg-gray-100',
                'transition-colors'
              )}
            >
              Смотреть все варианты
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          НОВОСТИ РЫНКА — компактнее, чище
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-2">
              Новости рынка
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-[15px]">
              Актуальная информация о рынке аренды
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {/* Новость 1 — Рост цен */}
            <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-blue-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Аналитика</span>
                <h3 className="text-[15px] font-semibold text-gray-900 mt-1.5 mb-1.5 line-clamp-2">
                  Средняя аренда в Москве выросла на 8%
                </h3>
                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2">
                  Цены продолжают расти. Эксперты прогнозируют стабилизацию к весне.
                </p>
              </div>
            </article>

            {/* Новость 2 — Популярные районы */}
            <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-emerald-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-emerald-400 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Рейтинг</span>
                <h3 className="text-[15px] font-semibold text-gray-900 mt-1.5 mb-1.5 line-clamp-2">
                  Топ-5 районов для аренды в 2026
                </h3>
                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2">
                  Самые комфортные районы с учётом инфраструктуры и транспорта.
                </p>
              </div>
            </article>

            {/* Новость 3 — Советы */}
            <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-amber-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-amber-400 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">Советы</span>
                <h3 className="text-[15px] font-semibold text-gray-900 mt-1.5 mb-1.5 line-clamp-2">
                  Как не переплатить за аренду
                </h3>
                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2">
                  5 правил, чтобы снять квартиру по справедливой цене.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LOCUS В ЦИФРАХ — компактнее
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-12 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <p className="text-[32px] md:text-[40px] font-bold text-white mb-1">15K+</p>
              <p className="text-gray-400 text-[13px]">Объявлений</p>
            </div>
            <div className="text-center">
              <p className="text-[32px] md:text-[40px] font-bold text-white mb-1">8K+</p>
              <p className="text-gray-400 text-[13px]">Пользователей</p>
            </div>
            <div className="text-center">
              <p className="text-[32px] md:text-[40px] font-bold text-white mb-1">{CITIES.length}+</p>
              <p className="text-gray-400 text-[13px]">Городов</p>
            </div>
            <div className="text-center">
              <p className="text-[32px] md:text-[40px] font-bold text-white mb-1">98%</p>
              <p className="text-gray-400 text-[13px]">Довольных</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          СДАТЬ ЖИЛЬЁ — по ТЗ v4 (glass card, product benefit)
          ═══════════════════════════════════════════════════════════════ */}
      <section 
        className="py-14 md:py-18"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className={cn(
            'bg-white/[0.75] backdrop-blur-[22px]',
            'rounded-[20px]',
            'border border-white/60',
            'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
            'p-8 md:p-10'
          )}>
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Left: Icon + Title */}
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-violet-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h2 className="text-[22px] md:text-[26px] font-bold text-[#1C1F26]">
                  Сдаёте жильё?
                </h2>
              </div>
              
              {/* Right: Text + CTA */}
              <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-[#6B7280] text-[15px] leading-relaxed">
                  LOCUS анализирует рынок и подсказывает оптимальную цену
                </p>
                
                <Link 
                  href={hostCtaHref}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-[14px]',
                    'bg-violet-600 text-white font-semibold text-[15px]',
                    'hover:bg-violet-500 active:bg-violet-700',
                    'transition-all duration-200',
                    'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
                    'hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)]',
                    'hover:-translate-y-0.5',
                    'sm:whitespace-nowrap'
                  )}
                >
                  Разместить объявление
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {aiOpen && (
        <div
          className="fixed inset-0 z-overlay flex items-end bg-[var(--bg-overlay)] backdrop-blur-[var(--blur-soft)]"
          onClick={() => {
            setAiOpen(false)
            setDragOffset(0)
          }}
        >
          <div
            className={cn(
              'w-full rounded-t-3xl bg-[var(--surface)]',
              'shadow-[0_-12px_40px_rgba(0,0,0,0.2)]',
              'pb-8'
            )}
            style={{
              transform: `translateY(${dragOffset}px)`,
              transition: dragStart ? 'none' : 'transform 200ms ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 pt-3 pb-2"
              onTouchStart={(e) => {
                setDragStart(e.touches[0].clientY)
              }}
              onTouchMove={(e) => {
                if (dragStart === null) return
                const delta = e.touches[0].clientY - dragStart
                if (delta > 0) setDragOffset(Math.min(delta, 240))
              }}
              onTouchEnd={() => {
                if (dragOffset > 100) {
                  setAiOpen(false)
                  setDragOffset(0)
                } else {
                  setDragOffset(0)
                }
                setDragStart(null)
              }}
            >
              <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
            </div>

            <div className="px-6 pt-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[20px] font-bold text-[#1C1F26]">AI-подбор жилья</h3>
                  <p className="text-[14px] text-[#6B7280] mt-1">
                    Быстрый подбор с анализом цены и качества объявлений.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAiOpen(false)
                    setDragOffset(0)
                  }}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Закрыть"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  'Сравниваем цену с рынком и подсказываем, где переплата',
                  'Фильтруем сомнительные варианты и оставляем релевантные',
                  'Учитываем ваш город, тип жилья и бюджет'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-violet-500" />
                    <p className="text-[13px] text-gray-700">{item}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  handleAiStart()
                }}
                className={cn(
                  'mt-5 w-full rounded-[14px] px-5 py-3 text-[14px] font-semibold',
                  'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700',
                  'transition-colors'
                )}
              >
                Запустить AI‑подбор
              </button>
            </div>
          </div>
        </div>
      )}
      {showOnboarding && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-[var(--blur-soft)]">
          <div className="z-modal w-full max-w-[520px] rounded-[20px] p-5 bg-[var(--bg-card)] border border-[var(--border-main)]">
            {onboardingStep === 1 ? (
              <>
                <h3 className="text-[22px] font-bold text-[var(--text-main)]">Найдём жильё под ваш бюджет</h3>
                <p className="mt-2 text-[14px] text-[var(--text-secondary)]">AI анализирует рынок и подбирает варианты</p>
                <button type="button" className="btn-primary mt-5 w-full text-white" onClick={() => setOnboardingStep(2)}>
                  Начать
                </button>
              </>
            ) : (
              <>
                <h3 className="text-[18px] font-semibold text-[var(--text-main)]">Ваши параметры</h3>
                <div className="mt-4 grid gap-3">
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Город" className="hero-search-control px-3" />
                  <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="hero-search-control px-3">
                    <option value="">Бюджет</option>
                    <option value="0-30000">до 30 000 ₽</option>
                    <option value="30000-50000">30 — 50 тыс. ₽</option>
                    <option value="50000-80000">50 — 80 тыс. ₽</option>
                    <option value="80000-150000">80 — 150 тыс. ₽</option>
                    <option value="150000+">от 150 тыс. ₽</option>
                  </select>
                  <select value={rentPeriod} onChange={(e) => setRentPeriod(e.target.value)} className="hero-search-control px-3">
                    <option value="">Срок</option>
                    <option value="long">Длительный</option>
                    <option value="short">Посуточно</option>
                  </select>
                </div>
                <button type="button" className="btn-primary mt-5 w-full text-white" onClick={() => { saveOnboarding(); handleSearch(); }}>
                  Сохранить и запустить AI подбор
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showHelpNudge && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[320px] z-toast glass rounded-[14px] p-4 safe-area-pb">
          <p className="text-[14px] font-semibold text-[var(--text-main)]">Нужна помощь с подбором?</p>
          <button type="button" className="text-[13px] text-[var(--accent)] mt-1" onClick={() => setShowOnboarding(true)}>Открыть быстрый старт</button>
        </div>
      )}
      <button
        type="button"
        className="fixed right-4 bottom-24 md:bottom-8 z-toast btn-primary text-white px-4 safe-area-mb"
        onClick={() => setShowQuickFab(true)}
      >
        Быстрый подбор
      </button>
      {showQuickFab && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-[var(--blur-soft)]" onClick={() => setShowQuickFab(false)}>
          <div className="z-modal w-full max-w-[420px] rounded-[20px] p-5 bg-[var(--bg-card)] border border-[var(--border-main)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-semibold text-[var(--text-main)]">Быстрый подбор</h3>
            <div className="mt-4 grid gap-3">
              <input value={quickCity} onChange={(e) => setQuickCity(e.target.value)} className="hero-search-control px-3" placeholder="Город" />
              <input value={quickBudget} onChange={(e) => setQuickBudget(e.target.value)} className="hero-search-control px-3" placeholder="Бюджет" />
            </div>
            <button
              type="button"
              className="btn-primary mt-5 w-full text-white"
              onClick={() => {
                const params = new URLSearchParams()
                if (quickCity) params.set('city', quickCity)
                if (quickBudget) params.set('priceRange', quickBudget)
                setShowQuickFab(false)
                track('quick_match_open', { quickCity, quickBudget })
                router.push(`/listings?${params.toString()}`)
              }}
            >
              Запустить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
