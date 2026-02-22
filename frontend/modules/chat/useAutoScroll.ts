'use client'

import { useCallback, useRef } from 'react'

export function useAutoScroll() {
  const listRef = useRef<HTMLDivElement | null>(null)
  const nearBottomRef = useRef(true)

  const onScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    nearBottomRef.current = distance < 80
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  const scrollOnNewMessage = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (nearBottomRef.current) scrollToBottom(behavior)
  }, [scrollToBottom])

  return {
    listRef,
    onScroll,
    scrollToBottom,
    scrollOnNewMessage,
    nearBottomRef,
  }
}
