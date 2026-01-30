'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'

interface BookingButtonProps {
  listingId: string
  price: number
}

/**
 * BookingButton — Кнопка бронирования с flow выбора даты
 */
export function BookingButton({ listingId, price }: BookingButtonProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleBooking = async () => {
    if (!isAuthenticated()) {
      router.push('/auth/login?redirect=/listings/' + listingId)
      return
    }

    if (!checkIn || !checkOut) {
      setShowBookingModal(true)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          checkIn,
          checkOut,
          guests,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка бронирования')
      }

      // Успешное бронирование
      alert('Заявка на бронирование отправлена владельцу!')
      setShowBookingModal(false)
    } catch (error) {
      console.error('Booking error:', error)
      alert('Не удалось отправить заявку. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => {
          if (!isAuthenticated()) {
            router.push('/auth/login?redirect=/listings/' + listingId)
            return
          }
          setShowBookingModal(true)
        }}
        className={cn(
          'w-full px-5 py-3 rounded-[14px]',
          'bg-violet-600 text-white font-semibold text-[15px]',
          'hover:bg-violet-500 active:bg-violet-700',
          'transition-all duration-200',
          'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
          'hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        disabled={loading}
      >
        {loading ? 'Отправка...' : 'Забронировать'}
      </button>

      {/* Модальное окно бронирования */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={cn(
            'bg-white rounded-[20px] p-6 max-w-md w-full',
            'shadow-[0_20px_60px_rgba(0,0,0,0.3)]'
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-bold text-[#1C1F26]">Бронирование</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-[#6B7280] hover:text-[#1C1F26]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Дата заезда</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-gray-200/60 bg-white/95',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Дата выезда</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-gray-200/60 bg-white/95',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Гостей</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  min={1}
                  max={10}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-gray-200/60 bg-white/95',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] text-[#6B7280]">Итого</span>
                  <span className="text-[18px] font-bold text-[#1C1F26]">
                    {checkIn && checkOut
                      ? `${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) * price} ₽`
                      : '—'}
                  </span>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut || loading}
                  className={cn(
                    'w-full py-3 rounded-[14px]',
                    'bg-violet-600 text-white font-semibold text-[15px]',
                    'hover:bg-violet-500 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
