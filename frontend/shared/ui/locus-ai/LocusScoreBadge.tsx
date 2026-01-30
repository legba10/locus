'use client'

import { cn } from '@/shared/utils/cn'

interface LocusScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

function getScoreConfig(score: number) {
  if (score >= 80) return { label: 'Отличный', color: 'bg-emerald-500', textColor: 'text-white' }
  if (score >= 60) return { label: 'Хороший', color: 'bg-blue-500', textColor: 'text-white' }
  if (score >= 40) return { label: 'Средний', color: 'bg-amber-500', textColor: 'text-white' }
  return { label: 'Слабый', color: 'bg-gray-400', textColor: 'text-white' }
}

/**
 * LocusScoreBadge — компактный бейдж с оценкой
 * 
 * Принцип: Понятно без объяснений
 */
export function LocusScoreBadge({ score, size = 'md', showLabel = true, className }: LocusScoreBadgeProps) {
  const config = getScoreConfig(score)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium',
      config.color,
      config.textColor,
      sizeClasses[size],
      className,
    )}>
      <span className="font-bold">{score}</span>
      {showLabel && <span className="opacity-90">{config.label}</span>}
    </div>
  )
}

/**
 * LocusScoreCircle — круглый индикатор для карточек
 */
export function LocusScoreCircle({ score, size = 'md', className }: Omit<LocusScoreBadgeProps, 'showLabel'>) {
  const config = getScoreConfig(score)
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const sizeMap = {
    sm: { width: 40, textSize: 'text-xs' },
    md: { width: 52, textSize: 'text-sm' },
    lg: { width: 64, textSize: 'text-base' },
  }
  
  const { width, textSize } = sizeMap[size]
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#9ca3af'

  return (
    <div className={cn('relative', className)} style={{ width, height: width }}>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="22" cy="22" r="18" fill="none" strokeWidth="4" strokeLinecap="round"
          stroke={strokeColor}
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
        />
      </svg>
      <div className={cn('absolute inset-0 flex items-center justify-center font-bold text-gray-900', textSize)}>
        {score}
      </div>
    </div>
  )
}
