'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'

export default function ProfilePage() {
  const { user, isAuthenticated, refresh } = useAuthStore()
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    verificationStatus: user?.verification_status || 'pending',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setFormData({
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      verificationStatus: user?.verification_status || 'pending',
    })
  }, [user])

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

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await apiFetchJson('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: formData.fullName.trim() || null,
          phone: formData.phone.trim() || null,
        }),
      })
      await refresh()
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения профиля'
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-[24px] font-bold text-[#1C1F26] mb-6">Профиль</h1>
        <div className={cn(
          'bg-white rounded-[18px] p-6',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Имя</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-gray-50',
                  'text-[#1C1F26] text-[14px]'
                )}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Статус верификации</label>
              <span className={cn(
                'inline-flex px-3 py-1 rounded-lg text-[12px] font-medium',
                formData.verificationStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {formData.verificationStatus === 'verified' ? 'Верифицирован' : 'На проверке'}
              </span>
            </div>
            {error && <p className="text-[13px] text-red-600">{error}</p>}
            {success && <p className="text-[13px] text-emerald-600">Профиль обновлён</p>}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'w-full py-3 rounded-[14px]',
                'bg-violet-600 text-white font-semibold text-[15px]',
                'hover:bg-violet-500 transition-colors',
                isSaving && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
