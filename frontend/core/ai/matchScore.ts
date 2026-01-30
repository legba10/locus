/**
 * Match Score Engine
 * 
 * Формула:
 * matchScore = priceScore * 0.4 + locationScore * 0.3 + demandScore * 0.2 + qualityScore * 0.1
 * 
 * Пользователь НЕ видит формулу.
 * Он видит: "Почему подходит: ✓ Цена ниже рынка ✓ Удобный район"
 */

export interface MatchScoreInput {
  price: number
  marketPrice?: number
  userPriceMax?: number
  city: string
  userPreferredCities?: string[]
  userSearchHistory?: string[]
  demandLevel?: 'low' | 'medium' | 'high'
  qualityScore?: number
  photoCount?: number
  descriptionLength?: number
}

export interface MatchScoreResult {
  matchScore: number
  priceScore: number
  locationScore: number
  demandScore: number
  qualityScore: number
  verdict: 'excellent' | 'good' | 'neutral' | 'poor'
  reasons: string[]
}

const VERDICT_THRESHOLDS = {
  excellent: 80,
  good: 60,
  neutral: 40,
  poor: 0,
}

/**
 * Calculate price score (0-100)
 */
function calculatePriceScore(input: MatchScoreInput): number {
  const { price, marketPrice, userPriceMax } = input
  
  let score = 50 // Base
  
  // Price vs market
  if (marketPrice) {
    const diff = ((marketPrice - price) / marketPrice) * 100
    score += diff * 0.5 // Bonus for below market
  }
  
  // User budget check
  if (userPriceMax) {
    if (price > userPriceMax) {
      score -= 30 // Over budget penalty
    } else if (price <= userPriceMax * 0.8) {
      score += 15 // Well within budget
    }
  }
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate location score (0-100)
 */
function calculateLocationScore(input: MatchScoreInput): number {
  const { city, userPreferredCities, userSearchHistory } = input
  
  let score = 50 // Base
  
  if (userPreferredCities?.includes(city)) {
    score += 40
  }
  
  if (userSearchHistory?.includes(city)) {
    score += 20
  }
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate demand score (0-100)
 */
function calculateDemandScore(input: MatchScoreInput): number {
  const demandMap: Record<string, number> = {
    high: 85,
    medium: 60,
    low: 35,
  }
  
  return demandMap[input.demandLevel || 'medium'] || 50
}

/**
 * Calculate quality score (0-100)
 */
function calculateQualityScore(input: MatchScoreInput): number {
  let score = input.qualityScore || 50
  
  // Photo bonus
  if (input.photoCount && input.photoCount >= 5) {
    score += 10
  } else if (!input.photoCount || input.photoCount < 3) {
    score -= 15
  }
  
  // Description bonus
  if (input.descriptionLength && input.descriptionLength >= 200) {
    score += 5
  }
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Generate human-readable reasons
 */
function generateReasons(input: MatchScoreInput, scores: Omit<MatchScoreResult, 'reasons'>): string[] {
  const reasons: string[] = []
  
  // Price reasons
  if (input.marketPrice && input.price < input.marketPrice) {
    const diff = Math.round(((input.marketPrice - input.price) / input.marketPrice) * 100)
    reasons.push(`Цена ниже рынка на ${diff}%`)
  }
  
  if (input.userPriceMax && input.price <= input.userPriceMax) {
    reasons.push('Вписывается в бюджет')
  }
  
  // Location reasons
  if (input.userPreferredCities?.includes(input.city)) {
    reasons.push('В нужном районе')
  }
  
  // Demand reasons
  if (input.demandLevel === 'high') {
    reasons.push('Высокий спрос')
  }
  
  // Quality reasons
  if (input.photoCount && input.photoCount >= 5) {
    reasons.push('Хорошие фото')
  }
  
  return reasons.slice(0, 3) // Max 3
}

/**
 * Get verdict from score
 */
function getVerdict(score: number): MatchScoreResult['verdict'] {
  if (score >= VERDICT_THRESHOLDS.excellent) return 'excellent'
  if (score >= VERDICT_THRESHOLDS.good) return 'good'
  if (score >= VERDICT_THRESHOLDS.neutral) return 'neutral'
  return 'poor'
}

/**
 * Calculate match score
 */
export function calculateMatchScore(input: MatchScoreInput): MatchScoreResult {
  const priceScore = calculatePriceScore(input)
  const locationScore = calculateLocationScore(input)
  const demandScore = calculateDemandScore(input)
  const qualityScore = calculateQualityScore(input)
  
  const matchScore = Math.round(
    priceScore * 0.4 +
    locationScore * 0.3 +
    demandScore * 0.2 +
    qualityScore * 0.1
  )
  
  const verdict = getVerdict(matchScore)
  
  const result: Omit<MatchScoreResult, 'reasons'> = {
    matchScore,
    priceScore,
    locationScore,
    demandScore,
    qualityScore,
    verdict,
  }
  
  const reasons = generateReasons(input, result)
  
  return {
    ...result,
    reasons,
  }
}
