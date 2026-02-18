'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useAuthStore } from '@/domains/auth'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { ProfileCard } from './ProfileCard'
import { cn } from '@/shared/utils/cn'

export function ProfileMainBlock() {
  const { user, refresh } = useAuthStore()
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(user?.full_name || user?.username || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setName(user?.full_name || user?.username || '')
    setPhone(user?.phone || '')
  }, [user?.full_name, user?.username, user?.phone])

  useEffect(() => {
    if (!editOpen) return
    const close = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setEditOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [editOpen])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await apiFetchJson('/profile', { method: 'PATCH', body: JSON.stringify({ full_name: name.trim() || null, phone: phone.trim() || null }) })
      await refresh()
      setEditOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const displayName = name || user?.full_name || user?.username || 'Пользователь'
  const displayAvatar = user?.avatar_url ?? null
  const isTelegramPhone = Boolean(user?.telegram_id && user?.phone)
  const listingsCount = (user as any)?.listingUsed ?? 0
  const verified = false

  return (
    <>
      <ProfileCard title="Пользователь">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--bg-input)] flex-shrink-0 flex items-center justify-center">
            {displayAvatar ? (
              <Image src={displayAvatar} alt="" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="text-2xl font-semibold text-[var(--text-muted)]">{displayName[0]?.toUpperCase() || 'Г'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 grid gap-2">
            <p className="text-[15px] font-semibold text-[var(--text-primary)]">{displayName}</p>
            <p className="text-[14px] text-[var(--text-secondary)]">{user?.email ?? '—'}</p>
            <p className="text-[14px] text-[var(--text-secondary)]">{phone || '—'}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 rounded-[12px] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] font-medium hover:bg-[var(--accent)] hover:text-[var(--button-primary-text)] transition-colors"
          >
            Редактировать
          </button>
        </div>
      </ProfileCard>

      <ProfileCard title="Статус аккаунта">
        <div className="grid gap-2 text-[14px]">
          <p className="text-[var(--text-secondary)]">Аккаунт: <span className="font-semibold text-[var(--text-primary)]">активен</span></p>
          <p className="text-[var(--text-secondary)]">Объявлений: <span className="font-semibold text-[var(--text-primary)]">{listingsCount}</span></p>
          <p className="text-[var(--text-secondary)]">Верификация: <span className="font-semibold text-[var(--text-primary)]">{verified ? 'пройдена' : 'не пройдена'}</span></p>
        </div>
      </ProfileCard>

      <ProfileCard title="Роль">
        <div className="flex flex-wrap gap-2">
          {['владелец', 'агент', 'гость'].map((role) => (
            <span
              key={role}
              className={cn(
                'px-3 py-1.5 rounded-[10px] text-[13px] font-medium',
                role === 'владелец' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
              )}
            >
              {role}
            </span>
          ))}
        </div>
      </ProfileCard>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div ref={modalRef} className="w-full max-w-md rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-main)] p-5 shadow-xl">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-4">Редактировать профиль</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  readOnly={isTelegramPhone}
                  className="w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                />
                {isTelegramPhone && <p className="text-[12px] text-[var(--text-muted)] mt-1">Подтверждён через Telegram</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Email</label>
                <input type="email" value={user?.email ?? ''} readOnly className="w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-muted)] text-[14px]" />
              </div>
            </div>
            {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setEditOpen(false)} className="flex-1 py-2.5 rounded-[12px] border border-[var(--border-main)] text-[var(--text-primary)] text-[14px] font-medium hover:bg-[var(--bg-input)]">
                Отмена
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-95 disabled:opacity-70">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
