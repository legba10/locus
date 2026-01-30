/**
 * LOCUS Decision Core — unified decision model
 * 
 * Target: User understands if listing fits them in < 3 seconds
 */

export type Verdict = 'fits' | 'neutral' | 'not_fits';
export type PriceSignal = 'below_market' | 'market' | 'above_market';
export type DemandSignal = 'low' | 'medium' | 'high';

/**
 * Core decision interface — single source of truth
 * 
 * RULES:
 * - reasons.length <= 3
 * - mainAdvice.length <= 120 chars
 */
export interface LocusDecisionCore {
  /** Match score 0-100 */
  matchScore: number;
  
  /** Human verdict */
  verdict: Verdict;
  
  /** Max 3 reasons */
  reasons: string[];
  
  /** Price position */
  priceSignal: PriceSignal;
  
  /** Demand level */
  demandSignal: DemandSignal;
  
  /** Single advice line (max 120 chars) */
  mainAdvice: string;
}

/**
 * User context for personalized decisions
 */
export interface UserContext {
  /** Target price range */
  priceMin?: number;
  priceMax?: number;
  
  /** Preferred cities */
  preferredCities?: string[];
  
  /** Number of guests */
  guests?: number;
  
  /** Search history cities */
  searchHistory?: string[];
}

/**
 * Listing data for decision
 */
export interface ListingForDecision {
  id: string;
  title: string;
  price: number;
  city: string;
  rooms?: number;
  beds?: number;
  
  /** Market average price for comparison */
  marketPrice?: number;
  
  /** Demand level from analytics */
  demandLevel?: DemandSignal;
  
  /** Quality score from AI */
  qualityScore?: number;
  
  /** Photo count */
  photoCount?: number;
  
  /** Description length */
  descriptionLength?: number;
}

// Verdict labels (Russian)
export const VERDICT_LABELS: Record<Verdict, string> = {
  fits: 'Подходит',
  neutral: 'Нормально',
  not_fits: 'Не подходит',
};

// Price signal labels
export const PRICE_LABELS: Record<PriceSignal, string> = {
  below_market: 'Цена ниже рынка',
  market: 'Цена по рынку',
  above_market: 'Цена выше рынка',
};

// Demand signal labels
export const DEMAND_LABELS: Record<DemandSignal, string> = {
  low: 'Низкий спрос',
  medium: 'Средний спрос',
  high: 'Высокий спрос',
};

/**
 * Validate decision core
 */
export function validateDecision(decision: LocusDecisionCore): boolean {
  if (decision.reasons.length > 3) {
    console.warn('Decision has more than 3 reasons');
    return false;
  }
  
  if (decision.mainAdvice.length > 120) {
    console.warn('mainAdvice exceeds 120 chars');
    return false;
  }
  
  if (decision.matchScore < 0 || decision.matchScore > 100) {
    console.warn('matchScore out of range');
    return false;
  }
  
  return true;
}
