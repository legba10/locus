'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative rounded-[12px] text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-100 transition-colors',
          isMobile ? 'w-10 h-10 flex items-center justify-center mr-3' : 'p-2'
        )}
        aria-label="Уведомления"
      >
        <Bell className={cn(isMobile ? 'w-6 h-6' : 'w-5 h-5')} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center transition-transform duration-200',
            badgePop && 'scale-110'
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className={cn('fixed inset-0 z-[9998] bg-black/35', !isMobile && 'bg-transparent')} onClick={() => setOpen(false)} aria-hidden />
          <div
            className={cn(
              isMobile
                ? 'fixed left-0 right-0 top-[60px] z-[9999] w-full max-h-[70vh] overflow-hidden rounded-t-[16px]'
                : 'absolute right-0 top-full mt-1 z-50 w-[320px] max-h-[360px] overflow-hidden rounded-[14px]',
              'bg-white shadow-lg border border-gray-100 flex flex-col',
              'dark:bg-[#111522]/95 dark:border-white/10 dark:backdrop-blur-xl'
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
                  Отметить всё
                </button>
              )}
            </div>
            <div className={cn('overflow-y-auto', isMobile ? 'max-h-[calc(70vh-96px)]' : 'max-h-[280px]')}>
              {list.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[#6B7280]">Нет уведомлений</div>
              ) : (
                <>
                  <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-[#9CA3AF]">Новые</div>
                  {list.filter((n) => !(n.isRead ?? n.read)).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        handleMarkRead(n.id)
                        setOpen(false)
                        if (n.link) router.push(n.link)
                      }}
                      className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors bg-violet-50/50"
                    >
                      <p className="text-[13px] font-medium text-[#1C1F26]">{n.title}</p>
                      {(n.text || n.body) && <p className="text-[12px] text-[#6B7280] mt-0.5 line-clamp-2">{n.text || n.body}</p>}
                      <p className="text-[11px] text-[#9CA3AF] mt-1">{new Date(n.createdAt).toLocaleString('ru')}</p>
                    </button>
                  ))}
                  <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-[#9CA3AF]">Старые</div>
                  {list.filter((n) => (n.isRead ?? n.read)).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        handleMarkRead(n.id)
                        setOpen(false)
                        if (n.link) router.push(n.link)
                      }}
                      className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-[13px] font-medium text-[#1C1F26]">{n.title}</p>
                      {(n.text || n.body) && <p className="text-[12px] text-[#6B7280] mt-0.5 line-clamp-2">{n.text || n.body}</p>}
                      <p className="text-[11px] text-[#9CA3AF] mt-1">{new Date(n.createdAt).toLocaleString('ru')}</p>
                    </button>
                  ))}
                </>
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
