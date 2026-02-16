'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { useAuthStore } from '@/domains/auth'
import { useFilterStore } from '@/core/filters'
import { BUDGET_PRESETS, PROPERTY_TYPES, ROOMS_OPTIONS } from '@/core/filters'
import { FilterPanel, QuickAIModal, CitySelect, AIWizardModal } from '@/components/filters'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Hero } from '@/components/home/Hero'
import { StatsBlock } from '@/components/home/StatsBlock'
import { AIPopup } from '@/components/home/AIPopup'
import { PopularCities } from '@/components/home/PopularCities'
import SearchIcon from '@/components/lottie/SearchIcon'
import { track } from '@/shared/analytics/events'
import { useHomeListingCards } from './home/useHomeListingCards'

interface ListingsResponse {
  items: any[]
}

interface UserPrefs {
  city?: string
  budget?: string
  period?: string
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
  const { city, budgetMin, budgetMax, type, duration, aiMode, rooms, setCity, setBudget, setType, setDuration, setAiMode, setRooms, getBudgetQuery, reset: resetFilters } = useFilterStore()
  const [aiPreparing, setAiPreparing] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1)
  const [viewsCount, setViewsCount] = useState(0)
  const [showHelpNudge, setShowHelpNudge] = useState(false)
  const [showQuickFab, setShowQuickFab] = useState(false)
  const [highlightFirstCard, setHighlightFirstCard] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [showAIWizard, setShowAIWizard] = useState(false)
  const [showCityHint, setShowCityHint] = useState(false)
  const [shakeCities, setShakeCities] = useState(false)
  const [searching, setSearching] = useState(false)
  const [ctaLoading, setCtaLoading] = useState(false)
  const [showDiffPopup, setShowDiffPopup] = useState(false)
  /** ТЗ-5: на главной после «Показать варианты» показываем результаты на той же странице (scroll к #listings) */
  const [searchApplied, setSearchApplied] = useState(false)
  /** ТЗ-5: sticky поиск — показывать при скролле вниз (высота 72px) */
  const [stickySearchVisible, setStickySearchVisible] = useState(false)
  /** ТЗ-18: лимит для блока «Все объявления» — «Показать ещё» увеличивает */
  const [allListingsLimit, setAllListingsLimit] = useState(12)
  const searchSectionRef = useRef<HTMLElement | null>(null)

  /** ТЗ-9: скролл к блоку фильтра (кнопка «Фильтры» не ведёт на /search) */
  const handleScrollToFilter = () => {
    const el = typeof document !== 'undefined' ? document.getElementById('home-filter') : null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const el = document.getElementById('home-filter')
    searchSectionRef.current = el
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setStickySearchVisible(!e.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /** ТЗ-5: при открытых фильтрах блокировать скролл body (desktop dropdown и mobile sheet) */
  useEffect(() => {
    if (!filterSheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev || '' }
  }, [filterSheetOpen])

  const { priceMin, priceMax } = getBudgetQuery()
  const listingsPath = searchApplied && city
    ? `/api/listings?limit=12&city=${encodeURIComponent(city)}${priceMin ? '&priceMin=' + priceMin : ''}${priceMax ? '&priceMax=' + priceMax : ''}${aiMode ? '&ai=true' : ''}`
    : '/api/listings?limit=12'
  const { data, isLoading } = useFetch<ListingsResponse>(['listings-home', searchApplied, city, priceMin, priceMax, aiMode], listingsPath)

  /** ТЗ-18: блок «Все объявления» — sort=created_at_desc, те же фильтры при выборе города */
  const allListingsPath = searchApplied && city
    ? `/api/listings?limit=${allListingsLimit}&sort=created_at_desc&city=${encodeURIComponent(city)}${priceMin ? '&priceMin=' + priceMin : ''}${priceMax ? '&priceMax=' + priceMax : ''}`
    : `/api/listings?limit=${allListingsLimit}&sort=created_at_desc`
  const { data: allListingsData, isLoading: allListingsLoading } = useFetch<ListingsResponse>(
    ['listings-all', allListingsLimit, searchApplied, city, priceMin, priceMax],
    allListingsPath
  )
  const allListingCards = useHomeListingCards(allListingsData)
  const isLandlord = user?.role === 'landlord'
  const isPaidTariff = user?.tariff === 'landlord_basic' || user?.tariff === 'landlord_pro'
  const hostCtaHref = isLandlord && isPaidTariff ? '/owner/dashboard?tab=add' : '/pricing?reason=host'

  /** ТЗ-5: на главной — scroll к результатам на той же странице; не открывать новую страницу */
  const handlePrimarySearch = () => {
    if (!city || !city.trim()) {
      setShowCityHint(true)
      setShakeCities(true)
      setTimeout(() => setShakeCities(false), 500)
      return
    }
    setShowCityHint(false)
    setSearchApplied(true)
    const el = typeof document !== 'undefined' ? document.getElementById('listings') : null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const buildSearchParams = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    const typeVal = Array.isArray(type) ? type[0] : type
    if (typeVal) params.set('type', typeVal)
    const { priceMin, priceMax } = getBudgetQuery()
    if (priceMin) params.set('priceMin', priceMin)
    if (priceMax) params.set('priceMax', priceMax)
    if (duration) params.set('rentPeriod', duration)
    if (aiMode) params.set('ai', 'true')
    return params
  }

  const handleSearch = () => {
    setSearching(true)
    const params = buildSearchParams()
    const hasSeenSearch = typeof window !== 'undefined' && localStorage.getItem('locus_first_search_done') === 'true'
    if (!hasSeenSearch && typeof window !== 'undefined') {
      localStorage.setItem('locus_first_search_done', 'true')
      track('search_first', { city, priceMin: params.get('priceMin'), priceMax: params.get('priceMax'), duration, type })
    }
    router.push(`/listings?${params.toString()}`)
    setTimeout(() => setSearching(false), 2000)
  }

  /** ТЗ-9: из модалки фильтра — переход на страницу поиска с выбранными параметрами */
  const handleFilterApplyAndGo = () => {
    const params = buildSearchParams()
    router.push(`/listings?${params.toString()}`)
    setFilterSheetOpen(false)
  }

  /** ТЗ-6: на главной «Применить» в фильтре — обновить выдачу ниже, без перехода на /listings */
  const handleFilterApplyLocal = () => {
    setFilterSheetOpen(false)
    setSearchApplied(true)
    const el = typeof document !== 'undefined' ? document.getElementById('listings') : null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  /** ТЗ-19: «Подобрать жильё» — в режиме AI открываем wizard; в Ручном — скролл к списку/фильтру */
  const handleHeroCta = () => {
    if (aiMode) {
      setShowAIWizard(true)
      return
    }
    if (city?.trim()) {
      setCtaLoading(true)
      handlePrimarySearch()
      setTimeout(() => setCtaLoading(false), 1500)
      return
    }
    handleScrollToFilter()
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
        const prefs = JSON.parse(prefsRaw) as UserPrefs
        if (prefs.city) useFilterStore.getState().setCity(prefs.city)
        if (prefs.budget) {
          const [min, max] = (prefs.budget || '').split('-').map((x) => (x ? Number(x.replace(/\s/g, '')) : ''))
          useFilterStore.getState().setBudget(min === undefined || min === '' ? '' : min, max === undefined || max === '' ? '' : max)
        }
        if (prefs.period) useFilterStore.setState({ duration: prefs.period === 'long' ? 'long' : prefs.period === 'short' ? 'short' : '' })
      } catch (_) {}
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

  const listingCards = useHomeListingCards(data);

  return (
    <div className="home-tz18 home-tz3 home-tz6 min-h-screen font-sans antialiased bg-[var(--background)]">
      {/* ТЗ-5: sticky поиск — фикс. сверху 72px при скролле вниз */}
      {stickySearchVisible && (
        <div className="home-search-sticky-tz5 fixed left-0 right-0 z-[80] h-[72px] flex items-center gap-3 px-4 md:px-6 bg-[var(--card-bg)] border-b border-[var(--border)] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <div className="market-container w-full max-w-[1200px] mx-auto flex flex-wrap items-center gap-2 md:gap-4">
            <CitySelect value={city ?? ''} onChange={(v) => setCity(v || null)} placeholder="Город" className="home-search-sticky-tz5__city w-32 md:w-40" />
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
              className="home-search-sticky-tz5__budget h-9 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-[13px] text-[var(--text-main)] w-28 md:w-36"
            >
              <option value="">Бюджет</option>
              {BUDGET_PRESETS.map((p) => (
                <option key={p.label} value={`${p.min}-${p.max}`}>{p.label}</option>
              ))}
            </select>
            <button type="button" onClick={handleScrollToFilter} className="h-9 px-3 rounded-lg border border-[var(--border)] text-[13px] font-medium text-[var(--text-main)]" aria-label="Фильтры">
              Фильтры
            </button>
            <button type="button" onClick={handlePrimarySearch} disabled={searching} className="h-9 px-4 rounded-lg bg-[var(--accent)] text-white text-[13px] font-semibold ml-auto">
              {searching ? '…' : 'Показать'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ ТЗ-6: порядок 1.Hero 2.Быстрый поиск 3.Города 4.Расширенный поиск 5.Объявления 6.AI 7.Новости 8.Статистика ═══ */}
      {/* 1. Hero — кнопка скроллит к поиску, под кнопкой сразу поиск */}
      <Hero onCtaClick={handleHeroCta} onOpenFilters={() => setFilterSheetOpen(true)} ctaLoading={ctaLoading} selectedCity={city ?? ''} />

      {/* ТЗ-17: 2. Фильтр сразу под hero, отступ 24px */}
      <section id="home-filter" className="home-tz6-block home-filter-section-tz9 home-tz17-filter-spacing relative z-20" aria-label="Поиск жилья">
        <div className="market-container home-search-wrap-tz12 home-search-wrap-tz18">
          <div className={cn('home-search-block-tz12 home-filter-animate-tz10 rounded-2xl md:rounded-[20px] border border-[var(--border)] bg-[var(--card-bg)] p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]', shakeCities && 'search-flow-shake')}>
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
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                ) : (
                  'Показать варианты'
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="search-btn-filters-tz18 w-full sm:w-auto flex items-center justify-center gap-2 px-4 border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] font-medium text-[14px] order-2"
                aria-label="Расширенные фильтры"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Фильтры
              </button>
            </div>
          </div>

          {/* ТЗ-19: переключатель Ручной / AI-подбор — pill 40px, radius 20px, подсказка под ним, (i) → tooltip */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="home-tz19-pill flex w-full md:w-auto md:max-w-[400px] rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-1 gap-2">
                <button
                  type="button"
                  onClick={() => setAiMode(false)}
                  className={cn(
                    'home-tz19-pill-btn flex-1 h-10 min-h-[40px] rounded-[20px] text-[14px] font-medium transition-all duration-150 border',
                    !aiMode ? 'bg-[var(--accent)] text-white border-transparent shadow-sm' : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  )}
                >
                  Ручной
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode(true)}
                  className={cn(
                    'home-tz19-pill-btn flex-1 h-10 min-h-[40px] rounded-[20px] text-[14px] font-medium transition-all duration-150 border',
                    aiMode ? 'bg-[var(--accent)] text-white border-transparent shadow-sm' : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  )}
                >
                  AI-подбор
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowDiffPopup(true)}
                className="home-tz19-question flex-shrink-0 w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors flex items-center justify-center text-[13px] font-semibold"
                aria-label="В чём разница?"
                title="В чём разница?"
              >
                i
              </button>
            </div>
            {/* ТЗ-19: подсказка под переключателем + fade 150ms */}
            <div
              className="search-hint-tz13 search-hint-tz19 mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-[480px] md:max-w-none text-center md:text-left line-clamp-2 md:line-clamp-none transition-opacity duration-150"
              key={aiMode ? 'ai' : 'manual'}
            >
              {aiMode ? (
                'AI подберёт лучшие варианты под ваш бюджет и даты'
              ) : (
                'Настройте фильтры сами и получите точные результаты'
              )}
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
              <div
                className="home-filter-dropdown-tz12 home-filter-modal-tz9 hidden md:flex flex-col fixed left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1100px] rounded-[20px] border border-[var(--border)] bg-[var(--card-bg)] shadow-xl text-[var(--text-main)]"
                style={{ top: 'var(--home-search-dropdown-top, 120px)', zIndex: 900, maxHeight: '60vh', height: '60vh' }}
              >
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)]">
                  <h2 className="text-[16px] font-bold text-[var(--text-main)]">Фильтры</h2>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => resetFilters()} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors">Сбросить</button>
                    <button type="button" onClick={() => setFilterSheetOpen(false)} className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border)]" aria-label="Закрыть">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 home-filter-modal-tz9__body" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <FilterPanel embedded wrapInCard={false} showSearchButtons={false} hideCityRow />
                </div>
                <div className="flex-shrink-0 flex gap-3 p-4 border-t border-[var(--border)] bg-[var(--card-bg)]">
                  <button type="button" onClick={() => { resetFilters(); setFilterSheetOpen(false); }} className="flex-1 h-12 rounded-xl border border-[var(--border)] text-[var(--text-main)] font-medium text-[14px]">Сбросить</button>
                  <button type="button" onClick={handleFilterApplyLocal} className="flex-1 h-12 rounded-xl bg-[var(--accent)] text-white font-semibold text-[14px]">Применить</button>
                </div>
              </div>
            </>
          )}

          {/* ТЗ-5: Mobile — fullscreen modal, скролл внутри панели, фикс. footer Применить/Сбросить */}
          <div className="md:hidden">
            <BottomSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} maxHeight="90vh" animateClose className="bg-[var(--card-bg)] border-t border-[var(--border)]">
              <div className="flex flex-col h-full min-h-0 rounded-t-2xl border-0 max-w-none mx-0">
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)]">
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
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 home-filter-modal-tz9__body" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <FilterPanel
                    embedded
                    wrapInCard={false}
                    showSearchButtons={false}
                  />
                </div>
                <div className="flex-shrink-0 flex gap-3 p-4 border-t border-[var(--border)] bg-[var(--card-bg)]">
                  <button type="button" onClick={() => { resetFilters(); setFilterSheetOpen(false); }} className="flex-1 h-12 rounded-xl border border-[var(--border)] text-[var(--text-main)] font-medium text-[14px]">
                    Сбросить
                  </button>
                  <button type="button" onClick={handleFilterApplyLocal} className="flex-1 h-12 rounded-xl bg-[var(--accent)] text-white font-semibold text-[14px]">
                    Применить
                  </button>
                </div>
              </div>
            </BottomSheet>
          </div>
        </div>
      </section>

      {/* ТЗ-21: 3. Актуальные предложения — сразу после фильтра */}
      <section id="listings" className="home-tz6-block home-tz17-listings-spacing bg-transparent animate-fade-in scroll-mt-4">
        <div className="market-container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 md:mb-8">
            <div>
              <h2 className="section-title-tz19">
                Актуальные предложения
              </h2>
              <p className="text-[var(--text-secondary)] text-[15px] mt-1">
                Лучшие варианты прямо сейчас
              </p>
            </div>
            <Link href="/listings" className="text-[14px] font-medium text-[var(--accent)] hover:opacity-90 transition-all duration-200 shrink-0">
              Смотреть все объявления
            </Link>
          </div>
          <div className="listing-grid listing-grid-tz4 listing-grid-tz10">
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
                  metro={listing.metro || undefined}
                  rentalType={listing.rentalType}
                  rooms={listing.rooms}
                  area={listing.area}
                  guests={listing.guests ?? undefined}
                  floor={listing.floor ?? undefined}
                  totalFloors={listing.totalFloors ?? undefined}
                  aiReasons={listing.aiReasons}
                  badges={listing.badges}
                  rating={listing.rating}
                  reviewCount={listing.reviewCount ?? undefined}
                  propertyType={listing.propertyType}
                  amenities={listing.amenities?.length ? listing.amenities : undefined}
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

      {/* ТЗ-18: 5. Все объявления — отдельный блок, sort=created_at_desc, без AI-меток */}
      <section id="listings-all" className="home-tz6-block home-tz18-all-section" aria-label="Все объявления">
        <div className="market-container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 md:mb-8">
            <div>
              <h2 className="section-title-tz19">
                Все объявления
              </h2>
              <p className="text-[var(--text-secondary)] text-[15px] mt-1">
                Последние размещённые объекты
              </p>
            </div>
            <Link href="/listings" className="text-[14px] font-medium text-[var(--accent)] hover:opacity-90 transition-all duration-200 shrink-0">
              Смотреть все объявления
            </Link>
          </div>
          <div className="listing-grid listing-grid-tz4 listing-grid-tz10">
            {allListingsLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
            ) : allListingCards.length > 0 ? (
              allListingCards.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  photo={listing.photo || undefined}
                  title={listing.title}
                  price={listing.price}
                  city={listing.city}
                  district={listing.district || undefined}
                  metro={listing.metro || undefined}
                  rentalType={listing.rentalType}
                  rooms={listing.rooms}
                  area={listing.area}
                  guests={listing.guests ?? undefined}
                  floor={listing.floor ?? undefined}
                  totalFloors={listing.totalFloors ?? undefined}
                  aiReasons={undefined}
                  badges={listing.badges?.filter((b) => b !== 'ai') ?? []}
                  rating={listing.rating}
                  reviewCount={listing.reviewCount ?? undefined}
                  propertyType={listing.propertyType}
                  amenities={listing.amenities?.length ? listing.amenities : undefined}
                  className="listing-card-tz18"
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="home-card-tz4 rounded-2xl p-6 md:p-8 text-center">
                  <p className="text-[16px] font-semibold text-[var(--text)]">Пока нет объявлений</p>
                  <p className="mt-2 text-[14px] text-[var(--text-secondary)]">Измените фильтры или зайдите позже.</p>
                  <Link href="/listings" className="mt-4 inline-flex items-center justify-center rounded-xl px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-[15px] hover:opacity-95 transition-all duration-200">
                    Смотреть все объявления
                  </Link>
                </div>
              </div>
            )}
          </div>
          {allListingCards.length > 0 && allListingCards.length >= allListingsLimit && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setAllListingsLimit((prev) => prev + 12)}
                disabled={allListingsLoading}
                className="px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-main)] font-medium text-[14px] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-60"
              >
                {allListingsLoading ? 'Загрузка…' : 'Показать ещё'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ТЗ-21: 5. Популярные города — после Актуальные и Все объявления */}
      <section className="home-tz6-block home-tz6-cities home-tz9-cities home-tz21-cities-spacing" aria-label="Популярные города">
        <div className="market-container">
          <PopularCities shake={shakeCities} />
        </div>
      </section>

      {/* ТЗ-9: AI подбор — кнопка открывает wizard (не фильтр) */}
      <section className="home-tz6-block" aria-label="Умный подбор">
        <div className="market-container">
          <button
            type="button"
            onClick={() => setShowAIWizard(true)}
            className="home-tz3-ai-card w-full max-w-[900px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left rounded-[20px] border border-[var(--border)] bg-[var(--card-bg)] p-4 md:p-5 shadow-[var(--shadow-card)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow"
            aria-label="Подобрать жильё с AI"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              <div>
                <p className="text-[15px] md:text-[16px] font-medium text-[var(--text-main)]">Подобрать жильё с AI</p>
                <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] mt-0.5">Пошаговый подбор: город, даты, бюджет, цель — и топ-5 вариантов с объяснением</p>
              </div>
            </div>
            <span className="text-[14px] md:text-[15px] font-semibold text-[var(--accent)] shrink-0">Открыть подбор →</span>
          </button>
        </div>
      </section>

      {/* 7. Новости рынка — ТЗ-6 экран 6: цены, тренды, районы */}
      <section className="home-tz6-block" aria-label="Новости рынка">
        <div className="market-container">
          <div className="text-center mb-8">
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

      {/* ТЗ-17: 7. Статистика — внизу после новостей рынка, перед футером */}
      <StatsBlock />

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
      {/* ТЗ-21: popup «Нужна помощь» — с крестиком, не залипает */}
      {showHelpNudge && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[320px] z-toast glass rounded-[14px] p-4 safe-area-pb border border-[var(--border)] bg-[var(--card-bg)] shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-main)]">Нужна помощь с подбором?</p>
              <button type="button" className="text-[13px] text-[var(--accent)] mt-1 hover:underline" onClick={() => { setOnboardingStep(1); setShowOnboarding(true); setShowHelpNudge(false); }}>Открыть умный подбор</button>
            </div>
            <button type="button" onClick={() => setShowHelpNudge(false)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] shrink-0" aria-label="Закрыть">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
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
      {/* ТЗ-9: AI wizard — 5 шагов, затем выдача 5 вариантов с «Почему подходит» */}
      {/* ТЗ-20: AI-подбор — модал, после «Подобрать» переход на /listings с фильтрами */}
      <AIWizardModal
        open={showAIWizard}
        onClose={() => setShowAIWizard(false)}
        onComplete={(params) => {
          const p = new URLSearchParams()
          p.set('ai', 'true')
          if (params.city) p.set('city', params.city)
          if (params.budgetMin != null) p.set('priceMin', String(params.budgetMin))
          if (params.budgetMax != null) p.set('priceMax', String(params.budgetMax))
          if (params.propertyType) p.set('type', params.propertyType)
          if (params.when) p.set('date', params.when)
          router.push(`/listings?${p.toString()}`)
        }}
      />

      {/* ТЗ-19: tooltip «В чём разница?» — Ручной vs AI-подбор */}
      {showDiffPopup && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[var(--z-modal)]" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDiffPopup(false)} aria-hidden />
          <div className="relative w-full max-w-[400px] rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-[18px] font-semibold text-[var(--text-main)]">В чём разница?</h3>
              <button type="button" onClick={() => setShowDiffPopup(false)} className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]" aria-label="Закрыть">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 text-[14px] text-[var(--text-secondary)]">
              <p><strong className="text-[var(--text-main)]">Ручной поиск</strong> — вы выбираете фильтры сами.</p>
              <p><strong className="text-[var(--text-main)]">AI-подбор</strong> — система анализирует бюджет, даты и предпочтения и показывает лучшие варианты.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
