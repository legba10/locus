'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import { track } from '@/shared/analytics/events'
import { NotificationsPanel } from '@/components/layout'

const NOTIFY_SOUND = '/sounds/notify.mp3'
const VAPID_PUBLIC = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : ''
const API_BASE = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : ''

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
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource,
  })
  const subscription = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  await apiFetchJson('/notifications/push-subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription: { endpoint: subscription.endpoint, keys: subscription.keys } }),
  })
  return null
}

export interface NotificationsBellProps {
  /** ТЗ-8: в header — только 8px dot, без числа */
  compactBadge?: boolean
}

export function NotificationsBell({ compactBadge = false }: NotificationsBellProps) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [badgePop, setBadgePop] = useState(false)
  const [list, setList] = useState<Array<{
    id: string
    type: string
    title: string
    text?: string | null
    body?: string | null
    link?: string | null
    isRead?: boolean
    isSeen?: boolean
    read?: boolean
    createdAt: string
  }>>([])
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
    if (typeof window === 'undefined') return
    const update = () => setIsMobile(window.innerWidth < 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  useEffect(() => {
    fetchCount()
    const t = setInterval(fetchCount, 20_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current > 0) {
      setBadgePop(true)
      setTimeout(() => setBadgePop(false), 220)
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

  useEffect(() => {
    if (open) document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [open])

  useEffect(() => {
    let sse: EventSource | null = null
    try {
      const streamUrl = `${API_BASE || ''}/api/notifications/stream`
      sse = new EventSource(streamUrl, { withCredentials: true })
      sse.onmessage = () => {
        fetchCount()
        fetchList()
      }
    } catch {}
    return () => {
      if (sse) sse.close()
    }
  }, [])

  useEffect(() => {
    apiFetch('/notifications/presence', {
      method: 'POST',
      body: JSON.stringify({ online: true }),
    }).catch(() => {})
    return () => {
      apiFetch('/notifications/presence', {
        method: 'POST',
        body: JSON.stringify({ online: false }),
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!open) return
    apiFetch('/notifications/seen-all', { method: 'POST' }).catch(() => {})
    fetchCount()
  }, [open])

  const handleMarkRead = async (id: string) => {
    try {
      await apiFetch('/notifications/read', { method: 'POST', body: JSON.stringify({ id }) })
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

  const handleEnablePush = useCallback(async () => {
    setPushStatus('loading')
    track('subscription_start', { channel: 'browser_push' })
    const err = await subscribeBrowserPush()
    setPushStatus(err === null ? 'ok' : err === 'no_vapid' ? 'no_vapid' : 'denied')
    if (err === null) track('subscription_success', { channel: 'browser_push' })
  }, [])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'notifications-bell-btn relative w-10 h-10 flex items-center justify-center rounded-[12px] hover:bg-[var(--accent-soft)] transition-colors shrink-0',
          badgePop && 'shake',
          isMobile && 'mr-1'
        )}
        aria-label="Уведомления"
      >
        <Bell className="w-5 h-5" strokeWidth={1.8} aria-hidden />
        {unreadCount > 0 && (
          <span
            className={cn(
              'notifications-badge absolute top-0.5 right-0.5 rounded-full font-bold flex items-center justify-center transition-transform duration-200',
              compactBadge && 'notifications-badge-compact min-w-[8px] w-[8px] h-[8px] text-[0]',
              !compactBadge && 'min-w-[18px] h-[18px] px-1 text-[11px] text-white',
              badgePop && 'scale-110'
            )}
            title={unreadCount > 0 ? `${unreadCount} непрочитанных` : undefined}
          >
            {compactBadge ? '' : (unreadCount > 99 ? '99+' : unreadCount)}
          </span>
        )}
      </button>
      <NotificationsPanel
        open={open}
        onClose={() => setOpen(false)}
        list={list}
        unreadCount={unreadCount}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        pushStatus={pushStatus}
        onEnablePush={handleEnablePush}
        isMobile={isMobile}
      />
    </div>
  )
}
