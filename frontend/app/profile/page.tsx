'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { supabase } from '@/shared/supabase-client'
import { cn } from '@/shared/utils/cn'
import { ThemeSettings } from '@/components/ui/ThemeSettings'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 text-[14px]">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="h-8 w-48 rounded-lg bg-[var(--bg-input)] animate-pulse mb-6" />
          <div className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-main)] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-input)] animate-pulse" />
              <div className="h-6 w-32 rounded bg-[var(--bg-input)] animate-pulse" />
              <div className="h-4 w-64 rounded bg-[var(--bg-input)] animate-pulse" />
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
      const newName = (res as { name?: string; full_name?: string })?.full_name ?? (res as { name?: string })?.name
      const newPhone = (res as { phone?: string })?.phone
      if (newName !== undefined) setName(newName)
      if (newPhone !== undefined) setPhone(newPhone)
      if (typeof useAuthStore.getState === 'function' && res) {
        const r = res as { name?: string; full_name?: string; avatar?: string; phone?: string }
        useAuthStore.setState((s) => ({
          user: s.user
            ? {
                ...s.user,
                full_name: r.full_name ?? r.name ?? s.user.full_name,
                avatar_url: r.avatar ?? s.user.avatar_url,
                phone: r.phone ?? s.user.phone,
              }
            : null,
        }))
      }
      // ТЗ-3: не вызывать router.refresh() — ломает auth state. Обновляем только store через refresh().
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
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
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
    <div className="min-h-screen">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-primary)] px-4 py-3 text-[14px] shadow-lg">
          Изменения сохранены
        </div>
      )}
      <div className="container py-8 space-y-6 max-w-[720px]">
        <h1 className="text-[24px] font-bold text-[var(--color-text)] mb-2">Настройки профиля</h1>
        <div className="space-y-6">
          {/* TZ-9: верхняя карточка — аватар 80px, имя, смена фото */}
          <section className="profile-header-tz9">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-4">
              <label className="profile-header-tz9__avatar relative block cursor-pointer w-20 h-20">
                {displayAvatar ? (
                  <Image src={displayAvatar} alt={displayName} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--color-muted)]">
                    {displayName[0]?.toUpperCase() || 'Г'}
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
              </label>
              <div className="flex-1 min-w-0">
                <p className="profile-header-tz9__name">{displayName}</p>
                <p className="text-[13px] text-[var(--color-muted)] mt-1">{avatarUploading ? 'Загрузка…' : 'Нажмите на аватар, чтобы сменить фото'}</p>
              </div>
            </div>
          </section>

          <section className="profile-header-tz9 rounded-[18px] p-5 sm:p-6">
            <h2 className="text-[18px] font-semibold text-[var(--color-text)] mb-4">Личные данные</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-2">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-[var(--border)] bg-[var(--color-surface)]',
                    'text-[var(--color-text)] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'
                  )}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    'border border-[var(--border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]',
                    'text-[14px]'
                  )}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-2">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  readOnly={isTelegramPhone}
                  className={cn(
                    'w-full rounded-[14px] px-4 py-3',
                    isTelegramPhone ? 'border border-[var(--border)] bg-[var(--color-surface-2)]' : 'border border-[var(--border)] bg-[var(--color-surface)]',
                    'text-[var(--color-text)] text-[14px]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'
                  )}
                />
                {isTelegramPhone && (
                  <p className="text-[12px] text-[var(--color-muted)] mt-2">Подтверждён через Telegram</p>
                )}
              </div>
            </div>
          </section>

          <ThemeSettings />

          <section className="profile-header-tz9 rounded-[18px] p-5 sm:p-6">
            <h2 className="text-[18px] font-semibold text-[var(--color-text)] mb-4">Текущий тариф</h2>
            <p className="text-[14px] text-[var(--color-muted)] mb-4">
              Ваш тариф: <span className="font-semibold text-[var(--color-text)]">{tariffLabel}</span>
            </p>
            <Link
              href="/pricing"
              className="btn btn--secondary btn--md w-full inline-flex items-center justify-center"
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
              'bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[15px]',
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
