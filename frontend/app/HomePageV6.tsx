'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { ListingCardLight, ListingCardLightSkeleton } from '@/domains/listing/ListingCardLight'

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
  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [rentPeriod, setRentPeriod] = useState('')
  const [smartSearch, setSmartSearch] = useState(true) // AI toggle

  const { data, isLoading } = useFetch<ListingsResponse>(['listings-home'], '/api/listings?limit=12')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (propertyType) params.set('type', propertyType)
    if (priceRange) params.set('priceRange', priceRange)
    if (rentPeriod) params.set('period', rentPeriod)
    if (smartSearch) params.set('smart', 'true')
    router.push(`/listings?${params.toString()}`)
  }

  // Используем данные напрямую из API (они уже содержат все нужные поля)
  // HYDRATION-SAFE: No Math.random() or Date.now() - use data from API only
  const listingCards = (data?.items || []).map((listing: any, index: number) => {
    // Извлекаем фото из images (только Supabase URLs)
    const photo = listing.images?.[0]?.url || null
    
    // District из API
    const district = listing.district || null
    
    // Views из API или детерминированное значение на основе ID
    const views = listing.views || 100
    
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

    return {
      id: listing.id,
      photo,
      title: cleanTitle,
      price: listing.pricePerNight || listing.basePrice || 0,
      city: listing.city || 'Не указан',
      district,
      // HYDRATION-SAFE: Use data from API or stable defaults
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
    }
  })

  // Стиль для select/dropdown — жидкое стекло с закругленными углами
  const selectStyles = cn(
    'w-full rounded-[14px] pl-10 pr-4 py-2.5',
    'border border-white/60',
    'bg-white/75 backdrop-blur-[18px]',
    'text-[#1C1F26] text-[15px]',
    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
    'transition-all duration-150 ease-out cursor-pointer',
    'appearance-none',
    'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
    'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
    'hover:bg-white/85'
  )

  return (
    <div className="min-h-screen font-sans antialiased" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION — v4 (real estate language, search доминирует)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-10 pb-14 md:pt-14 md:pb-18">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Headline — по ТЗ v4 */}
          <h1 className="text-[36px] md:text-[44px] font-bold text-[#1C1F26] mb-3 leading-[1.1] tracking-tight">
            Найдите жильё, которое подходит вам
          </h1>

          {/* Subtitle — по ТЗ v4 */}
          <p className="text-[15px] md:text-[16px] text-[#6B7280] mb-10 max-w-lg mx-auto leading-relaxed">
            Тысячи объявлений с умным подбором
          </p>

          {/* ═══════════════════════════════════════════════════════════════
              GLASS SEARCH PANEL — по ТЗ v4 (доминирует)
              - backdrop-filter: blur(22px)
              - background: rgba(255,255,255,0.75)
              - border-radius: 20px
              - shadow: 0 20px 60px rgba(0,0,0,0.12)
              ═══════════════════════════════════════════════════════════════ */}
          <div className={cn(
            'max-w-4xl mx-auto',
            'bg-white/[0.75] backdrop-blur-[22px]',
            'rounded-[20px]',
            'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
            'border border-white/60',
            'p-6 md:p-7'
          )}>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Город */}
                <div className="lg:col-span-1">
                  <label className="block text-[13px] font-medium text-gray-600 mb-2 text-left">
                    Город
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={selectStyles}
                    >
                      <option value="">Все города</option>
                      <option value="Москва">Москва</option>
                      <option value="Санкт-Петербург">Санкт-Петербург</option>
                      <option value="Казань">Казань</option>
                      <option value="Новосибирск">Новосибирск</option>
                      <option value="Екатеринбург">Екатеринбург</option>
                      <option value="Сочи">Сочи</option>
                      <option value="Сургут">Сургут</option>
                    </select>
                  </div>
                </div>

                {/* Тип жилья */}
                <div className="lg:col-span-1">
                  <label className="block text-[13px] font-medium text-gray-600 mb-2 text-left">
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
                  <label className="block text-[13px] font-medium text-gray-600 mb-2 text-left">
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
                  <label className="block text-[13px] font-medium text-gray-600 mb-2 text-left">
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
                    className={cn(
                      'w-full',
                      'px-6 py-3 rounded-[14px]',
                      'bg-violet-600 text-white font-semibold',
                      'hover:bg-violet-500',
                      'active:bg-violet-700',
                      'transition-all duration-200',
                      'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
                      'hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)]',
                      'hover:-translate-y-0.5',
                      'flex items-center justify-center gap-2',
                      'text-[15px]'
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Найти
                  </button>
                </div>
              </div>
              
              {/* AI Toggle — по ТЗ v4 */}
              <div className="mt-4 pt-4 border-t border-gray-200/60">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={smartSearch}
                    onChange={(e) => setSmartSearch(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 focus:ring-2"
                  />
                  <span className="text-[13px] text-[#6B7280] group-hover:text-[#1C1F26] transition-colors">
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
        <div className="max-w-7xl mx-auto px-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ListingCardLightSkeleton key={i} />
              ))
            ) : listingCards.length > 0 ? (
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
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-[#6B7280]">
                Объявления скоро появятся
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ПОЧЕМУ LOCUS — 3 преимущества (с subtle background)
          По ТЗ v3: Option B — premium purple radial
          ═══════════════════════════════════════════════════════════════ */}
      <section 
        className="py-10 md:py-14 border-t border-gray-100"
        style={{ background: 'radial-gradient(1200px 600px at 50% 0%, rgba(124,58,237,0.04), transparent 60%)' }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-2">
              Почему LOCUS
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-[15px]">
              Помогаем принимать правильные решения при аренде жилья
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {/* Анализ цен */}
            <div className="text-center p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80">
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-1.5">Анализ цен</h3>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Сравниваем стоимость с рынком и показываем, выгодная ли цена
              </p>
            </div>

            {/* Проверка рисков */}
            <div className="text-center p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-1.5">Проверка качества</h3>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Оцениваем объявления и предупреждаем о возможных рисках
              </p>
            </div>

            {/* Персональный подбор — REAL ESTATE LANGUAGE */}
            <div className="text-center p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-1.5">Рекомендации для вас</h3>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Учитываем ваши предпочтения и показываем подходящие варианты первыми
              </p>
            </div>
          </div>
        </div>
      </section>

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
        <div className="max-w-6xl mx-auto px-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
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
              <p className="text-[32px] md:text-[40px] font-bold text-white mb-1">50+</p>
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
                  href="/owner/dashboard"
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-[14px]',
                    'bg-violet-600 text-white font-semibold text-[15px]',
                    'hover:bg-violet-500 active:bg-violet-700',
                    'transition-all duration-200',
                    'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
                    'hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)]',
                    'hover:-translate-y-0.5',
                    'whitespace-nowrap'
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

      {/* ═══════════════════════════════════════════════════════════════
          AI FLOATING WIDGET — переход в поиск с параметрами
          ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-[14px]',
            'bg-violet-600 text-white font-semibold text-[14px]',
            'hover:bg-violet-500 active:bg-violet-700',
            'transition-all duration-200',
            'shadow-[0_8px_24px_rgba(124,58,237,0.4)]',
            'hover:shadow-[0_12px_32px_rgba(124,58,237,0.5)]',
            'hover:-translate-y-1'
          )}
          onClick={() => {
            // Переход на /search с активацией AI
            const params = new URLSearchParams()
            params.set('ai', 'true') // Активируем AI режим
            
            // Если есть параметры из формы, передаем их
            if (city) params.set('city', city)
            if (priceRange) {
              const [min, max] = priceRange.split('-')
              if (min) params.set('priceMin', min)
              if (max) params.set('priceMax', max)
            }
            if (propertyType) params.set('type', propertyType)
            if (rentPeriod === 'long') params.set('rooms', '1')
            params.set('sort', 'ai')
            
            // Если нет параметров, откроется AI-мастер
            router.push(`/search?${params.toString()}`)
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          Подобрать жильё с AI
        </button>
      </div>
    </div>
  )
}
