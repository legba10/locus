'use client'

import { cn } from '@/shared/utils/cn'

interface LocusScoreBadgeProps {
  score: number
  verdict?: 'excellent' | 'good' | 'average' | 'bad'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const VERDICT_CONFIG = {
  excellent: { label: 'Отличный', bg: 'bg-emerald-500', text: 'text-white' },
  good: { label: 'Хороший', bg: 'bg-blue-500', text: 'text-white' },
  average: { label: 'Средний', bg: 'bg-amber-500', text: 'text-white' },
  bad: { label: 'Слабый', bg: 'bg-gray-400', text: 'text-white' },
}

function getVerdict(score: number): 'excellent' | 'good' | 'average' | 'bad' {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'bad'
}

/**
 * LocusScoreBadge — бейдж с оценкой LOCUS
 * 
 * Использование:
 * <LocusScoreBadge score={78} verdict="good" />
 */
export function LocusScoreBadge({ 
  score, 
  verdict, 
  size = 'md', 
  showLabel = true,
  className 
}: LocusScoreBadgeProps) {
  const finalVerdict = verdict ?? getVerdict(score)
  const config = VERDICT_CONFIG[finalVerdict]

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      config.bg,
      config.text,
      sizeClasses[size],
      className,
    )}>
      <span className="font-bold">{score}</span>
      {showLabel && <span className="opacity-90">{config.label}</span>}
    </span>
  )
}

/**
 * LocusScoreCircle — круглый индикатор
 */
export function LocusScoreCircle({ score, size = 'md', className }: Omit<LocusScoreBadgeProps, 'verdict' | 'showLabel'>) {
  const verdict = getVerdict(score)
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const colors = {
    excellent: '#10b981',
    good: '#3b82f6',
    average: '#f59e0b',
    bad: '#9ca3af',
  }
  
  const sizeMap = {
    sm: { width: 40, text: 'text-xs' },
    md: { width: 52, text: 'text-sm' },
    lg: { width: 64, text: 'text-base' },
  }
  
  const { width, text } = sizeMap[size]

  return (
    <div className={cn('relative', className)} style={{ width, height: width }}>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="22" cy="22" r="18" fill="none" strokeWidth="4" strokeLinecap="round"
          stroke={colors[verdict]}
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
        />
      </svg>
      <div className={cn('absolute inset-0 flex items-center justify-center font-bold text-gray-900', text)}>
        {score}
      </div>
    </div>
  )
}
