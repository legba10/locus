/**
 * LOCUS Decision Types — frontend mirror of backend
 */

export type Verdict = 'fits' | 'neutral' | 'not_fits'
export type PriceSignal = 'below_market' | 'market' | 'above_market'
export type DemandSignal = 'low' | 'medium' | 'high'

/**
 * Core decision interface
 * 
 * RULES:
 * - reasons.length <= 3
 * - mainAdvice.length <= 120 chars
 */
export interface LocusDecisionCore {
  matchScore: number
  verdict: Verdict
  reasons: string[]
  priceSignal: PriceSignal
  demandSignal: DemandSignal
  mainAdvice: string
}

// Labels (Russian)
export const VERDICT_LABELS: Record<Verdict, string> = {
  fits: 'Подходит',
  neutral: 'Нормально',
  not_fits: 'Не подходит',
}

export const PRICE_LABELS: Record<PriceSignal, string> = {
  below_market: 'Цена ниже рынка',
  market: 'Цена по рынку',
  above_market: 'Цена выше рынка',
}

export const DEMAND_LABELS: Record<DemandSignal, string> = {
  low: 'Низкий спрос',
  medium: 'Средний спрос',
  high: 'Высокий спрос',
}

// Colors
export function getVerdictColor(verdict: Verdict) {
  switch (verdict) {
    case 'fits':
      return { bg: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-50', lightText: 'text-emerald-700' }
    case 'neutral':
      return { bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-50', lightText: 'text-blue-700' }
    case 'not_fits':
      return { bg: 'bg-gray-400', text: 'text-white', light: 'bg-gray-50', lightText: 'text-gray-600' }
  }
}

export function getPriceColor(signal: PriceSignal) {
  switch (signal) {
    case 'below_market':
      return 'text-emerald-600'
    case 'market':
      return 'text-gray-600'
    case 'above_market':
      return 'text-amber-600'
  }
}
