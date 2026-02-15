'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { MarketAnalysisBlock } from '@/shared/ui/MarketAnalysisBlock'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { useAuthStore } from '@/domains/auth'
import { useFilterStore } from '@/core/filters'
import { BUDGET_PRESETS, PROPERTY_TYPES } from '@/core/filters'
import { FilterPanel, QuickAIModal, CitySelect } from '@/components/filters'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Hero } from '@/components/home/Hero'
import { StatsBlock } from '@/components/home/StatsBlock'
import { AIPopup } from '@/components/home/AIPopup'
import { PopularCities } from '@/components/home/PopularCities'
import { HowItWorks } from '@/components/home/HowItWorks'
import { AIBlock } from '@/components/home/AIBlock'
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
  const { city, budgetMin, budgetMax, type, duration, aiMode, setCity, setBudget, setType, setDuration, getBudgetQuery, reset: resetFilters } = useFilterStore()
  const [aiPreparing, setAiPreparing] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1)
  const [viewsCount, setViewsCount] = useState(0)
  const [showHelpNudge, setShowHelpNudge] = useState(false)
  const [showQuickFab, setShowQuickFab] = useState(false)
  const [highlightFirstCard, setHighlightFirstCard] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [showCityHint, setShowCityHint] = useState(false)
  const [shakeCities, setShakeCities] = useState(false)
  const [searching, setSearching] = useState(false)
  const [ctaLoading, setCtaLoading] = useState(false)

  const { data, isLoading } = useFetch<ListingsResponse>(['listings-home'], '/api/listings?limit=12')
  const isLandlord = user?.role === 'landlord'
  const isPaidTariff = user?.tariff === 'landlord_basic' || user?.tariff === 'landlord_pro'
  const hostCtaHref = isLandlord && isPaidTariff ? '/owner/dashboard?tab=add' : '/pricing?reason=host'

  /** ТЗ-2: если город не выбран — показать подсказку и shake, иначе переход в список */
  const handlePrimarySearch = () => {
    if (!city || !city.trim()) {
      setShowCityHint(true)
      setShakeCities(true)
      setTimeout(() => setShakeCities(false), 500)
      return
    }
    setShowCityHint(false)
    handleSearch()
  }

  const handleSearch = () => {
    setSearching(true)
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    const typeVal = Array.isArray(type) ? type[0] : type
    if (typeVal) params.set('type', typeVal)
    const { priceMin, priceMax } = getBudgetQuery()
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
    if (duration) params.set('rentPeriod', duration)
    if (aiMode) params.set('ai', 'true')
    const hasSeenSearch = typeof window !== 'undefined' && localStorage.getItem('locus_first_search_done') === 'true'
    if (!hasSeenSearch && typeof window !== 'undefined') {
      localStorage.setItem('locus_first_search_done', 'true')
      track('search_first', { city, priceMin, priceMax, duration, type })
    }
    router.push(`/listings?${params.toString()}`)
    setTimeout(() => setSearching(false), 2000)
  }

  /** ТЗ-20: при нажатии «Подобрать жильё» — loader в кнопке, затем переход к результатам с ai=true */
  const handleSmartSearch = () => {
    setCtaLoading(true)
    const params = new URLSearchParams()
    params.set('ai', 'true')
    if (city) params.set('city', city)
    const { priceMin, priceMax } = getBudgetQuery()
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
    const typeVal = Array.isArray(type) ? type[0] : type
    if (typeVal) params.set('type', typeVal)
    if (duration) params.set('rentPeriod', duration)
    track('smart_match_open', { city })
    router.push(`/listings?${params.toString()}`)
    setTimeout(() => setCtaLoading(false), 1200)
  }

  const handleQuickAILaunch = () => {
    setShowQuickFab(false)
    handleSmartSearch()
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const aiPopupClosed = localStorage.getItem('ai_popup_closed') === '1'
    if (aiPopupClosed) {
      setShowOnboarding(false)
    }
    const seen = localStorage.getItem('onboarding_seen') === 'true'
    const prefsRaw = localStorage.getItem('user.preferences')
    if (!seen && !aiPopupClosed) {
      setShowOnboarding(true)
      return
    }
    if (prefsRaw) {
      try {
        const prefs = JSON.parse(prefsRaw) as { city?: string; budget?: string; period?: string }
        if (prefs.city) useFilterStore.getState().setCity(prefs.city)
        if (prefs.budget) {
          const [min, max] = (prefs.budget || '').split('-').map((x) => (x ? Number(x.replace(/\s/g, '')) : ''))
          useFilterStore.getState().setBudget(min === undefined || min === '' ? '' : min, max === undefined || max === '' ? '' : max)
        }
        if (prefs.period) useFilterStore.setState({ duration: prefs.period === 'long' ? 'long' : prefs.period === 'short' ? 'short' : '' })
      } catch {}
    }
    const viewed = Number(localStorage.getItem('locus_viewed_count') || '0')
    setViewsCount(Number.isFinite(viewed) ? viewed : 0)
    const firstMatchSeen = localStorage.getItem('locus_first_match_seen') === 'true'
    setHighlightFirstCard(!firstMatchSeen)
  }, [])

  /** ТЗ-20: закрытие фильтра по Escape */
  useEffect(() => {
    if (!filterSheetOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFilterSheetOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filterSheetOpen])

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
    const hasBudget = budgetMin !== '' || budgetMax !== ''
    if (!city && !hasBudget) return null
    const minStr = budgetMin !== '' ? Number(budgetMin).toLocaleString('ru') : ''
    const maxStr = budgetMax !== '' ? `${Number(budgetMax).toLocaleString('ru')} ₽` : ''
    const budgetLabel = hasBudget ? ` до ${minStr}${minStr && maxStr ? ' — ' : ''}${maxStr}` : ''
    return `Подбор для вас в ${city || 'вашем городе'}${budgetLabel}`
  }, [city, budgetMin, budgetMax])

  const saveOnboarding = () => {
    if (typeof window === 'undefined') return
    const budgetStr = budgetMin !== '' && budgetMax !== '' ? `${budgetMin}-${budgetMax}` : ''
    const prefs = { city, budget: budgetStr, period: duration }
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
      id: listing.id ?? `listing-${index}`,
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

  return (
    <div className="home-tz18 min-h-screen font-sans antialiased bg-[var(--background)]">
      {/* ═══ TZ-19 UI-freeze: порядок блоков не менять. 1.Header 2.Hero 3.AI-подбор(в Hero) 4.Популярные города 5.Фильтр 6.Лента 7.Статистика 8.Футер ═══ */}
      {/* 2. HERO (включает AI-панель — пункт 3) */}
      <Hero onCtaClick={handleSmartSearch} onOpenFilters={() => setFilterSheetOpen(true)} ctaLoading={ctaLoading} />

      {/* 4. Популярные города — строго перед фильтром */}
      <section className="bg-transparent home-section-tz18--medium" aria-label="Популярные города">
        <div className="market-container">
          <PopularCities shake={shakeCities} />
        </div>
      </section>

      {/* 5. Фильтр / поиск — max-width 1000px, кнопки 54px / 44px */}
      <section id="search" className="bg-transparent relative z-20" aria-label="Поиск и фильтры">
        <div className="market-container home-search-wrap-tz12 home-search-wrap-tz18">
          <div className={cn('home-search-block-tz12 home-filter-animate-tz10 rounded-2xl md:rounded-[20px] border border-[var(--border)] bg-[var(--card-bg)] p-4 md:p-5', shakeCities && 'search-flow-shake')}>
            {/* Строка: Город | Бюджет | Тип (desktop) или столбик (mobile) */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Город</label>
                <CitySelect value={city ?? ''} onChange={(v) => { setCity(v || null); setShowCityHint(false) }} placeholder="Выберите город" className="w-full" autoFocus />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Бюджет</label>
                <select
                  value={budgetMin !== '' && budgetMax !== '' ? `${budgetMin}-${budgetMax}` : ''}
                  onChange={(e) => {
                    const v = e.target.value
                    if (!v) setBudget('', '')
                    else {
                      const preset = BUDGET_PRESETS.find((p) => `${p.min}-${p.max}` === v)
                      if (preset) setBudget(preset.min, preset.max)
                    }
                  }}
                  className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 text-[14px] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                >
                  <option value="">Любой бюджет</option>
                  {BUDGET_PRESETS.map((p) => (
                    <option key={p.label} value={`${p.min}-${p.max}`}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Тип жилья</label>
                <select
                  value={Array.isArray(type) ? type[0] ?? '' : (type ?? '')}
                  onChange={(e) => setType(e.target.value || '')}
                  className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 text-[14px] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                >
                  {PROPERTY_TYPES.map((o) => (
                    <option key={o.value || 'any'} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {showCityHint && (
              <p className="text-[14px] text-[var(--sub)] mb-3 rounded-xl px-4 py-2 bg-[var(--bg-secondary)] text-center" role="alert">
                Сначала выберите город
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handlePrimarySearch}
                disabled={searching}
                className="search-btn-show-tz18 search-hero-submit-tz7-compact w-full sm:flex-1 order-1 flex items-center justify-center gap-2"
              >
                {searching ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                    Загрузка…
                  </>
                ) : (
                  city?.trim() ? 'Показать варианты' : 'Подобрать жильё'
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="search-btn-filters-tz18 w-full sm:w-auto flex items-center justify-center gap-2 px-4 border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] font-medium text-[14px] order-2"
                aria-label="Открыть фильтры"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Фильтры
              </button>
            </div>
          </div>

          {/* ТЗ-12: Desktop — dropdown панель под поиском, с анимацией и затемнением фона */}
          {filterSheetOpen && (
            <>
              <div
                className="home-filter-overlay-tz12 fixed inset-0 bg-black/40 transition-opacity hidden md:block"
                style={{ zIndex: 899 }}
                aria-hidden
                onClick={() => setFilterSheetOpen(false)}
              />
              <div className="home-filter-dropdown-tz12 hidden md:block fixed left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1100px] rounded-[20px] border border-[var(--border)] bg-[var(--card-bg)] shadow-xl p-5 pb-6 overflow-y-auto"
                style={{ top: 'var(--home-search-dropdown-top, 320px)', zIndex: 900, maxHeight: '70vh' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-[var(--text)]">Фильтры</h2>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => resetFilters()} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors">
                      Сбросить
                    </button>
                    <button type="button" onClick={() => setFilterSheetOpen(false)} className="p-2 rounded-full text-[var(--sub)] hover:bg-[var(--border)]" aria-label="Закрыть">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <FilterPanel
                  embedded
                  wrapInCard={false}
                  showSearchButtons={true}
                  onSearch={() => { handlePrimarySearch(); setFilterSheetOpen(false); }}
                  onSmartSearch={() => { handleSmartSearch(); setFilterSheetOpen(false); }}
                  primaryButtonLabel="Показать варианты"
                  hideCityRow
                />
              </div>
            </>
          )}

          {/* ТЗ-12: Mobile — bottom sheet фильтров; на desktop показывается только dropdown выше */}
          <div className="md:hidden">
            <BottomSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} maxHeight="78vh" animateClose className="bg-[var(--card-bg)] border-t border-[var(--border)]">
            <div className="rounded-t-2xl border-0 max-w-none mx-0 p-4 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-[var(--text)]">Фильтры</h2>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => resetFilters()} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                    Сбросить
                  </button>
                  <button type="button" onClick={() => setFilterSheetOpen(false)} className="p-2 rounded-full text-[var(--sub)] hover:bg-[var(--border)]" aria-label="Закрыть">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <FilterPanel
                embedded
                wrapInCard={false}
                showSearchButtons={true}
                onSearch={() => { handlePrimarySearch(); setFilterSheetOpen(false); }}
                onSmartSearch={() => { handleSmartSearch(); setFilterSheetOpen(false); }}
                primaryButtonLabel="Показать варианты"
              />
            </div>
            </BottomSheet>
          </div>
        </div>
      </section>

      {/* 6. Лента объявлений — актуальные предложения */}
      <section className="bg-transparent home-section-tz18 animate-fade-in">
        <div className="market-container">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="section-title-tz19">
              Актуальные предложения
            </h2>
            <Link href="/listings" className="text-[14px] font-medium text-[var(--accent1)] hover:opacity-90 transition-all duration-200">
              Смотреть все →
            </Link>
          </div>
          <div className="listing-grid">
            {isLoading || aiPreparing || searching ? (
              Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
            ) : listingCards.length > 0 ? (
              listingCards.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photo || undefined}
                  title={listing.title}
                  price={listing.price}
                  city={listing.city}
                  district={listing.district || undefined}
                  rating={listing.rating}
                  highlight={highlightFirstCard && listing.id === listingCards[0]?.id}
                  className="listing-card-tz18"
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="home-card-tz4 rounded-2xl p-6 md:p-8 text-center">
                  <div className="mx-auto mb-3 w-10 h-10 rounded-[10px] bg-[var(--accent-soft)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--text-main)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7.5h18M6 4.5h12a2 2 0 012 2V18a2 2 0 01-2 2H6a2 2 0 01-2-2V6.5a2 2 0 012-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h8M8 16h5" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-semibold text-[var(--text)]">Пока нет объявлений</p>
                  <p className="mt-2 text-[14px] text-[var(--text-secondary)]">Попробуйте изменить фильтры.</p>
                  <Link href="/listings" className="mt-4 inline-flex items-center justify-center rounded-xl px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-[15px] hover:opacity-95 transition-all duration-200">
                    Смотреть все объявления
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Статистика — после ленты объявлений (TZ-19 порядок) */}
      <StatsBlock />

      {/* Рекомендации AI */}
      <section className="bg-transparent home-section-tz18">
        <div className="market-container">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="section-title-tz19">Рекомендации AI</h2>
            <Link href="/listings" className="text-[14px] font-medium text-[var(--accent1)] hover:opacity-90 transition-all duration-200">Смотреть все →</Link>
          </div>
          <div className="listing-grid">
            {!isLoading && listingCards.length > 0 ? listingCards.slice(0, 6).map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                photo={listing.photo || undefined}
                title={listing.title}
                price={listing.price}
                city={listing.city}
                district={listing.district || undefined}
                rating={listing.rating}
                className="listing-card-tz18"
              />
            )) : !isLoading ? (
              <div className="col-span-full glass rounded-[20px] p-6 text-center">
                <p className="text-[var(--text)] font-semibold">Нет рекомендаций</p>
                <p className="text-[var(--sub)] text-[14px] mt-1">Подберите параметры в умном подборе</p>
              </div>
            ) : (
              Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
            )}
          </div>
        </div>
      </section>

      {/* Последние просмотренные */}
      <section className="bg-transparent home-section-tz18">
        <div className="market-container">
          <h2 className="section-title-tz19 mb-6 md:mb-8">Последние просмотренные</h2>
          <div className="listing-grid">
            {!isLoading && listingCards.length > 0 ? listingCards.slice(0, 3).map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                photo={listing.photo || undefined}
                title={listing.title}
                price={listing.price}
                city={listing.city}
                district={listing.district || undefined}
                rating={listing.rating}
                className="listing-card-tz18"
              />
            )) : (
              <div className="col-span-full glass rounded-[20px] p-6 text-center">
                <p className="text-[var(--sub)] text-[14px]">Просматривайте объявления — они появятся здесь</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* НОВЫЙ ПРОДУКТОВЫЙ БЛОК — доверие после объявлений */}
      <div className="border-t border-[var(--border)]">
        <MarketAnalysisBlock />
      </div>

      {/* ТЗ-2: Как работает — 3 карточки */}
      <HowItWorks />

      {/* ТЗ-MAIN-REDESIGN: AI-блок */}
      <AIBlock />

      {/* НОВОСТИ РЫНКА */}
      <section className="bg-transparent">
        <div className="market-container">
          <div className="text-center mb-10">
            <h2 className="section-title-tz19 mb-2">
              Новости рынка
            </h2>
            <p className="text-[var(--sub)] max-w-md mx-auto text-[15px]">
              Актуальная информация о рынке аренды
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {/* Новость 1 — Рост цен */}
            <article className="group bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-lg shadow-black/20 transition-shadow">
              <div className="h-32 bg-blue-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Аналитика</span>
                <h3 className="text-[15px] font-semibold text-[var(--text)] mt-1.5 mb-1.5 line-clamp-2">
                  Средняя аренда в Москве выросла на 8%
                </h3>
                <p className="text-[var(--sub)] text-[13px] leading-relaxed line-clamp-2">
                  Цены продолжают расти. Эксперты прогнозируют стабилизацию к весне.
                </p>
              </div>
            </article>

            {/* Новость 2 — Популярные районы */}
            <article className="group bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-lg shadow-black/20 transition-shadow">
              <div className="h-32 bg-emerald-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-emerald-400 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Рейтинг</span>
                <h3 className="text-[15px] font-semibold text-[var(--text)] mt-1.5 mb-1.5 line-clamp-2">
                  Топ-5 районов для аренды в 2026
                </h3>
                <p className="text-[var(--sub)] text-[13px] leading-relaxed line-clamp-2">
                  Самые комфортные районы с учётом инфраструктуры и транспорта.
                </p>
              </div>
            </article>

            {/* Новость 3 — Советы */}
            <article className="group bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-lg shadow-black/20 transition-shadow">
              <div className="h-32 bg-amber-50 flex items-center justify-center">
                <svg className="w-12 h-12 text-amber-400 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">Советы</span>
                <h3 className="text-[15px] font-semibold text-[var(--text)] mt-1.5 mb-1.5 line-clamp-2">
                  Как не переплатить за аренду
                </h3>
                <p className="text-[var(--sub)] text-[13px] leading-relaxed line-clamp-2">
                  5 правил, чтобы снять квартиру по справедливой цене.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          СДАТЬ ЖИЛЬЁ — по ТЗ v4 (glass card, product benefit)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{ background: 'linear-gradient(180deg, var(--bg-main) 0%, var(--bg-secondary) 100%)' }}
      >
        <div className="market-container">
          <div className={cn(
            'bg-[var(--card)] backdrop-blur-[22px]',
            'rounded-[20px] border border-white/60',
            'shadow-lg shadow-black/20',
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
                <h2 className="text-[22px] md:text-[26px] font-bold text-[var(--text-main)]">
                  Сдаёте жильё?
                </h2>
              </div>
              
              {/* Right: Text + CTA */}
              <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">
                  LOCUS анализирует рынок и подсказывает оптимальную цену
                </p>
                
                <Link 
                  href={hostCtaHref}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-[14px]',
                    'bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px]',
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

      {showOnboarding && onboardingStep === 1 && (
        <AIPopup
          open
          onClose={() => {
            if (typeof window !== 'undefined') localStorage.setItem('ai_popup_closed', '1')
            setShowOnboarding(false)
          }}
          onStart={() => setOnboardingStep(2)}
          primaryButtonText="Начать"
        />
      )}
      {showOnboarding && onboardingStep === 2 && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 'var(--z-overlay)' }}>
          <div className="overlay" onClick={() => setShowOnboarding(false)} aria-hidden />
          <div className="modal-panel relative w-full max-w-[520px] rounded-[20px] p-5 bg-[var(--bg-modal)] border border-[var(--border)]" style={{ zIndex: 'var(--z-modal)' }} onClick={(e) => e.stopPropagation()}>
              <>
                <h3 className="text-[18px] font-semibold text-[var(--text-main)]">Ваши параметры</h3>
                <div className="mt-4 grid gap-3">
                  <input value={city ?? ''} onChange={(e) => setCity(e.target.value || null)} placeholder="Город" className="hero-search-control px-3" />
                  <select
                    value={budgetMin !== '' && budgetMax !== '' ? `${budgetMin}-${budgetMax}` : ''}
                    onChange={(e) => {
                      const v = e.target.value
                      if (!v) setBudget('', '')
                      else {
                        const [min, max] = v.split('-').map(Number)
                        setBudget(min, max)
                      }
                    }}
                    className="hero-search-control px-3"
                  >
                    <option value="">Бюджет</option>
                    <option value="0-30000">до 30 000 ₽</option>
                    <option value="30000-50000">30 — 50 тыс. ₽</option>
                    <option value="50000-80000">50 — 80 тыс. ₽</option>
                    <option value="80000-150000">80 — 150 тыс. ₽</option>
                    <option value="150000-500000">от 150 тыс. ₽</option>
                  </select>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="hero-search-control px-3">
                    <option value="">Срок</option>
                    <option value="long">Длительный</option>
                    <option value="short">Посуточно</option>
                  </select>
                </div>
                <button type="button" className="btn btn--primary btn--md mt-5 w-full" onClick={() => { saveOnboarding(); handleSearch(); }}>
                  Сохранить и запустить AI подбор
                </button>
              </>
          </div>
        </div>
      )}
      {showHelpNudge && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[320px] z-toast glass rounded-[14px] p-4 safe-area-pb">
          <p className="text-[14px] font-semibold text-[var(--text-main)]">Нужна помощь с подбором?</p>
          <button type="button" className="text-[13px] text-[var(--accent)] mt-1" onClick={() => { setOnboardingStep(1); setShowOnboarding(true); }}>Открыть умный подбор</button>
        </div>
      )}
      {/* ТЗ-7: Умный подбор — единый QuickAIModal на store */}
      <QuickAIModal
        open={showQuickFab}
        onClose={() => setShowQuickFab(false)}
        city={city ?? ''}
        budgetMin={budgetMin}
        budgetMax={budgetMax}
        type={Array.isArray(type) ? type[0] ?? '' : (type ?? '')}
        onCityChange={(v) => setCity(v || null)}
        onBudgetChange={setBudget}
        onTypeChange={setType}
        onLaunch={handleQuickAILaunch}
      />
    </div>
  )
}
