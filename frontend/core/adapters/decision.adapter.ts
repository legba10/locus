/**
 * Decision Data Adapter
 * 
 * Нормализация AI-решений для UI
 */

export interface RawDecision {
  matchScore?: number
  score?: number
  verdict?: string
  reasons?: string[]
  pros?: string[]
  risks?: string[]
  priceDiff?: number
  priceDiffPercent?: number
  demandLevel?: 'low' | 'medium' | 'high' | string
  recommendation?: string
  mainAdvice?: string
  tip?: string
  [key: string]: any
}

export interface NormalizedDecision {
  score: number
  verdict: string
  reasons: string[]
  risks: string[]
  priceDiff: number
  demandLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

const VERDICT_MAP: Record<number, string> = {
  80: 'Отличный вариант',
  60: 'Хороший вариант',
  40: 'Сомнительно',
  0: 'Не рекомендуем',
}

function getVerdictFromScore(score: number): string {
  if (score >= 80) return VERDICT_MAP[80]
  if (score >= 60) return VERDICT_MAP[60]
  if (score >= 40) return VERDICT_MAP[40]
  return VERDICT_MAP[0]
}

function normalizeDemandLevel(level: any): 'low' | 'medium' | 'high' {
  if (typeof level === 'string') {
    const lower = level.toLowerCase()
    if (lower === 'low' || lower === 'низкий') return 'low'
    if (lower === 'high' || lower === 'высокий') return 'high'
  }
  return 'medium'
}

/**
 * Normalize decision data
 */
export function normalizeDecision(raw: RawDecision | null | undefined): NormalizedDecision {
  if (!raw) {
    return {
      score: 0,
      verdict: 'Нет оценки',
      reasons: [],
      risks: [],
      priceDiff: 0,
      demandLevel: 'medium',
      recommendation: '',
    }
  }

  const score = raw.matchScore ?? raw.score ?? 0
  const reasons = raw.reasons ?? raw.pros ?? []
  const risks = raw.risks ?? []
  const priceDiff = raw.priceDiffPercent ?? raw.priceDiff ?? 0
  const recommendation = raw.recommendation ?? raw.mainAdvice ?? raw.tip ?? ''

  return {
    score: Math.max(0, Math.min(100, score)),
    verdict: raw.verdict || getVerdictFromScore(score),
    reasons: Array.isArray(reasons) ? reasons.slice(0, 3) : [],
    risks: Array.isArray(risks) ? risks.slice(0, 2) : [],
    priceDiff,
    demandLevel: normalizeDemandLevel(raw.demandLevel),
    recommendation: recommendation.substring(0, 120),
  }
}
