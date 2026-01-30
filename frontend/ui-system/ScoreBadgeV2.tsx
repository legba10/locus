'use client'

import { cn } from '@/shared/utils/cn'
import { RU, getVerdictFromScore, type VerdictType } from '@/core/i18n/ru'

interface ScoreBadgeV2Props {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  /** 
   * Показывать числовую оценку? 
   * ❌ По умолчанию false — пользователь видит только вердикт
   */
  showScore?: boolean
  className?: string
}

/**
 * ScoreBadgeV2 — Бейдж вердикта
 * 
 * ПРАВИЛО Phase 7:
 * ❌ 78 / 100
 * ✅ Хороший вариант
 * 
 * AI показывает ВЕРДИКТ, а не число.
 */
export function ScoreBadgeV2({ 
  score, 
  size = 'md', 
  showLabel = false,
  showScore = false,
  className 
}: ScoreBadgeV2Props) {
  const verdictType = getVerdictFromScore(score)
  
  const getVerdictStyle = (type: VerdictType) => {
    switch (type) {
      case 'excellent':
        return { icon: '✅', bg: 'bg-emerald-500', text: 'text-white' }
      case 'good':
        return { icon: '✓', bg: 'bg-blue-500', text: 'text-white' }
      case 'average':
        return { icon: '•', bg: 'bg-amber-500', text: 'text-white' }
      case 'bad':
      case 'risky':
        return { icon: '⚠', bg: 'bg-red-500', text: 'text-white' }
      default:
        return { icon: '?', bg: 'bg-gray-400', text: 'text-white' }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { badge: 'px-2 py-0.5 text-xs font-bold', label: 'text-xs' }
      case 'md':
        return { badge: 'px-2.5 py-1 text-sm font-bold', label: 'text-sm' }
      case 'lg':
        return { badge: 'px-3 py-1.5 text-base font-bold', label: 'text-base' }
      case 'xl':
        return { badge: 'px-4 py-2 text-lg font-bold', label: 'text-lg' }
    }
  }

  const style = getVerdictStyle(verdictType)
  const sizes = getSizeClasses()
  const verdictText = RU.verdictShort[verdictType]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('rounded-lg', style.bg, style.text, sizes.badge)}>
        {style.icon} {verdictText}
      </span>
      {showLabel && (
        <span className={cn('font-medium text-gray-700', sizes.label)}>
          {RU.verdict[verdictType]}
        </span>
      )}
      {showScore && (
        <span className="text-xs text-gray-400">
          ({score})
        </span>
      )}
    </div>
  )
}
