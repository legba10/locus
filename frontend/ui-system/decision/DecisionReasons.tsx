'use client'

import { cn } from '@/shared/utils/cn'
import { getReasonTypeFromText, type ReasonType } from '@/core/i18n/ru'

interface Reason {
  text: string
  type?: ReasonType
}

interface DecisionReasonsProps {
  reasons: (string | Reason)[]
  maxItems?: number
  variant?: 'default' | 'compact' | 'glass'
  className?: string
}

/**
 * Получить стили для типа причины
 */
function getReasonStyles(type: ReasonType) {
  switch (type) {
    case 'positive':
      return {
        icon: '✓',
        iconColor: 'text-emerald-400',
        textColor: 'text-emerald-300',
        bg: 'bg-emerald-500/10',
      }
    case 'negative':
      return {
        icon: '⚠',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-300',
        bg: 'bg-amber-500/10',
      }
    default:
      return {
        icon: '•',
        iconColor: 'text-white/50',
        textColor: 'text-white/70',
        bg: 'bg-white/5',
      }
  }
}

/**
 * DecisionReasons — Список причин AI решения
 * 
 * Показывает до 3 причин с семантической цветовой кодировкой:
 * - ✓ Положительные (зелёный)
 * - • Нейтральные (серый)
 * - ⚠ Отрицательные (жёлтый)
 */
export function DecisionReasons({
  reasons,
  maxItems = 3,
  variant = 'default',
  className,
}: DecisionReasonsProps) {
  if (!reasons || reasons.length === 0) return null

  const displayReasons = reasons.slice(0, maxItems).map(r => {
    if (typeof r === 'string') {
      return { text: r, type: getReasonTypeFromText(r) }
    }
    return { text: r.text, type: r.type || getReasonTypeFromText(r.text) }
  })

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {displayReasons.map((reason, idx) => {
          const styles = getReasonStyles(reason.type)
          return (
            <span
              key={idx}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs',
                styles.bg,
                styles.textColor
              )}
            >
              <span className={styles.iconColor}>{styles.icon}</span>
              {reason.text}
            </span>
          )
        })}
      </div>
    )
  }

  if (variant === 'glass') {
    return (
      <div className={cn(
        'p-3 rounded-xl',
        'bg-white/[0.05] backdrop-blur-sm',
        'border border-white/[0.1]',
        className
      )}>
        <div className="space-y-2">
          {displayReasons.map((reason, idx) => {
            const styles = getReasonStyles(reason.type)
            return (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm"
              >
                <span className={cn('font-bold mt-0.5', styles.iconColor)}>
                  {styles.icon}
                </span>
                <span className={styles.textColor}>
                  {reason.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-1.5', className)}>
      {displayReasons.map((reason, idx) => {
        const styles = getReasonStyles(reason.type)
        return (
          <div
            key={idx}
            className="flex items-start gap-2 text-sm"
          >
            <span className={cn('font-bold mt-0.5', styles.iconColor)}>
              {styles.icon}
            </span>
            <span className={styles.textColor}>
              {reason.text}
            </span>
          </div>
        )
      })}
    </div>
  )
}
