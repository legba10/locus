/**
 * LOCUS Decision Engine
 * 
 * Generates personalized decisions for listings
 * 
 * Formula:
 * matchScore = priceScore*0.4 + locationScore*0.3 + demandScore*0.2 + qualityScore*0.1
 * 
 * Verdict mapping:
 * score >= 75 -> fits
 * score >= 50 -> neutral
 * score < 50 -> not_fits
 */

import {
  LocusDecisionCore,
  UserContext,
  ListingForDecision,
  Verdict,
  PriceSignal,
  DemandSignal,
  PRICE_LABELS,
  validateDecision,
} from './locusDecisionCore';

/**
 * Calculate price score (0-100)
 */
function calculatePriceScore(listing: ListingForDecision, context: UserContext): number {
  const price = listing.price;
  const marketPrice = listing.marketPrice || price;
  
  // Price vs market
  const marketDiff = ((marketPrice - price) / marketPrice) * 100;
  let score = 50 + marketDiff; // Base 50, adjust by market diff
  
  // Check user budget
  if (context.priceMax && price > context.priceMax) {
    score -= 30; // Over budget penalty
  } else if (context.priceMin && context.priceMax) {
    const mid = (context.priceMin + context.priceMax) / 2;
    if (price <= mid) {
      score += 15; // Within comfortable range
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate location score (0-100)
 */
function calculateLocationScore(listing: ListingForDecision, context: UserContext): number {
  let score = 50; // Base
  
  // Preferred city match
  if (context.preferredCities?.includes(listing.city)) {
    score += 40;
  }
  
  // Search history match
  if (context.searchHistory?.includes(listing.city)) {
    score += 20;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate demand score (0-100)
 */
function calculateDemandScore(listing: ListingForDecision): number {
  const demandMap: Record<DemandSignal, number> = {
    high: 85,
    medium: 60,
    low: 35,
  };
  
  return demandMap[listing.demandLevel || 'medium'];
}

/**
 * Calculate quality score (0-100)
 */
function calculateQualityScore(listing: ListingForDecision): number {
  let score = listing.qualityScore || 50;
  
  // Photo bonus
  if (listing.photoCount && listing.photoCount >= 5) {
    score += 10;
  } else if (!listing.photoCount || listing.photoCount < 3) {
    score -= 15;
  }
  
  // Description bonus
  if (listing.descriptionLength && listing.descriptionLength >= 200) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Determine price signal
 */
function getPriceSignal(listing: ListingForDecision): PriceSignal {
  if (!listing.marketPrice) return 'market';
  
  const diff = ((listing.marketPrice - listing.price) / listing.marketPrice) * 100;
  
  if (diff > 5) return 'below_market';
  if (diff < -5) return 'above_market';
  return 'market';
}

/**
 * Map score to verdict
 */
function getVerdict(score: number): Verdict {
  if (score >= 75) return 'fits';
  if (score >= 50) return 'neutral';
  return 'not_fits';
}

/**
 * Generate reasons (max 3)
 */
function generateReasons(
  listing: ListingForDecision,
  context: UserContext,
  priceSignal: PriceSignal,
  demandSignal: DemandSignal,
  verdict: Verdict
): string[] {
  const reasons: string[] = [];
  
  // Price reason
  if (priceSignal === 'below_market') {
    reasons.push('Цена ниже рынка');
  } else if (priceSignal === 'above_market' && verdict !== 'fits') {
    reasons.push('Цена выше среднего');
  }
  
  // Budget match
  if (context.priceMax && listing.price <= context.priceMax) {
    reasons.push('Вписывается в бюджет');
  }
  
  // Location match
  if (context.preferredCities?.includes(listing.city)) {
    reasons.push('В нужном районе');
  }
  
  // Demand
  if (demandSignal === 'high') {
    reasons.push('Высокий спрос');
  } else if (demandSignal === 'low' && verdict !== 'fits') {
    reasons.push('Низкий спрос');
  }
  
  // Guests match
  if (context.guests && listing.beds && listing.beds >= context.guests) {
    reasons.push(`Подходит для ${context.guests} гостей`);
  }
  
  // Quality
  if (listing.photoCount && listing.photoCount >= 5) {
    reasons.push('Хорошие фото');
  } else if (!listing.photoCount || listing.photoCount < 3) {
    reasons.push('Мало фото');
  }
  
  // Return max 3
  return reasons.slice(0, 3);
}

/**
 * Generate main advice (max 120 chars)
 */
function generateAdvice(
  listing: ListingForDecision,
  verdict: Verdict,
  priceSignal: PriceSignal,
  demandSignal: DemandSignal
): string {
  // Positive verdicts
  if (verdict === 'fits') {
    if (priceSignal === 'below_market' && demandSignal === 'high') {
      return 'Выгодное предложение — бронируйте быстрее';
    }
    if (priceSignal === 'below_market') {
      return 'Хорошая цена для этого района';
    }
    if (demandSignal === 'high') {
      return 'Популярный вариант — не затягивайте с решением';
    }
    return 'Хороший вариант для бронирования';
  }
  
  // Neutral verdicts
  if (verdict === 'neutral') {
    if (priceSignal === 'above_market') {
      return 'Сравните с похожими вариантами по цене';
    }
    return 'Изучите детали перед решением';
  }
  
  // Negative verdicts
  if (priceSignal === 'above_market') {
    return 'Есть варианты дешевле в этом районе';
  }
  return 'Рассмотрите другие варианты';
}

/**
 * Main decision generator
 */
export function generateDecision(
  listing: ListingForDecision,
  userContext: UserContext = {}
): LocusDecisionCore {
  // Calculate component scores
  const priceScore = calculatePriceScore(listing, userContext);
  const locationScore = calculateLocationScore(listing, userContext);
  const demandScore = calculateDemandScore(listing);
  const qualityScore = calculateQualityScore(listing);
  
  // Calculate match score
  const matchScore = Math.round(
    priceScore * 0.4 +
    locationScore * 0.3 +
    demandScore * 0.2 +
    qualityScore * 0.1
  );
  
  // Determine signals
  const priceSignal = getPriceSignal(listing);
  const demandSignal = listing.demandLevel || 'medium';
  const verdict = getVerdict(matchScore);
  
  // Generate content
  const reasons = generateReasons(listing, userContext, priceSignal, demandSignal, verdict);
  const mainAdvice = generateAdvice(listing, verdict, priceSignal, demandSignal);
  
  const decision: LocusDecisionCore = {
    matchScore,
    verdict,
    reasons,
    priceSignal,
    demandSignal,
    mainAdvice,
  };
  
  // Validate
  validateDecision(decision);
  
  return decision;
}

/**
 * Generate decisions for multiple listings
 */
export function generateDecisions(
  listings: ListingForDecision[],
  userContext: UserContext = {}
): Map<string, LocusDecisionCore> {
  const decisions = new Map<string, LocusDecisionCore>();
  
  for (const listing of listings) {
    decisions.set(listing.id, generateDecision(listing, userContext));
  }
  
  return decisions;
}

/**
 * Sort listings by match score
 */
export function sortByMatch(
  listings: ListingForDecision[],
  userContext: UserContext = {}
): ListingForDecision[] {
  const decisions = generateDecisions(listings, userContext);
  
  return [...listings].sort((a, b) => {
    const scoreA = decisions.get(a.id)?.matchScore || 0;
    const scoreB = decisions.get(b.id)?.matchScore || 0;
    return scoreB - scoreA;
  });
}
