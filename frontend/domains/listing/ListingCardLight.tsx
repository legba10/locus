'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { RU, formatPrice, getVerdictFromScore } from '@/core/i18n/ru'
import { getImageUrl, getPlaceholderImage } from '@/shared/utils/imageUtils'

interface ListingCardLightProps {
  id: string
  photo?: string
  title?: string
  price: number
  city: string
  address?: string
  district?: string
  rooms?: number
  area?: number      // м²
  floor?: number     // этаж
  totalFloors?: number
  views?: number     // просмотры
  isNew?: boolean    // новое объявление
  isVerified?: boolean // проверено LOCUS
  score?: number
  verdict?: string
  reasons?: string[]
  tags?: string[]    // теги: "рядом метро", "выгодная цена"
  className?: string
}

/**
 * ListingCardLight — Карточка объявления v3
 * 
 * По ТЗ v3:
 * - image ratio 4:3
 * - price bigger: 20px
 * - location secondary
 * - AI explanation badge
 * - favorite icon always visible
 * - border-radius: 18px
 * - shadow: 0 6px 24px rgba(0,0,0,0.08)
 * - hover: translateY(-6px), shadow: 0 20px 60px rgba(0,0,0,0.14)
 */
export function ListingCardLight({
  id,
  photo,
  title,
  price,
  city,
  address,
  district,
  rooms,
  area,
  floor,
  totalFloors,
  views = 0,
  isNew = false,
  isVerified = false,
  score = 0,
  verdict,
  reasons = [],
  tags = [],
  className,
}: ListingCardLightProps) {
  const [imgError, setImgError] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const verdictType = getVerdictFromScore(score)
  
  // AI badge показывается только если score > 50
  const showAiBadge = score > 50

  // Формируем строку параметров
  const params: string[] = []
  if (rooms) params.push(`${rooms} комн.`)
  if (area) params.push(`${area} м²`)
  if (floor) params.push(totalFloors ? `${floor}/${totalFloors} эт.` : `${floor} эт.`)
  const paramsString = params.join(' · ')

  // Локация: город + район/адрес
  const locationString = district 
    ? `${city} · ${district}` 
    : address 
      ? `${city} · ${address}` 
      : city

  // AI объяснение (короткое)
  const aiExplanation = reasons.length > 0 
    ? reasons.slice(0, 2).join(', ').toLowerCase()
    : null

  // Получаем URL изображения с fallback на placeholder
  const imageUrl = getImageUrl(photo, getPlaceholderImage(id))
  const placeholderImage = getPlaceholderImage(id)

  return (
    <article className={cn(
      'group bg-white rounded-[18px] overflow-hidden',
      'border border-gray-100/80',
      // Тень по ТЗ v3: 0 6px 24px
      'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
      // Hover по ТЗ v3: translateY(-6px), shadow: 0 20px 60px
      'hover:shadow-[0_20px_60px_rgba(0,0,0,0.14)]',
      'hover:-translate-y-1.5',
      'hover:border-gray-200/80',
      'transition-all duration-200 ease-out',
      className
    )}>
      {/* Photo — главный элемент */}
      <Link href={`/listings/${id}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {!imgError ? (
          <Image
            src={imageUrl}
            alt={title || 'Фото жилья'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Top row: Tags + Favorite */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
          {/* Left side tags */}
          <div className="flex flex-wrap gap-1.5">
            {/* Новое объявление */}
            {isNew && (
              <span className={cn(
                'px-2 py-0.5 rounded-md',
                'bg-amber-500 text-white',
                'text-[10px] font-semibold uppercase tracking-wide'
              )}>
                Новое
              </span>
            )}
            {/* Проверено LOCUS */}
            {isVerified && (
              <span className={cn(
                'px-2 py-0.5 rounded-md',
                'bg-emerald-500 text-white',
                'text-[10px] font-semibold',
                'flex items-center gap-0.5'
              )}>
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Проверено
              </span>
            )}
          </div>
          
          {/* Save button ❤️ */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsSaved(!isSaved) }}
            className={cn(
              'p-1.5 rounded-full',
              'bg-white/90 backdrop-blur-sm',
              'shadow-sm',
              'transition-all duration-200',
              'hover:bg-white hover:scale-110',
              isSaved && 'bg-red-50'
            )}
            aria-label={isSaved ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <svg 
              className={cn('w-4.5 h-4.5', isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600')} 
              fill={isSaved ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Bottom row: Views + AI Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
          {/* Views counter 👁 */}
          {views > 0 && (
            <div className={cn(
              'px-2 py-1 rounded-md',
              'bg-black/60 backdrop-blur-sm',
              'text-white text-[11px] font-medium',
              'flex items-center gap-1'
            )}>
              <svg className="w-3 h-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {views}
            </div>
          )}
          
          {/* AI Badge — 🧠 AI рекомендует (если score > 75) */}
          {showAiBadge && score > 75 && (
            <div className={cn(
              'px-2.5 py-1 rounded-md ml-auto',
              'bg-violet-600/90 backdrop-blur-sm',
              'text-white text-[10px] font-semibold',
              'flex items-center gap-1'
            )}>
              <span className="text-[12px]">🧠</span>
              AI рекомендует
            </div>
          )}
        </div>
      </Link>

      {/* Content — padding 14px по ТЗ */}
      <div className="p-3.5 pt-4">
        {/* Price — крупнее по ТЗ v2 */}
        <div className="mb-1.5">
          <span className="text-[20px] font-bold text-gray-900">
            {formatPrice(price, 'month')}
          </span>
        </div>

        {/* Location: город · район */}
        <p className="text-[14px] text-gray-700 mb-0.5 line-clamp-1">
          {locationString}
        </p>

        {/* Parameters: комнаты · м² · этаж */}
        {paramsString && (
          <p className="text-[13px] text-gray-500 mb-2">
            {paramsString}
          </p>
        )}

        {/* Marketplace tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.slice(0, 2).map((tag, i) => (
              <span 
                key={i}
                className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Block — по ТЗ: AI score и reasons */}
        {showAiBadge && score > 0 && (
          <div className="pt-2.5 mt-2.5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[13px] font-semibold text-violet-600">
                Подходит на {score}%
              </span>
            </div>
            {reasons.length > 0 && (
              <ul className="space-y-0.5">
                {reasons.slice(0, 2).map((reason, i) => (
                  <li key={i} className="text-[12px] text-gray-500 flex items-start gap-1.5">
                    <span className="text-violet-500 mt-0.5">•</span>
                    <span className="line-clamp-1">{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

/**
 * ListingCardLightSkeleton — Скелетон карточки (improved)
 * Анимированный pulse с плавным градиентом
 */
export function ListingCardLightSkeleton() {
  return (
    <div className={cn(
      'bg-white rounded-[18px] overflow-hidden',
      'border border-gray-100'
    )}>
      {/* Photo skeleton */}
      <div className="aspect-[4/3] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]" />
      
      {/* Content skeleton */}
      <div className="p-3.5 space-y-2.5">
        {/* Price */}
        <div className="h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded-md w-28" />
        {/* Location */}
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded-md w-36" />
        {/* Params */}
        <div className="h-3.5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded-md w-24" />
      </div>
    </div>
  )
}

// Добавить в globals.css:
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
// .animate-shimmer { animation: shimmer 1.5s ease-in-out infinite; }
