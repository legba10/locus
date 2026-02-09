'use client'

import { useState } from 'react'
import { formatPrice } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'

export interface ListingCtaProps {
  price: number
  priceLabel?: string
  onWrite?: () => void
  onBook?: () => void
  onSave?: () => void
  isSaved?: boolean
  views?: number
  sticky?: boolean
}

export function ListingCta({
  price,
  priceLabel,
  onWrite,
  onBook,
  onSave,
  isSaved = false,
  views,
  sticky = true,
}: ListingCtaProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-4 md:p-6',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100',
        sticky && 'lg:sticky lg:top-6'
      )}
    >
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] md:text-[32px] font-bold text-[#1C1F26]">
            {formatPrice(price, 'night')}
          </span>
        </div>
        {priceLabel && (
          <p className="text-[13px] text-[#6B7280] mt-0.5">{priceLabel}</p>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onWrite}
          className={cn(
            'w-full px-5 py-3 rounded-[14px]',
            'bg-violet-600 text-white font-semibold text-[15px]',
            'hover:bg-violet-500 active:bg-violet-700 transition-all',
            'shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
          )}
        >
          Написать
        </button>
        <button
          type="button"
          onClick={onBook}
          className={cn(
            'w-full px-5 py-3 rounded-[14px]',
            'bg-white border-2 border-violet-600 text-violet-600 font-semibold text-[15px]',
            'hover:bg-violet-50 transition-colors'
          )}
        >
          Забронировать
        </button>
        <button
          type="button"
          onClick={onSave}
          className={cn(
            'w-full px-5 py-3 rounded-[14px]',
            'bg-white border-2 border-gray-200 text-[#1C1F26] font-semibold text-[15px]',
            'hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'
          )}
        >
          <svg
            className={cn('w-5 h-5', isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400')}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          {isSaved ? 'В избранном' : 'Сохранить'}
        </button>
      </div>

      {views != null && views > 0 && (
        <div className="pt-6 mt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[14px] text-[#6B7280]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-medium">{views} просмотров</span>
          </div>
        </div>
      )}
    </div>
  )
}
