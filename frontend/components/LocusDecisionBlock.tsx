'use client'

import { cn } from '@/shared/utils/cn'
import {
  LocusDecisionCore,
  Verdict,
  VERDICT_LABELS,
  PRICE_LABELS,
  getVerdictColor,
  getPriceColor,
} from '@/shared/types/decision'

interface LocusDecisionBlockProps {
  decision: LocusDecisionCore
  /** Show all details or compact */
  variant?: 'full' | 'compact' | 'mini'
  className?: string
}

/**
 * LocusDecisionBlock — main decision UI component
 * 
 * UI OUTPUT (STRICT):
 * 
 * [82] Fits
 * 
 * ✓ reason 1
 * ✓ reason 2
 * ⚠ reason 3
 * 
 * Advice: mainAdvice
 * 
 * CONSTRAINTS:
 * - max 3 reasons
 * - max 1 advice
 * - no technical terms
 */
export function LocusDecisionBlock({
  decision,
  variant = 'full',
  className,
}: LocusDecisionBlockProps) {
  const { matchScore, verdict, reasons, priceSignal, mainAdvice } = decision
  const verdictColor = getVerdictColor(verdict)
  const priceColor = getPriceColor(priceSignal)

  // Mini variant — just score and verdict
  if (variant === 'mini') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className={cn('rounded px-1.5 py-0.5 text-xs font-bold', verdictColor.bg, verdictColor.text)}>
          {matchScore}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {VERDICT_LABELS[verdict]}
        </span>
      </div>
    )
  }

  // Compact variant — score, verdict, price
  if (variant === 'compact') {
    return (
      <div className={cn('', className)}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('rounded-lg px-2 py-0.5 text-sm font-bold', verdictColor.bg, verdictColor.text)}>
            {matchScore}
          </span>
          <span className="font-medium text-gray-900">
            {VERDICT_LABELS[verdict]}
          </span>
        </div>
        <p className={cn('text-sm', priceColor)}>
          {PRICE_LABELS[priceSignal]}
        </p>
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-4', className)}>
      {/* Score + Verdict */}
      <div className="flex items-center gap-3 mb-3">
        <span className={cn('rounded-xl px-3 py-1.5 text-lg font-bold', verdictColor.bg, verdictColor.text)}>
          {matchScore}
        </span>
        <span className="text-xl font-semibold text-gray-900">
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {/* Reasons (max 3) */}
      {reasons.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {reasons.slice(0, 3).map((reason, i) => {
            // First 2 reasons are positive, 3rd might be warning
            const isWarning = i === 2 && verdict !== 'fits'
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={isWarning ? 'text-amber-500' : 'text-emerald-500'}>
                  {isWarning ? '⚠' : '✓'}
                </span>
                <span className="text-gray-700">{reason}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Price signal */}
      <div className={cn('text-sm mb-3', priceColor)}>
        {PRICE_LABELS[priceSignal]}
      </div>

      {/* Main advice */}
      {mainAdvice && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-blue-600">
            💡 {mainAdvice}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * LocusDecisionBadge — for ListingCard
 */
export function LocusDecisionBadge({
  score,
  verdict,
  className,
}: {
  score: number
  verdict: Verdict
  className?: string
}) {
  const color = getVerdictColor(verdict)
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('rounded-lg px-2 py-0.5 text-sm font-bold', color.bg, color.text)}>
        {score}
      </span>
      <span className="text-sm font-medium text-gray-800">
        {VERDICT_LABELS[verdict]}
      </span>
    </div>
  )
}

/**
 * WhyFitsBlock — personalized explanation
 */
export function WhyFitsBlock({
  reasons,
  className,
}: {
  reasons: string[]
  className?: string
}) {
  if (!reasons.length) return null
  
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-4', className)}>
      <h3 className="font-semibold text-gray-900 mb-2">Почему вам подходит</h3>
      <ul className="space-y-1.5">
        {reasons.slice(0, 3).map((reason, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-emerald-500">•</span>
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * RisksBlock — show risks (max 2)
 */
export function RisksBlock({
  risks,
  className,
}: {
  risks: string[]
  className?: string
}) {
  if (!risks.length) return null
  
  return (
    <div className={cn('rounded-xl border border-amber-100 bg-amber-50 p-4', className)}>
      <h3 className="font-semibold text-amber-900 mb-2">На что обратить внимание</h3>
      <ul className="space-y-1.5">
        {risks.slice(0, 2).map((risk, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-amber-800">
            <span>⚠</span>
            {risk}
          </li>
        ))}
      </ul>
    </div>
  )
}
