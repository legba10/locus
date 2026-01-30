'use client'

import { cn } from '@/shared/utils/cn'

type ReasonType = 'positive' | 'warning' | 'negative'

interface Reason {
  text: string
  type: ReasonType
}

interface ReasonListProps {
  reasons: Reason[]
  maxItems?: number
  className?: string
}

const typeConfig: Record<ReasonType, { icon: string; color: string; bg: string }> = {
  positive: { icon: '✓', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  warning: { icon: '⚠', color: 'text-amber-700', bg: 'bg-amber-50' },
  negative: { icon: '✕', color: 'text-red-700', bg: 'bg-red-50' },
}

/**
 * ReasonList — список причин с AI semantic colors
 * 
 * Max 3 reasons
 * Icons: ✓ ⚠ ✕
 */
export function ReasonList({ reasons, maxItems = 3, className }: ReasonListProps) {
  const displayReasons = reasons.slice(0, maxItems)

  if (displayReasons.length === 0) return null

  return (
    <div className={cn('space-y-1.5', className)}>
      {displayReasons.map((reason, i) => {
        const config = typeConfig[reason.type]
        return (
          <div
            key={i}
            className={cn('flex items-center gap-2 px-2 py-1 rounded-md text-sm', config.bg, config.color)}
          >
            <span className="font-bold">{config.icon}</span>
            <span>{reason.text}</span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Determine reason type based on text content
 */
function getReasonType(text: string): ReasonType {
  const lower = text.toLowerCase()
  
  // Positive indicators
  if (
    lower.includes('ниже рынка') ||
    lower.includes('высокий спрос') ||
    lower.includes('низкий риск') ||
    lower.includes('качественн') ||
    lower.includes('отличн') ||
    lower.includes('хорош') ||
    lower.includes('удобн') ||
    lower.includes('популярн')
  ) {
    return 'positive'
  }
  
  // Negative/Warning indicators
  if (
    lower.includes('выше рынка') ||
    lower.includes('низкий спрос') ||
    lower.includes('высокий риск') ||
    lower.includes('требует') ||
    lower.includes('недостат') ||
    lower.includes('риск')
  ) {
    return 'warning'
  }
  
  return 'positive'
}

/**
 * Helper to create reasons from decision data
 * 
 * Note: priceDiff < 0 means price is BELOW market (good)
 *       priceDiff > 0 means price is ABOVE market (warning)
 */
export function createReasonsFromDecision(decision: {
  reasons?: string[]
  risks?: string[]
  priceDiff?: number
  demandLevel?: 'low' | 'medium' | 'high'
}): Reason[] {
  const reasons: Reason[] = []

  // Price reasons
  // priceDiff = (currentPrice - marketPrice) / marketPrice * 100
  // So negative = below market, positive = above market
  if (decision.priceDiff !== undefined && Math.abs(decision.priceDiff) > 3) {
    if (decision.priceDiff < 0) {
      reasons.push({ text: `Цена ниже рынка на ${Math.abs(Math.round(decision.priceDiff))}%`, type: 'positive' })
    } else {
      reasons.push({ text: `Цена выше рынка на ${Math.round(decision.priceDiff)}%`, type: 'warning' })
    }
  }

  // Demand reasons
  if (decision.demandLevel === 'high') {
    reasons.push({ text: 'Высокий спрос', type: 'positive' })
  } else if (decision.demandLevel === 'low') {
    reasons.push({ text: 'Низкий спрос', type: 'warning' })
  }

  // General reasons (auto-detect type from text)
  if (decision.reasons) {
    decision.reasons.forEach(r => {
      // Skip if already added via price/demand
      const lower = r.toLowerCase()
      if (lower.includes('цена') && (lower.includes('выше') || lower.includes('ниже'))) return
      if (lower.includes('спрос') && (lower.includes('высокий') || lower.includes('низкий'))) return
      
      reasons.push({ text: r, type: getReasonType(r) })
    })
  }

  // Risks
  if (decision.risks) {
    decision.risks.forEach(r => {
      reasons.push({ text: r, type: 'warning' })
    })
  }

  return reasons
}
