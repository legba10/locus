'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'

export default function BookingsPage() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 text-[14px]">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-[24px] font-bold text-[#1C1F26] mb-6">Бронирования</h1>
        <div className={cn(
          'bg-white rounded-[18px] p-8 text-center',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <p className="text-[15px] text-[#6B7280]">
            У вас пока нет бронирований.
          </p>
        </div>
      </div>
    </div>
  )
}
