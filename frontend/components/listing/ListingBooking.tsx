'use client'

import { useState } from 'react'
import { formatPrice, RU } from '@/core/i18n/ru'
import { cn } from '@/shared/utils/cn'

const MAX_GUESTS = 16

export interface ListingBookingProps {
  listingId: string
  pricePerNight: number
  maxGuests?: number
  onConfirm?: (data: { checkIn: Date; checkOut: Date; guests: number }) => void
}

export function ListingBooking({ listingId, pricePerNight, maxGuests = MAX_GUESTS, onConfirm }: ListingBookingProps) {
  const [checkIn, setCheckIn] = useState<string>('')
  const [checkOut, setCheckOut] = useState<string>('')
  const [guests, setGuests] = useState<number>(1)

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (24 * 60 * 60 * 1000)))
    : 0
  const total = nights * pricePerNight
  const canConfirm = checkIn && checkOut && guests >= 1

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-4 md:p-6',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100'
      )}
    >
      <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Бронирование</h2>
      <p className="text-[14px] text-[#6B7280] mb-4">
        Выберите даты заезда и выезда, количество гостей, затем подтвердите бронь.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[13px] font-medium text-[#6B7280] mb-1">Заезд</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-[12px] px-4 py-2.5 border border-gray-200 text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#6B7280] mb-1">Выезд</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            className="w-full rounded-[12px] px-4 py-2.5 border border-gray-200 text-[14px]"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-[#6B7280] mb-1">Гости</label>
        <input
          type="number"
          min={1}
          max={Math.min(maxGuests, MAX_GUESTS)}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Math.min(MAX_GUESTS, parseInt(String(e.target.value), 10) || 1)))}
          className="w-full rounded-[12px] px-4 py-2.5 border border-gray-200 text-[14px]"
        />
      </div>
      {nights > 0 && (
        <div className="rounded-[12px] bg-gray-50 p-4 mb-4 space-y-1">
          <p className="text-[14px] text-[#6B7280]">
            {formatPrice(pricePerNight, 'night')} × {nights} ночей
          </p>
          <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
            <span className="text-[14px] font-semibold text-[#1C1F26]">{RU.price.total}</span>
            <span className="text-[18px] font-bold text-[#1C1F26]">{formatPrice(total, 'night')}</span>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          canConfirm &&
          onConfirm?.({
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
          })
        }
        disabled={!canConfirm}
        className={cn(
          'w-full px-5 py-3 rounded-[14px] bg-violet-600 text-white font-semibold text-[15px]',
          'hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Подтвердить бронь
      </button>
    </div>
  )
}
