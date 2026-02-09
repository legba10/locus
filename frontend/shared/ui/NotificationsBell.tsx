'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'

const NOTIFY_SOUND = '/sounds/notify.mp3'
const VAPID_PUBLIC = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : ''

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

async function subscribeBrowserPush(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return null
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return null
  const reg = await navigator.serviceWorker.register('/sw.js')
  await reg.update()
  if (!VAPID_PUBLIC) return 'no_vapid'
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
  })
  const subscription = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  await apiFetchJson('/notifications/push-subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription: { endpoint: subscription.endpoint, keys: subscription.keys } }),
  })
  return null
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<Array<{ id: string; type: string; title: string; body?: string | null; read: boolean; createdAt: string }>>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'ok' | 'denied' | 'no_vapid'>('idle')
  const prevCountRef = useRef<number>(0)

  const fetchCount = async () => {
    try {
      const res = await apiFetch<{ count: number }>('/notifications/unread-count')
      setUnreadCount(res?.count ?? 0)
    } catch {
      setUnreadCount(0)
    }
  }

  const fetchList = async () => {
    try {
      const items = await apiFetch<typeof list>('/notifications')
      setList(Array.isArray(items) ? items : [])
    } catch {
      setList([])
    }
  }

  useEffect(() => {
    fetchCount()
    const t = setInterval(fetchCount, 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current > 0) {
      try {
        const audio = new Audio(NOTIFY_SOUND)
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch {}
    }
    prevCountRef.current = unreadCount
  }, [unreadCount])

  useEffect(() => {
    if (open) fetchList()
  }, [open])

  const handleMarkRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' })
      fetchCount()
      fetchList()
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'POST' })
      setUnreadCount(0)
      fetchList()
    } catch {}
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-[12px] text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-100 transition-colors"
        aria-label="Уведомления"
      >
        <Bell className="w-5 h-5" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            className={cn(
              'absolute right-0 top-full mt-1 z-50 w-[320px] max-h-[360px] overflow-hidden',
              'bg-white rounded-[14px] shadow-lg border border-gray-100',
              'flex flex-col'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-[14px] font-semibold text-[#1C1F26]">Уведомления</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[12px] text-violet-600 hover:text-violet-700"
                >
                  Прочитать все
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[280px]">
              {list.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[#6B7280]">Нет уведомлений</div>
              ) : (
                list.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { handleMarkRead(n.id); setOpen(false) }}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                      !n.read && 'bg-violet-50/50'
                    )}
                  >
                    <p className="text-[13px] font-medium text-[#1C1F26]">{n.title}</p>
                    {n.body && <p className="text-[12px] text-[#6B7280] mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[11px] text-[#9CA3AF] mt-1">{new Date(n.createdAt).toLocaleString('ru')}</p>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                disabled={pushStatus === 'loading' || !('Notification' in window)}
                onClick={async () => {
                  setPushStatus('loading')
                  const err = await subscribeBrowserPush()
                  setPushStatus(err === null ? 'ok' : err === 'no_vapid' ? 'no_vapid' : 'denied')
                }}
                className="text-[12px] text-violet-600 hover:text-violet-700 disabled:opacity-50"
              >
                {pushStatus === 'loading' ? '…' : pushStatus === 'ok' ? 'Браузерные уведомления включены' : pushStatus === 'no_vapid' ? 'Нужны VAPID ключи' : 'Включить уведомления в браузере'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
