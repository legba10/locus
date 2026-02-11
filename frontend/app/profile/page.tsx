'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { getAccessToken } from '@/shared/auth/token-storage'
import { cn } from '@/shared/utils/cn'

export default function ProfilePage() {
  const { user, isAuthenticated, refresh } = useAuthStore()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const initialSyncedRef = useRef<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const isTelegramPhone = Boolean(user?.telegram_id && user?.phone)
  const tariffLabel =
    user?.tariff === 'landlord_basic'
      ? 'Landlord Basic'
      : user?.tariff === 'landlord_pro'
        ? 'Landlord Pro'
        : 'Free'

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

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="max-w-[600px] mx-auto px-4 py-8">
          <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse mb-6" />
          <div className="rounded-[24px] bg-white/90 border border-gray-100 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-64 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayName = name || user?.full_name || user?.username || 'Пользователь'
  const displayAvatar = user?.avatar_url ?? null

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await apiFetchJson<{ id?: string; name?: string; phone?: string; avatar?: string | null; email?: string }>('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: name.trim() || null,
          phone: phone.trim() || null,
        }),
      })
      if (res?.name !== undefined) setName(res.name)
      if (res?.phone !== undefined) setPhone(res.phone)
      if (typeof useAuthStore.getState === 'function' && res) {
        // Мгновенно обновляем локальный authStore
        useAuthStore.setState((s) => ({
          user: s.user
            ? {
                ...s.user,
                full_name: res.name ?? s.user.full_name,
                avatar_url: res.avatar ?? s.user.avatar_url,
                phone: res.phone ?? s.user.phone,
              }
            : null,
        }))
      }
      // Затем запрашиваем свежие данные профиля с бэкенда и обновляем страницу
      await refresh()
      router.refresh()
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
      const token = getAccessToken()
      const headers: HeadersInit = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/users/avatar', { method: 'POST', body: fd, credentials: 'include', headers })
      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json().catch(() => ({}))
      if (json?.avatarUrl && typeof useAuthStore.getState === 'function') {
        useAuthStore.setState((s) => ({
          user: s.user ? { ...s.user, avatar_url: json.avatarUrl } : null,
        }))
      }
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
      <div className="max-w-[640px] mx-auto px-4 py-8 space-y-4">
        <h1 className="text-[24px] font-bold text-[#1C1F26] mb-6">Профиль</h1>
        <div className="space-y-6">
          {/* Верхняя карточка: только аватар, имя и смена фото */}
          <section className={cn(
            'rounded-[24px] p-5 sm:p-6',
            'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
            'border border-white/80',
            'bg-white/90 backdrop-blur-sm'
          )}>
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {displayAvatar ? (
                  <Image src={displayAvatar} alt={displayName} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                    {displayName[0]?.toUpperCase() || 'Г'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[20px] font-bold text-[#1C1F26]">{displayName}</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <label className="inline-flex items-center px-3 py-2 rounded-[12px] border border-gray-200 text-[13px] font-medium text-[#4B5563] cursor-pointer hover:bg-gray-50 bg-white">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    {avatarUploading ? 'Загрузка…' : 'Сменить фото'}
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className={cn(
            'bg-white rounded-[24px] p-5 sm:p-6',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            'border border-gray-100/80'
          )}>
            <h2 className="text-[18px] font-semibold text-[#1C1F26] mb-4">Личные данные</h2>
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
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-gray-200/60 bg-gray-50 text-[#6B7280]',
                    'text-[14px]'
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
            'bg-white rounded-[24px] p-5 sm:p-6',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
            'border border-gray-100/80'
          )}>
            <h2 className="text-[18px] font-semibold text-[#1C1F26] mb-4">Текущий тариф</h2>
            <p className="text-[14px] text-[#6B7280] mb-4">
              Ваш тариф: <span className="font-semibold text-[#1C1F26]">{tariffLabel}</span>
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center w-full px-4 py-2 rounded-[12px] text-[14px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-100"
            >
              Перейти к тарифам
            </Link>
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
