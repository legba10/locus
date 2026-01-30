'use client'

import { cn } from '@/shared/utils/cn'
import { RU, getVerdictFromScore, type VerdictType, type DemandLevel } from '@/core/i18n/ru'
import { DecisionBadge } from './DecisionBadge'
import { DecisionReasons } from './DecisionReasons'
import { GlassCard } from '../glass'

/**
 * Стандартный объект AI решения
 */
export interface LocusAIDecision {
  score: number
  verdict?: 'подходит' | 'сомнительно' | 'не рекомендуется'
  reasons: string[]
  demandLevel?: 'низкий' | 'средний' | 'высокий'
  pricePosition?: 'ниже рынка' | 'в рынке' | 'выше рынка'
  recommendation?: string
  personalReasons?: string[]
}

interface GlassDecisionBlockProps {
  decision: LocusAIDecision
  variant?: 'card' | 'page' | 'compact' | 'hero'
  title?: string
  showPersonal?: boolean
  className?: string
}

/**
 * Получить стили контейнера по вердикту
 */
function getContainerStyles(verdict: VerdictType) {
  switch (verdict) {
    case 'excellent':
      return {
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/10',
        accent: 'from-emerald-500/20 to-transparent',
      }
    case 'good':
      return {
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/10',
        accent: 'from-blue-500/20 to-transparent',
      }
    case 'average':
      return {
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/10',
        accent: 'from-amber-500/20 to-transparent',
      }
    default:
      return {
        border: 'border-white/[0.15]',
        glow: '',
        accent: 'from-white/10 to-transparent',
      }
  }
}

/**
 * GlassDecisionBlock — Блок AI решения в стиле LOCUS
 * 
 * Объединяет:
 * - DecisionBadge (вердикт)
 * - DecisionReasons (причины)
 * - Рекомендации
 * - Персонализация
 * 
 * Визуальный приоритет:
 * 1. AI решение (вердикт)
 * 2. Причины (max 3)
 * 3. Персональная релевантность
 * 4. Рекомендация
 */
export function GlassDecisionBlock({
  decision,
  variant = 'card',
  title,
  showPersonal = true,
  className,
}: GlassDecisionBlockProps) {
  const verdictType = getVerdictFromScore(decision.score)
  const verdictText = decision.verdict || RU.verdict[verdictType]
  const containerStyles = getContainerStyles(verdictType)

  // Compact variant for cards
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <DecisionBadge score={decision.score} size="md" />
        {decision.reasons.length > 0 && (
          <DecisionReasons reasons={decision.reasons} maxItems={2} variant="compact" />
        )}
      </div>
    )
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className={cn(
        'rounded-xl overflow-hidden',
        'bg-white/[0.06] backdrop-blur-lg',
        'border',
        containerStyles.border,
        className
      )}>
        <div className="p-4 space-y-3">
          {/* Вердикт */}
          <DecisionBadge score={decision.score} size="lg" glowEffect />
          
          {/* Причины */}
          {decision.reasons.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-2">{RU.block.why_fits}:</p>
              <DecisionReasons reasons={decision.reasons} maxItems={3} />
            </div>
          )}
          
          {/* Рекомендация */}
          {decision.recommendation && (
            <p className="text-sm text-purple-300 mt-2">
              💡 {decision.recommendation}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Hero variant (for listing page top section)
  if (variant === 'hero') {
    return (
      <div className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-gradient-to-br',
        containerStyles.accent,
        'bg-white/[0.04] backdrop-blur-xl',
        'border',
        containerStyles.border,
        'shadow-xl',
        containerStyles.glow,
        className
      )}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        
        <div className="relative p-6 space-y-4">
          {/* Title */}
          {title && (
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide">
              {title}
            </h3>
          )}
          
          {/* Вердикт (крупно) */}
          <div className="flex items-center gap-4">
            <DecisionBadge score={decision.score} size="xl" glowEffect />
          </div>
          
          {/* Причины */}
          {decision.reasons.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-white/60 mb-3">{RU.block.why_fits}:</p>
              <DecisionReasons reasons={decision.reasons} maxItems={4} variant="glass" />
            </div>
          )}
          
          {/* Персонализация */}
          {showPersonal && decision.personalReasons && decision.personalReasons.length > 0 && (
            <div className="pt-3 border-t border-white/[0.1]">
              <p className="text-sm font-medium text-purple-300 mb-2">
                {RU.block.for_you}:
              </p>
              <ul className="space-y-1">
                {decision.personalReasons.slice(0, 3).map((r, idx) => (
                  <li key={idx} className="text-sm text-white/70 flex items-center gap-2">
                    <span className="text-purple-400">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Рекомендация */}
          {decision.recommendation && (
            <div className="pt-3 border-t border-white/[0.1]">
              <p className="text-sm text-white/50 mb-1">{RU.block.locus_recommends}:</p>
              <p className="text-base font-medium text-white">
                {decision.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Page variant (full width)
  return (
    <GlassCard variant="glow" padding="lg" className={cn('space-y-4', className)}>
      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>
      )}
      
      {/* Вердикт */}
      <div className="flex items-center gap-3">
        <DecisionBadge score={decision.score} size="xl" glowEffect />
      </div>
      
      {/* Причины */}
      {decision.reasons.length > 0 && (
        <div>
          <p className="text-sm text-white/60 mb-3">{RU.block.why_fits}:</p>
          <DecisionReasons reasons={decision.reasons} maxItems={4} variant="glass" />
        </div>
      )}
      
      {/* Персонализация */}
      {showPersonal && decision.personalReasons && decision.personalReasons.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-sm font-medium text-purple-300 mb-2">
            {RU.block.for_you}:
          </p>
          <ul className="space-y-1.5">
            {decision.personalReasons.slice(0, 3).map((r, idx) => (
              <li key={idx} className="text-sm text-white/80 flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Рекомендация */}
      {decision.recommendation && (
        <div className="pt-4 border-t border-white/[0.1]">
          <p className="text-sm text-white/50 mb-1">{RU.block.locus_recommends}:</p>
          <p className="text-lg font-medium text-white">
            {decision.recommendation}
          </p>
        </div>
      )}
    </GlassCard>
  )
}
