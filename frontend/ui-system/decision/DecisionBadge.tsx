'use client'

import { cn } from '@/shared/utils/cn'
import { RU, getVerdictFromScore, type VerdictType } from '@/core/i18n/ru'
import { LOCUS_COLORS } from '../tokens'

interface DecisionBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  glowEffect?: boolean
  className?: string
}

/**
 * Получить стили для вердикта
 */
function getVerdictStyles(verdict: VerdictType) {
  switch (verdict) {
    case 'excellent':
      return {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-400/50',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/30',
        icon: '✓',
      }
    case 'good':
      return {
        bg: 'bg-blue-500/20',
        border: 'border-blue-400/50',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/30',
        icon: '✓',
      }
    case 'average':
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-400/50',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/30',
        icon: '•',
      }
    case 'bad':
    case 'risky':
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-400/50',
        text: 'text-red-400',
        glow: 'shadow-red-500/30',
        icon: '⚠',
      }
    default:
      return {
        bg: 'bg-white/10',
        border: 'border-white/20',
        text: 'text-white/60',
        glow: '',
        icon: '?',
      }
  }
}

/**
 * DecisionBadge — Бейдж AI решения
 * 
 * Показывает вердикт в стиле LOCUS:
 * - Цветовая семантика (зелёный = подходит, жёлтый = сомнительно, красный = нет)
 * - Glass эффект
 * - Glow для AI акцента
 * 
 * ❌ Не показываем числовой score пользователю!
 * ✅ Показываем понятный вердикт: "Подходит", "Сомнительно", "Не рекомендуется"
 */
export function DecisionBadge({
  score,
  size = 'md',
  showText = true,
  glowEffect = false,
  className,
}: DecisionBadgeProps) {
  const verdict = getVerdictFromScore(score)
  const styles = getVerdictStyles(verdict)
  const verdictText = RU.verdict[verdict]

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
    xl: 'px-5 py-2.5 text-lg gap-2.5',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-xl',
        'backdrop-blur-sm border',
        styles.bg,
        styles.border,
        styles.text,
        glowEffect && `shadow-lg ${styles.glow}`,
        sizeClasses[size],
        'transition-all duration-200',
        className
      )}
    >
      <span>{styles.icon}</span>
      {showText && <span>{verdictText}</span>}
    </div>
  )
}
