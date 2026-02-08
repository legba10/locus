/**
 * LOCUS Russian Product Dictionary
 * 
 * ❗ ПРАВИЛО: UI НЕ может использовать текст напрямую — только через RU словарь.
 * 
 * Запрещено в интерфейсе:
 * ❌ score, insight, decision, relevance, demand, AI score, host, guest
 * 
 * Разрешено:
 * ✅ оценка, анализ, подходит/не подходит, спрос, владелец, гость
 */

export const RU = {
  // ═══════════════════════════════════════════════════════════════
  // ВЕРДИКТЫ (главный элемент карточки)
  // ═══════════════════════════════════════════════════════════════
  verdict: {
    excellent: 'Отличный вариант',
    good: 'Хороший вариант',
    average: 'Средний вариант',
    bad: 'Не лучший выбор',
    risky: 'Есть риски',
    unknown: 'Оценка формируется',
  },

  // Короткие вердикты для карточек
  verdictShort: {
    excellent: 'Отличный',
    good: 'Хороший',
    average: 'Средний',
    bad: 'Не лучший',
    risky: 'С рисками',
    unknown: 'Оценивается',
  },

  // ═══════════════════════════════════════════════════════════════
  // ПРИЧИНЫ (почему подходит / не подходит)
  // ═══════════════════════════════════════════════════════════════
  reason: {
    // Цена
    price_below_market: 'Цена ниже рынка',
    price_below_market_pct: (pct: number) => `Цена ниже рынка на ${pct}%`,
    price_at_market: 'Цена по рынку',
    price_above_market: 'Цена выше рынка',
    price_above_market_pct: (pct: number) => `Цена выше рынка на ${pct}%`,
    price_good_value: 'Выгодная цена',
    
    // Спрос
    demand_high: 'Высокий спрос',
    demand_medium: 'Средний спрос',
    demand_low: 'Низкий спрос',
    
    // Локация
    location_good: 'Удобный район',
    location_central: 'Центральный район',
    location_quiet: 'Тихий район',
    location_near_metro: 'Рядом с метро',
    
    // Риск
    risk_low: 'Низкий риск',
    risk_medium: 'Есть небольшие риски',
    risk_high: 'Повышенный риск',
    
    // Качество
    quality_high: 'Качественное объявление',
    quality_good_photos: 'Хорошие фотографии',
    quality_detailed_desc: 'Подробное описание',
    quality_few_photos: 'Мало фотографий',
    quality_short_desc: 'Короткое описание',
    
    // Персонализация
    fits_budget: 'Подходит под ваш бюджет',
    fits_location: 'Район подходит под ваши условия',
    fits_search: 'Соответствует вашему поиску',
    matches_history: 'Похоже на то, что вы смотрели',
  },

  // ═══════════════════════════════════════════════════════════════
  // РЕКОМЕНДАЦИИ (что делать)
  // ═══════════════════════════════════════════════════════════════
  recommendation: {
    book_now: 'Рекомендуем бронировать',
    book_soon: 'Лучше бронировать скорее',
    consider: 'Можно рассмотреть',
    compare: 'Сравните с другими вариантами',
    wait: 'Лучше подождать',
    not_recommended: 'Не рекомендуем',
  },

  // ═══════════════════════════════════════════════════════════════
  // ДЕЙСТВИЯ (кнопки)
  // ═══════════════════════════════════════════════════════════════
  action: {
    view_analysis: 'Почему подходит',
    view_details: 'Подробнее',
    book: 'Забронировать',
    save: 'Сохранить',
    compare: 'Сравнить',
    contact_owner: 'Связаться с владельцем',
    show_on_map: 'На карте',
  },

  // ═══════════════════════════════════════════════════════════════
  // БЛОКИ И ЗАГОЛОВКИ
  // ═══════════════════════════════════════════════════════════════
  block: {
    why_fits: 'Почему подходит',
    why_not_fits: 'Почему не подходит',
    locus_analysis: 'Анализ LOCUS',
    locus_recommends: 'LOCUS рекомендует',
    what_to_do: 'Что сделать',
    risks: 'Риски',
    for_you: 'Подходит именно вам',
    owner_view: 'Ваше объявление глазами LOCUS',
    potential_income: 'Потенциал дохода',
  },

  // ═══════════════════════════════════════════════════════════════
  // ПОИСК И ФИЛЬТРЫ
  // ═══════════════════════════════════════════════════════════════
  search: {
    title: 'Найти жильё',
    placeholder: 'Город, район или адрес',
    sort_best_fit: 'Лучше всего подходит вам',
    sort_price_asc: 'Сначала дешевле',
    sort_price_desc: 'Сначала дороже',
    sort_newest: 'Сначала новые',
    filter_only_good: 'Показывать только подходящие',
    filter_with_analysis: 'Только с анализом LOCUS',
    results_count: (n: number) => `${n} ${n === 1 ? 'вариант' : n < 5 ? 'варианта' : 'вариантов'}`,
    no_results: 'Ничего не нашлось',
    try_different: 'Попробуйте изменить параметры поиска',
  },

  // ═══════════════════════════════════════════════════════════════
  // КАБИНЕТ ВЛАДЕЛЬЦА
  // ═══════════════════════════════════════════════════════════════
  owner: {
    dashboard_title: 'Кабинет владельца',
    your_listings: 'Ваши объявления',
    current_income: 'Доход сейчас',
    potential_income: 'Потенциальный доход',
    growth_potential: 'Потенциал роста',
    what_to_improve: 'Что улучшить',
    add_photos: 'Добавить фото',
    lower_price: 'Снизить цену',
    improve_description: 'Улучшить описание',
    listing_view: 'Как видят гости',
  },

  // ═══════════════════════════════════════════════════════════════
  // ОБЩИЕ ТЕКСТЫ
  // ═══════════════════════════════════════════════════════════════
  common: {
    price_per_night: 'за ночь',
    price_per_month: 'в месяц',
    from: 'от',
    city: 'Город',
    district: 'Район',
    guests: 'Гости',
    rooms: 'Комнаты',
    beds: 'Спальни',
    bath: 'Санузел',
    amenities: 'Удобства',
    description: 'Описание',
    location: 'Расположение',
    owner: 'Владелец',
    guest: 'Пользователь',
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Повторить',
    back: 'Назад',
    close: 'Закрыть',
  },

  // ═══════════════════════════════════════════════════════════════
  // АВТОРИЗАЦИЯ
  // ═══════════════════════════════════════════════════════════════
  auth: {
    login: 'Войти',
    register: 'Создать аккаунт',
    logout: 'Выйти',
    email: 'Электронная почта',
    password: 'Пароль',
    confirm_password: 'Подтвердите пароль',
    forgot_password: 'Забыли пароль?',
    who_are_you: 'Кто вы?',
    i_rent: 'Ищу жильё',
    i_own: 'Сдаю жильё',
    login_required: 'Войдите в аккаунт',
    login_to_continue: 'Чтобы продолжить, войдите в аккаунт',
    already_have_account: 'Уже есть аккаунт?',
    no_account: 'Нет аккаунта?',
    create_account: 'Создать аккаунт',
  },

  // ═══════════════════════════════════════════════════════════════
  // ЦЕНА
  // ═══════════════════════════════════════════════════════════════
  price: {
    currency: '₽',
    per_night: '/ ночь',
    per_month: '/ мес',
    total: 'Итого',
    undefined: 'Цена уточняется',
  },

  // ═══════════════════════════════════════════════════════════════
  // СПРОС
  // ═══════════════════════════════════════════════════════════════
  demand: {
    high: 'Высокий спрос',
    medium: 'Средний спрос',
    low: 'Низкий спрос',
    hot: 'Горячее предложение',
  },

  // ═══════════════════════════════════════════════════════════════
  // ОШИБКИ И ПУСТЫЕ СОСТОЯНИЯ
  // ═══════════════════════════════════════════════════════════════
  empty: {
    no_listings: 'Пока нет объявлений',
    no_favorites: 'Нет сохранённых',
    no_bookings: 'Нет бронирований',
    analysis_pending: 'Анализ формируется — недостаточно данных',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// УДОБСТВА (ключ API → русский текст для карточек и списков)
// Никогда не выводить raw key в UI.
// ═══════════════════════════════════════════════════════════════
export const AMENITIES_MAP: Record<string, string> = {
  wifi: 'Wi-Fi',
  washer: 'Стиральная машина',
  balcony: 'Балкон',
  parking: 'Парковка',
  air_conditioner: 'Кондиционер',
  airconditioner: 'Кондиционер',
  kitchen: 'Кухня',
  tv: 'ТВ',
  elevator: 'Лифт',
  dishwasher: 'Посудомоечная машина',
  dryer: 'Сушка',
  heating: 'Отопление',
  gym: 'Спортзал',
  pool: 'Бассейн',
  pets: 'Можно с питомцами',
  smoking: 'Можно курить',
}

/** Нормализует ключ удобства (API) и возвращает русскую подпись. */
export function amenityLabel(key: string | undefined | null): string {
  if (key == null || key === '') return ''
  const k = String(key).toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
  return AMENITIES_MAP[k] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Извлекает ключи удобств из ответа API (string[] или Array<{amenity: {key?}}>) для логики/ai-engine. */
export function amenityKeysFromApi(amenities: unknown): string[] {
  if (!Array.isArray(amenities)) return []
  return amenities
    .map((x: unknown) => (typeof x === 'string' ? x : (x as { amenity?: { key?: string } })?.amenity?.key))
    .filter((k): k is string => typeof k === 'string' && k !== '')
}

/**
 * Приводит сырой ответ API (string[] или Array<{listingId, amenityId, amenity}>) к массиву русских подписей.
 * Использовать перед рендером, чтобы не передавать в React объекты (React error #31).
 */
export function amenitiesToLabels(amenities: unknown): string[] {
  if (!Array.isArray(amenities)) return []
  const out: string[] = []
  for (const x of amenities) {
    if (typeof x === 'string') {
      const label = amenityLabel(x)
      if (label) out.push(label)
    } else if (x && typeof x === 'object' && 'amenity' in x) {
      const a = (x as { amenity?: { key?: string; label?: string } }).amenity
      const key = a?.key ?? a?.label
      const label = key ? amenityLabel(key) : (a?.label ?? '')
      if (label) out.push(label)
    }
  }
  return out
}

// ═══════════════════════════════════════════════════════════════
// ТИПЫ
// ═══════════════════════════════════════════════════════════════

export type VerdictType = 'excellent' | 'good' | 'average' | 'bad' | 'risky' | 'unknown'
export type ReasonType = 'positive' | 'neutral' | 'negative'
export type DemandLevel = 'low' | 'medium' | 'high'

// ═══════════════════════════════════════════════════════════════
// ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════════════════

/**
 * Получить вердикт по числовой оценке
 */
export function getVerdictFromScore(score: number): VerdictType {
  if (score >= 80) return 'excellent'
  if (score >= 65) return 'good'
  if (score >= 50) return 'average'
  if (score >= 30) return 'bad'
  if (score > 0) return 'risky'
  return 'unknown'
}

/**
 * Получить текст вердикта
 */
export function getVerdictText(score: number): string {
  const type = getVerdictFromScore(score)
  return RU.verdict[type]
}

/**
 * Форматировать цену
 */
export function formatPrice(amount: number, period: 'night' | 'month' = 'month'): string {
  if (amount === 0) return RU.price.undefined
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
  const suffix = period === 'night' ? RU.price.per_night : RU.price.per_month
  return `${formatted} ${RU.price.currency} ${suffix}`
}

/**
 * Получить текст спроса
 */
export function getDemandText(level: DemandLevel): string {
  return RU.demand[level]
}

/**
 * Получить текст причины по ценовому отклонению
 */
export function getPriceReasonText(priceDiff: number): string {
  if (priceDiff < -10) return RU.reason.price_below_market_pct(Math.abs(Math.round(priceDiff)))
  if (priceDiff < -3) return RU.reason.price_below_market
  if (priceDiff > 10) return RU.reason.price_above_market_pct(Math.round(priceDiff))
  if (priceDiff > 3) return RU.reason.price_above_market
  return RU.reason.price_at_market
}

/**
 * Получить тип причины (positive/neutral/negative)
 */
export function getReasonTypeFromText(text: string): ReasonType {
  const lower = text.toLowerCase()
  
  // Положительные
  if (
    lower.includes('ниже рынка') ||
    lower.includes('высокий спрос') ||
    lower.includes('низкий риск') ||
    lower.includes('удобн') ||
    lower.includes('хорош') ||
    lower.includes('отличн') ||
    lower.includes('качеств') ||
    lower.includes('подходит')
  ) {
    return 'positive'
  }
  
  // Отрицательные
  if (
    lower.includes('выше рынка') ||
    lower.includes('высокий риск') ||
    lower.includes('не подходит') ||
    lower.includes('не рекомендуем') ||
    lower.includes('мало фото') ||
    lower.includes('короткое описание')
  ) {
    return 'negative'
  }
  
  return 'neutral'
}
