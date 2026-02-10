'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { GlassCard, GlassButton } from '@/ui-system/glass'
import { DecisionBadge, DecisionReasons } from '@/ui-system/decision'
import { RU, formatPrice, getVerdictFromScore } from '@/core/i18n/ru'
import type { LocusAIDecision } from '@/ui-system/decision'

interface ListingCardGlassProps {
  id: string
  photo?: string
  price: number
  city: string
  district?: string
  decision: Partial<LocusAIDecision>
  personalReasons?: string[]
  className?: string
}

/**
 * ListingCardGlass — Карточка объявления в стиле Liquid Glass
 * 
 * Визуальный приоритет:
 * 1. AI решение (вердикт) — крупный элемент
 * 2. Причины (max 3) — semantic colors
 * 3. Цена — вторична
 * 4. Локация
 * 5. Действия
 * 
 * ❗ Запрещено:
 * - белые карточки
 * - шаблонный вид Avito
 * - цена как главный элемент
 */
export function ListingCardGlass({
  id,
  photo,
  price,
  city,
  district,
  decision,
  personalReasons,
  className,
}: ListingCardGlassProps) {
  const [imgError, setImgError] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const score = decision.score || 0
  const verdictType = getVerdictFromScore(score)
  const reasons = decision.reasons || []

  // Определить бордер по вердикту
  const borderColor = 
    verdictType === 'excellent' ? 'border-emerald-500/30' :
    verdictType === 'good' ? 'border-blue-500/30' :
    verdictType === 'average' ? 'border-amber-500/30' :
    'border-white/[0.15]'

  return (
    <article className={cn(
      'group relative rounded-xl overflow-hidden',
      'bg-white/[0.06] backdrop-blur-xl',
      'border transition-all duration-300',
      borderColor,
      'hover:bg-white/[0.1] hover:shadow-xl hover:shadow-black/30',
      'hover:-translate-y-1',
      className
    )}>
      {/* Photo */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-slate-800">
        {photo && !imgError ? (
          <Image
            src={photo}
            alt="Фото жилья"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <span className="text-5xl opacity-50">🏠</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Demand badge */}
        {decision.demandLevel === 'высокий' && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-medium backdrop-blur-sm">
            🔥 {RU.demand.high}
          </div>
        )}
        
        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved) }}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full',
            'bg-black/40 backdrop-blur-sm',
            'transition-all duration-200',
            'hover:bg-black/60',
            isSaved && 'bg-red-500/80 hover:bg-red-500'
          )}
          aria-label={isSaved ? 'Удалить из сохранённых' : RU.action.save}
        >
          <span className="text-white text-lg">
            {isSaved ? '❤️' : '🤍'}
          </span>
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* 1. AI DECISION (главный элемент) */}
        <DecisionBadge score={score} size="lg" glowEffect />

        {/* 2. REASONS */}
        {reasons.length > 0 && (
          <div>
            <p className="text-xs text-white/50 mb-1.5">{RU.block.why_fits}:</p>
            <DecisionReasons reasons={reasons} maxItems={3} variant="compact" />
          </div>
        )}

        {/* 3. PRICE (вторичный элемент) */}
        <div className="pt-2">
          <span className="text-lg font-semibold text-white/90">
            {formatPrice(price, 'month')}
          </span>
        </div>

        {/* 4. LOCATION */}
        <p className="text-sm text-white/60">
          {city}
          {district && ` · ${district}`}
        </p>

        {/* 5. ACTIONS */}
        <div className="pt-2 flex gap-2">
          <Link href={`/listings/${id}`} className="flex-1">
            <GlassButton variant="glass" fullWidth size="sm">
              {RU.action.view_analysis}
            </GlassButton>
          </Link>
          <Link href={`/listings/${id}#book`} className="flex-1">
            <GlassButton variant="primary" fullWidth size="sm">
              {RU.action.book}
            </GlassButton>
          </Link>
        </div>
      </div>
    </article>
  )
}

/**
 * ListingCardGlassSkeleton — Скелетон карточки
 */
export function ListingCardGlassSkeleton() {
  return (
    <div className={cn(
      'rounded-xl overflow-hidden',
      'bg-white/[0.06] backdrop-blur-xl',
      'border border-white/[0.15]',
      'animate-pulse'
    )}>
      {/* Photo skeleton */}
      <div className="aspect-[4/3] bg-slate-800" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-8 bg-white/10 rounded-xl w-2/3" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
        <div className="h-6 bg-white/10 rounded w-1/3" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="pt-2 flex gap-2">
          <div className="h-9 bg-white/10 rounded-xl flex-1" />
          <div className="h-9 bg-white/10 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  )
}
