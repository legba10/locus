'use client'

import { cn } from '@/shared/utils/cn'

interface LocusRatingProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

function getLabel(score: number): { text: string; color: string; bgColor: string } {
  if (score >= 80) {
    return { text: 'Отлично', color: 'text-emerald-700', bgColor: 'bg-emerald-50' }
  }
  if (score >= 60) {
    return { text: 'Хорошо', color: 'text-blue-700', bgColor: 'bg-blue-50' }
  }
  if (score >= 40) {
    return { text: 'Средне', color: 'text-amber-700', bgColor: 'bg-amber-50' }
  }
  return { text: 'Улучшить', color: 'text-red-700', bgColor: 'bg-red-50' }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

/**
 * LOCUS Rating Badge - простой и понятный компонент оценки
 */
export function LocusRating({ score, size = 'md', showLabel = true, className }: LocusRatingProps) {
  const label = getLabel(score)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn(
        'font-semibold rounded-md',
        sizeClasses[size],
        label.bgColor,
        label.color,
      )}>
        {score}
      </span>
      {showLabel && (
        <span className={cn('font-medium', label.color, size === 'sm' ? 'text-xs' : 'text-sm')}>
          {label.text}
        </span>
      )}
    </div>
  )
}

/**
 * LOCUS Rating Circle - круговой индикатор
 */
export function LocusRatingCircle({ 
  score, 
  size = 'md',
  showLabel = false,
  className 
}: LocusRatingProps) {
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (score / 100) * circumference
  const progressColor = getProgressColor(score)
  const scoreColor = getScoreColor(score)
  
  const sizeMap = {
    sm: { width: 40, fontSize: 'text-xs' },
    md: { width: 56, fontSize: 'text-sm' },
    lg: { width: 72, fontSize: 'text-lg' },
  }
  
  const { width, fontSize } = sizeMap[size]

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={progressColor}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        </svg>
        <div className={cn(
          'absolute inset-0 flex items-center justify-center font-bold',
          fontSize,
          scoreColor,
        )}>
          {score}
        </div>
      </div>
      {showLabel && (
        <span className="mt-1 text-xs text-text-dim">{getLabel(score).text}</span>
      )}
    </div>
  )
}

/**
 * LOCUS Rating Bar - горизонтальный прогресс-бар
 */
export function LocusRatingBar({ 
  score, 
  showScore = true,
  showLabel = true,
  className 
}: LocusRatingProps & { showScore?: boolean }) {
  const label = getLabel(score)
  const progressColor = getProgressColor(score)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className={cn('text-sm font-medium', label.color)}>{label.text}</span>
        )}
        {showScore && (
          <span className={cn('text-sm font-semibold', getScoreColor(score))}>{score}/100</span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all duration-500', progressColor)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Tooltip с объяснением рейтинга LOCUS
 */
export function LocusRatingTooltip({ children, score }: { children: React.ReactNode; score: number }) {
  const label = getLabel(score)
  
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-48">
          <div className="flex items-center gap-2 mb-2">
            <LocusRating score={score} size="sm" showLabel={false} />
            <span className="font-medium text-gray-900">{label.text}</span>
          </div>
          <p className="text-xs text-gray-600">
            {score >= 80 && 'Объявление соответствует высоким стандартам LOCUS.'}
            {score >= 60 && score < 80 && 'Хорошее объявление. Небольшие улучшения повысят рейтинг.'}
            {score >= 40 && score < 60 && 'Рекомендуем улучшить описание и фотографии.'}
            {score < 40 && 'Объявление требует значительных улучшений.'}
          </p>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-white" />
        </div>
      </div>
    </div>
  )
}
