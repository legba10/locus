'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { cn } from '@/shared/utils/cn'
import IconButton from '@/components/ui/IconButton'
import { track } from '@/shared/analytics/events'
import { NotificationsPanel } from '@/components/layout'
import { playSound, type SoundType } from '@/lib/system/soundManager'
import { playMessageSoundWhenAllowed } from '@/modules/chat/soundController'
import { soundService } from '@/services/soundService'

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

function extractChatIdFromLink(link?: string | null): string | null {
  if (!link) return null
  try {
    const parsed = link.startsWith('http')
      ? new URL(link)
      : new URL(link, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (parsed.pathname.startsWith('/messages')) return parsed.searchParams.get('chat')
    if (parsed.pathname.startsWith('/chat/')) {
      const part = parsed.pathname.split('/').filter(Boolean)[1]
      return part ?? null
    }
    return null
  } catch {
    return null
  }
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
  const lastSoundNotificationIdRef = useRef<string | null>(null)

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
      const normalized = Array.isArray(items) ? items : []
      setList(normalized)
      return normalized
    } catch {
      setList([])
      return []
    }
  }

  const detectSoundType = (n?: { type?: string; title?: string; text?: string | null; body?: string | null }): SoundType => {
    const haystack = `${n?.type ?? ''} ${n?.title ?? ''} ${n?.text ?? ''} ${n?.body ?? ''}`.toLowerCase()
    if (haystack.includes('message') || haystack.includes('сообщ')) return 'message'
    if (haystack.includes('booking') || haystack.includes('бронир')) return 'booking'
    if (
      haystack.includes('reject') ||
      haystack.includes('отклон') ||
      haystack.includes('error') ||
      haystack.includes('ошиб') ||
      haystack.includes('payment_failed') ||
      haystack.includes('оплата не прошла')
    ) return 'error'
    if (
      haystack.includes('payment_success') ||
      haystack.includes('оплата успешна') ||
      haystack.includes('published') ||
      haystack.includes('одобр')
    ) return 'success'
    return 'success'
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
    soundService.bindUnlockOnFirstInteraction()
  }, [])

  useEffect(() => {
    const prev = prevCountRef.current
    if (unreadCount > prev && prev >= 0) {
      setBadgePop(true)
      setTimeout(() => setBadgePop(false), 220)
      void (async () => {
        const items = await fetchList()
        const newestUnread = items.find((x) => !(x.isRead ?? x.read))
        if (!newestUnread) return
        if (lastSoundNotificationIdRef.current === newestUnread.id) return
        lastSoundNotificationIdRef.current = newestUnread.id
        const soundType = detectSoundType(newestUnread)
        if (soundType === 'message') {
          const incomingChatId = extractChatIdFromLink(newestUnread.link)
          const current = typeof window !== 'undefined' ? new URL(window.location.href) : null
          const activeChatId = current?.pathname.startsWith('/messages') ? current.searchParams.get('chat') : null
          if (incomingChatId) {
            playMessageSoundWhenAllowed({
              incomingChatId,
              activeChatId,
              senderId: 'other',
              currentUserId: 'me',
            })
          }
          return
        }
        if (soundType === 'booking' || soundType === 'success' || soundType === 'error') {
          soundService.playNotify()
          return
        }
        playSound(soundType)
      })()
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

  // Временно отключено: 401 на /api/notifications/stream ломает консоль на /messages
  // useEffect(() => {
  //   let sse: EventSource | null = null
  //   try {
  //     const streamUrl = `${API_BASE || ''}/api/notifications/stream`
  //     sse = new EventSource(streamUrl, { withCredentials: true })
  //     sse.onmessage = () => {
  //       fetchCount()
  //       fetchList()
  //     }
  //   } catch {}
  //   return () => {
  //     if (sse) sse.close()
  //   }
  // }, [])

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
      <IconButton
        onClick={() => setOpen((o) => !o)}
        ariaLabel="Уведомления"
        className={cn(
          'notifications-bell-btn relative',
          badgePop && 'shake',
          isMobile && 'mr-0'
        )}
      >
        <Bell className="w-5 h-5" strokeWidth={1.8} aria-hidden />
        {unreadCount > 0 && (
          <span
            className={cn(
              'notifications-badge absolute top-0.5 right-0.5 rounded-full font-bold flex items-center justify-center transition-transform duration-200',
              compactBadge && 'notifications-badge-compact min-w-[8px] w-[8px] h-[8px] text-[0]',
              !compactBadge && 'min-w-[18px] h-[18px] px-1 text-[11px] text-[var(--text-on-accent)]',
              badgePop && 'scale-110'
            )}
            title={unreadCount > 0 ? `${unreadCount} непрочитанных` : undefined}
          >
            {compactBadge ? '' : (unreadCount > 99 ? '99+' : unreadCount)}
          </span>
        )}
      </IconButton>
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
