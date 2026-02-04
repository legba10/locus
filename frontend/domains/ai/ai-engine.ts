import { CITY_MARKET_PRICE } from "@/shared/data/cities"

/**
 * AI Engine — модуль для расчета AI-рекомендаций
 * 
 * Функции:
 * - scoring(listing, userParams)
 * - marketPriceCompare(listing)
 * - priorityMatch(listing, userParams)
 * - explanationGenerator(listing)
 */

export interface Listing {
  id: string
  city: string
  basePrice: number
  type: string
  bedrooms?: number
  area?: number
  views?: number
  rating?: number
  amenities?: string[]
  description?: string
}

export interface UserParams {
  city?: string
  priceMin?: number
  priceMax?: number
  type?: string
  rooms?: number
  priorities?: {
    price: boolean
    location: boolean
    infrastructure: boolean
    safety: boolean
    rating: boolean
  }
}

export interface AiScore {
  score: number // 0-100
  reasons: string[]
  priceAnalysis: {
    status: 'below' | 'average' | 'above'
    percent: number
  }
  pros: string[]
  risks: string[]
}

/**
 * Основная функция scoring — рассчитывает AI-рейтинг объявления
 */
export function scoring(listing: Listing, userParams: UserParams): AiScore {
  let score = 0
  const reasons: string[] = []
  const pros: string[] = []
  const risks: string[] = []

  // 1. Город (30%)
  if (userParams.city && listing.city?.toLowerCase() === userParams.city.toLowerCase()) {
    score += 30
    reasons.push('Подходит по городу')
  }

  // 2. Бюджет (30%)
  if (userParams.priceMax && listing.basePrice <= userParams.priceMax) {
    const budgetMatch = (1 - (listing.basePrice / userParams.priceMax)) * 30
    score += budgetMatch
    if (budgetMatch > 20) {
      reasons.push('Вписывается в бюджет')
      pros.push('Выгодная цена')
    }
  } else if (userParams.priceMax && listing.basePrice > userParams.priceMax) {
    risks.push('Цена выше вашего бюджета')
  }

  // 3. Тип жилья (20%)
  if (userParams.type && listing.type === userParams.type) {
    score += 20
    reasons.push('Подходит по типу жилья')
  }

  // 4. Комнаты (10%)
  if (userParams.rooms && listing.bedrooms === userParams.rooms) {
    score += 10
    reasons.push('Подходит по количеству комнат')
  }

  // 5. Популярность (10%)
  const popularity = Math.min(10, (listing.views || 0) / 100)
  score += popularity
  if (popularity > 5) {
    reasons.push('Популярное объявление')
  }

  // 6. Приоритеты пользователя
  if (userParams.priorities) {
    // Цена
    if (userParams.priorities.price) {
      const priceAnalysis = marketPriceCompare(listing)
      if (priceAnalysis.status === 'below') {
        score += 5
        pros.push('Цена ниже рынка')
      }
    }

    // Рейтинг
    if (userParams.priorities.rating && listing.rating) {
      if (listing.rating >= 4.5) {
        score += 5
        pros.push('Высокий рейтинг')
      } else if (listing.rating < 3.5) {
        risks.push('Низкий рейтинг')
      }
    }

    // Инфраструктура
    if (userParams.priorities.infrastructure) {
      const hasInfra = listing.amenities?.some(a => 
        ['Wi-Fi', 'Парковка', 'Лифт', 'Кондиционер'].includes(a)
      )
      if (hasInfra) {
        score += 3
        pros.push('Хорошая инфраструктура')
      }
    }
  }

  // Нормализуем score до 0-100
  score = Math.min(100, Math.max(0, score))

  // Анализ цены
  const priceAnalysis = marketPriceCompare(listing)

  return {
    score: Math.round(score),
    reasons: reasons.slice(0, 3),
    priceAnalysis,
    pros: pros.slice(0, 3),
    risks: risks.slice(0, 2),
  }
}

/**
 * Сравнение цены с рынком
 */
export function marketPriceCompare(listing: Listing): { status: 'below' | 'average' | 'above'; percent: number } {
  const city = listing.city || 'Москва'
  const marketAvg = CITY_MARKET_PRICE[city] || 30000
  const diff = ((listing.basePrice - marketAvg) / marketAvg) * 100

  if (diff < -10) {
    return { status: 'below', percent: Math.abs(diff) }
  } else if (diff > 10) {
    return { status: 'above', percent: diff }
  } else {
    return { status: 'average', percent: 0 }
  }
}

/**
 * Проверка соответствия приоритетам пользователя
 */
export function priorityMatch(listing: Listing, userParams: UserParams): string[] {
  const matches: string[] = []

  if (!userParams.priorities) return matches

  // Цена
  if (userParams.priorities.price) {
    const priceAnalysis = marketPriceCompare(listing)
    if (priceAnalysis.status === 'below') {
      matches.push('Выгодная цена')
    }
  }

  // Расположение
  if (userParams.priorities.location) {
    // Проверяем описание на наличие упоминаний о локации
    const locationKeywords = ['метро', 'центр', 'рядом', 'район']
    const hasLocation = locationKeywords.some(keyword => 
      listing.description?.toLowerCase().includes(keyword)
    )
    if (hasLocation) {
      matches.push('Хорошая локация')
    }
  }

  // Инфраструктура
  if (userParams.priorities.infrastructure) {
    const infraCount = listing.amenities?.filter(a => 
      ['Wi-Fi', 'Парковка', 'Лифт', 'Кондиционер', 'Балкон'].includes(a)
    ).length || 0
    if (infraCount >= 3) {
      matches.push('Хорошая инфраструктура')
    }
  }

  // Безопасность
  if (userParams.priorities.safety) {
    const safetyKeywords = ['охрана', 'домофон', 'безопасно']
    const hasSafety = safetyKeywords.some(keyword => 
      listing.description?.toLowerCase().includes(keyword)
    )
    if (hasSafety) {
      matches.push('Безопасный район')
    }
  }

  // Рейтинг
  if (userParams.priorities.rating && listing.rating && listing.rating >= 4.5) {
    matches.push('Высокий рейтинг')
  }

  return matches
}

/**
 * Генератор объяснений для объявления
 */
export function explanationGenerator(listing: Listing, userParams: UserParams): string[] {
  const explanations: string[] = []
  const score = scoring(listing, userParams)

  // Анализ цены
  if (score.priceAnalysis.status === 'below') {
    explanations.push(`Цена ниже рынка на ${score.priceAnalysis.percent.toFixed(0)}%`)
  } else if (score.priceAnalysis.status === 'above') {
    explanations.push(`Цена выше рынка на ${score.priceAnalysis.percent.toFixed(0)}%`)
  }

  // Бюджет
  if (userParams.priceMax && listing.basePrice <= userParams.priceMax) {
    explanations.push('Подходит под ваш бюджет')
  }

  // Популярность
  if (listing.views && listing.views > 500) {
    explanations.push('Высокий спрос в районе')
  }

  // Рейтинг
  if (listing.rating && listing.rating >= 4.5) {
    explanations.push('Высокий рейтинг от гостей')
  }

  return explanations.slice(0, 3)
}
