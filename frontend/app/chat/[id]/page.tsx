'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/domains/auth'

/** ТЗ-7: Единая система сообщений — все чаты только на /messages. Редирект старых ссылок /chat/[id]. */
export default function ChatPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params?.id ?? ''
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!id) {
      router.replace('/messages')
      return
    }
    if (!isAuthenticated()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(`/messages?chat=${id}`)}`)
      return
    }
    const checkIn = searchParams.get('checkIn') ?? ''
    const checkOut = searchParams.get('checkOut') ?? ''
    const q = new URLSearchParams({ chat: id })
    if (checkIn) q.set('checkIn', checkIn)
    if (checkOut) q.set('checkOut', checkOut)
    router.replace(`/messages?${q.toString()}`)
  }, [id, router, isAuthenticated, searchParams])

  return null
}
