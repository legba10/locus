'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/domains/auth'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'

export default function ProfilePage() {
  const { user, isAuthenticated, refresh } = useAuthStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const initialSyncedRef = useRef<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const isTelegramPhone = Boolean(user?.telegram_id && user?.phone)
  const roleLabel =
    (user as any)?.role === 'admin' ? 'Администратор'
    : (user as any)?.role === 'landlord' ? 'Арендодатель'
    : 'Пользователь'
  const tariffLabel =
    user?.tariff === 'landlord_basic'
      ? 'Landlord Basic'
      : user?.tariff === 'landlord_pro'
        ? 'Landlord Pro'
        : 'Free'
  const listingLimit = user?.listingLimit ?? 1
  const listingUsed = (user as any)?.listingUsed ?? 0
  const canCreateListing = true
  const createHref = listingUsed >= listingLimit ? '/pricing?reason=limit' : '/owner/dashboard?tab=add'

  useEffect(() => {
    if (!user?.id) return
    if (initialSyncedRef.current !== user.id) {
      initialSyncedRef.current = user.id
      setName(user?.full_name || user?.username || '')
      setPhone(user?.phone || '')
    }
  }, [user?.id, user?.full_name, user?.username, user?.phone])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(false), 2500)
    return () => clearTimeout(timer)
  }, [toast])

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
          full_name: name.trim() || null,
          phone: phone.trim() || null,
        }),
      })
      await refresh()
      setSuccess(true)
      setToast(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения профиля'
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/users/avatar', { method: 'POST', body: fd, credentials: 'include' })
      if (!res.ok) throw new Error('Upload failed')
      await refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить аватар'
      setError(msg)
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-emerald-600 text-white px-4 py-3 text-[14px] shadow-lg">
          Изменения сохранены
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-[24px] font-bold text-[#1C1F26] mb-6">Профиль</h1>
        <div className="space-y-6">
          <section className={cn(
            'bg-white rounded-[18px] p-6',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            'border border-gray-100/80'
          )}>
            <h2 className="text-[18px] font-semibold text-[#1C1F26] mb-4">Личные данные</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {user?.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.full_name || 'Аватар'} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                    {(name || user?.full_name || user?.username || 'Г')[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-[#1C1F26]">
                  {name || user?.full_name || user?.username || 'Пользователь'}
                </p>
                <label className="mt-2 inline-flex items-center px-3 py-1.5 rounded-[12px] border border-gray-200 text-[13px] font-medium text-[#4B5563] cursor-pointer hover:bg-gray-50">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  {avatarUploading ? 'Загрузка…' : 'Сменить фото'}
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-gray-200/60 bg-white/95',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  readOnly={isTelegramPhone}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    isTelegramPhone ? 'border border-gray-200/60 bg-gray-50' : 'border border-gray-200/60 bg-white/95',
                    'text-[#1C1F26] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                  )}
                />
                {isTelegramPhone && (
                  <p className="text-[12px] text-[#6B7280] mt-2">Подтверждён через Telegram</p>
                )}
              </div>
            </div>
          </section>

          <section className={cn(
            'bg-white rounded-[18px] p-6',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            'border border-gray-100/80'
          )}>
            <h2 className="text-[18px] font-semibold text-[#1C1F26] mb-4">Текущий тариф</h2>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex px-3 py-1 rounded-lg text-[12px] font-medium bg-gray-100 text-gray-700">
                Ваш статус: {roleLabel}
              </span>
              <span className="inline-flex px-3 py-1 rounded-lg text-[12px] font-medium bg-violet-100 text-violet-700">
                Текущий тариф: {tariffLabel}
              </span>
              <span className="inline-flex px-3 py-1 rounded-lg text-[12px] font-medium bg-gray-50 text-gray-700">
                Доступно: {listingLimit} • Использовано: {listingUsed}
              </span>
            </div>
            <p className="text-[14px] text-[#6B7280] mb-4">
              На FREE вы можете разместить 1 объявление. Для большего лимита и расширенной аналитики можно выбрать PRO/AGENCY.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {canCreateListing && (
                <Link
                  href={createHref}
                  className="inline-flex items-center justify-center w-full px-4 py-2 rounded-[12px] text-[14px] font-semibold bg-violet-600 text-white hover:bg-violet-500"
                >
                  Разместить объявление
                </Link>
              )}
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-[12px] text-[14px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-100"
              >
                Посмотреть тарифы
              </Link>
            </div>
          </section>

          <section className={cn(
            'bg-white rounded-[18px] p-6',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            'border border-gray-100/80'
          )}>
            <h2 className="text-[18px] font-semibold text-[#1C1F26] mb-4">Безопасность</h2>
            <div className="space-y-2 text-[14px] text-[#6B7280]">
              <p>Сессия защищена токенами доступа и обновления.</p>
              <p>{isTelegramPhone ? 'Телефон подтверждён через Telegram.' : 'Телефон можно подтвердить через Telegram.'}</p>
            </div>
          </section>

          {error && <p className="text-[13px] text-red-600">{error}</p>}
          {success && <p className="text-[13px] text-emerald-600">Изменения сохранены</p>}
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
  )
}
