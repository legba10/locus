'use client'

import { useState } from 'react'
import { formatPrice } from '@/core/i18n/ru'
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
  const base = nights * pricePerNight
  const serviceFee = Math.round(base * 0.07)
  const total = base + serviceFee
  const canConfirm = checkIn && checkOut && guests >= 1
  const effectiveMax = Math.min(maxGuests, MAX_GUESTS)

  const inputCls = 'w-full h-12 min-h-[48px] rounded-[12px] px-4 box-border border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'

  return (
    <div
      className={cn(
        'booking-card w-full max-w-[360px] box-border',
        'rounded-[16px] border border-[var(--border-main)] p-5',
        'bg-[var(--bg-card)] shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
        'flex flex-col gap-4 overflow-hidden'
      )}
    >
      <h2 className="text-[18px] font-bold text-[var(--text-primary)]">Бронирование</h2>
      <p className="text-[14px] text-[var(--text-secondary)]">
        Даты заезда и выезда, количество гостей.
      </p>

      {/* ТЗ 8: поля дат — одинаковая высота/ширина, border-radius 12px */}
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Даты заезда и выезда">
        <div className="min-w-0">
          <label id="booking-checkin-label" className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1" htmlFor="booking-checkin-input">
            Заезд
          </label>
          <input
            id="booking-checkin-input"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            aria-label="Дата заезда"
            aria-describedby="booking-checkin-label"
            className={inputCls}
          />
        </div>
        <div className="min-w-0">
          <label id="booking-checkout-label" className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1" htmlFor="booking-checkout-input">
            Выезд
          </label>
          <input
            id="booking-checkout-input"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            aria-label="Дата выезда"
            aria-describedby="booking-checkout-label"
            className={inputCls}
          />
        </div>
      </div>

      <div className="guests-control min-w-0">
        <label id="booking-guests-label" className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Гости</label>
        <div className="flex items-center justify-between h-12 rounded-[12px] border border-[var(--border-main)] px-4 bg-[var(--bg-input)]">
          <button
            type="button"
            aria-label="Уменьшить"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5)
              setGuests((g) => Math.max(1, g - 1))
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border border-[var(--border-main)] text-lg font-medium text-[var(--text-primary)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--bg-card)]"
            disabled={guests <= 1}
          >
            −
          </button>
          <span className="flex-1 text-center text-[15px] font-semibold tabular-nums text-[var(--text-primary)]">{guests}</span>
          <button
            type="button"
            aria-label="Увеличить"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5)
              setGuests((g) => Math.min(effectiveMax, g + 1))
            }}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border border-[var(--border-main)] text-lg font-medium text-[var(--text-primary)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--bg-card)]"
            disabled={guests >= effectiveMax}
          >
            +
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--border-main)] pt-4">
        <p className="text-[18px] font-bold text-[var(--text-primary)]">
          {formatPrice(pricePerNight, 'night')}
        </p>
        {nights > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[14px] text-[var(--text-primary)]">
              <span>{nights} {nights === 1 ? 'ночь' : 'ночей'} × {pricePerNight.toLocaleString('ru-RU')} = {base.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-[14px] text-[var(--text-secondary)]">
              <span>комиссия 7%</span>
              <span>{serviceFee.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[var(--border-main)] text-[16px] font-bold text-[var(--text-primary)]">
              <span>итого:</span>
              <span>{total.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        )}
      </div>

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
        aria-disabled={!canConfirm}
        aria-label={canConfirm ? 'Забронировать' : 'Выбрать даты'}
        className={cn(
          'w-full h-12 rounded-[12px] font-semibold text-[15px] border-0 mt-2',
          'bg-[var(--accent)] text-[var(--button-primary-text)]',
          'hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed',
          'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
        )}
      >
        {canConfirm ? 'Забронировать' : 'Выбрать даты'}
      </button>
    </div>
  )
}
