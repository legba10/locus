'use client'

import { useState } from 'react'
import { ProfileCard } from './ProfileCard'
import { cn } from '@/shared/utils/cn'

const ITEMS = [
  { id: 'messages', label: 'Сообщения' },
  { id: 'bookings', label: 'Бронирования' },
  { id: 'responses', label: 'Отклики' },
  { id: 'system', label: 'Системные' },
] as const

export function NotificationToggles() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    messages: true,
    bookings: true,
    responses: true,
    system: true,
  })

  const toggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <ProfileCard title="Уведомления">
      <ul className="space-y-4">
        {ITEMS.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4">
            <span className="text-[14px] font-medium text-[var(--text-primary)]">{item.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={toggles[item.id]}
              onClick={() => toggle(item.id)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                toggles[item.id] ? 'bg-[var(--accent)]' : 'bg-[var(--bg-input)]'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                  toggles[item.id] ? 'left-6' : 'left-1'
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </ProfileCard>
  )
}
