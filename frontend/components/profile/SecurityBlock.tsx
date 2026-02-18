'use client'

import { useState } from 'react'
import { ProfileCard } from './ProfileCard'
import { cn } from '@/shared/utils/cn'

export function SecurityBlock() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (newPassword !== repeatPassword) {
      setMessage({ type: 'err', text: 'Пароли не совпадают' })
      return
    }
    setSaving(true)
    try {
      // Placeholder: реальный API смены пароля
      await new Promise((r) => setTimeout(r, 500))
      setMessage({ type: 'ok', text: 'Пароль успешно изменён' })
      setCurrentPassword('')
      setNewPassword('')
      setRepeatPassword('')
    } catch {
      setMessage({ type: 'err', text: 'Ошибка смены пароля' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ProfileCard title="Смена пароля">
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Текущий пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={cn('w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20')}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn('w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20')}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Повтор нового пароля</label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={cn('w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20')}
              autoComplete="new-password"
            />
          </div>
          {message && <p className={cn('text-[14px]', message.type === 'ok' ? 'text-emerald-600' : 'text-red-600')}>{message.text}</p>}
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-95 disabled:opacity-70">
            {saving ? 'Сохранение...' : 'Изменить пароль'}
          </button>
        </form>
      </ProfileCard>

      <ProfileCard title="Подтверждение email">
        <p className="text-[14px] text-[var(--text-secondary)]">Отправьте письмо с ссылкой для подтверждения на вашу почту.</p>
        <button type="button" className="mt-3 px-4 py-2 rounded-[12px] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] font-medium hover:bg-[var(--accent)] hover:text-[var(--button-primary-text)] transition-colors">
          Подтвердить email
        </button>
      </ProfileCard>

      <ProfileCard title="Подтверждение телефона">
        <p className="text-[14px] text-[var(--text-secondary)]">Телефон можно подтвердить через Telegram или SMS.</p>
      </ProfileCard>

      <ProfileCard title="Активные сессии">
        <ul className="space-y-3">
          <li className="flex items-center justify-between gap-4 rounded-[12px] p-4 bg-[var(--bg-input)]">
            <div>
              <p className="text-[14px] font-medium text-[var(--text-primary)]">Текущее устройство</p>
              <p className="text-[13px] text-[var(--text-muted)]">Город: —</p>
            </div>
            <span className="text-[13px] text-[var(--text-muted)]">Сейчас</span>
          </li>
        </ul>
        <p className="mt-3 text-[13px] text-[var(--text-muted)]">Выйти из других сессий можно после подключения API.</p>
      </ProfileCard>
    </div>
  )
}
