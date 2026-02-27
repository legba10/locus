'use client'

import { useEffect, useRef, useState } from 'react'

/** TZ-58: --keyboard-offset на document для padding-bottom чата (iOS клавиатура). */
function setKeyboardOffsetCSS(px: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--keyboard-offset', `${px}px`)
}

export interface UseKeyboardOptions {
  /** TZ-64: контейнер чата — при открытой клавиатуре задаём ему height = visualViewport.height */
  containerRef?: React.RefObject<HTMLElement | null>
}

export function useKeyboard(options: UseKeyboardOptions = {}) {
  const { containerRef } = options
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - vv.height)
      setKeyboardOffset(offset)
      setKeyboardOffsetCSS(offset)
      /* TZ-61: body height для iOS */
      if (document.body) {
        document.body.style.height = offset > 0 ? `${vv.height}px` : ''
      }
      /* TZ-64: высота контейнера чата = visualViewport, чтобы не ломало layout */
      const el = containerRef?.current ?? document.querySelector<HTMLElement>('.chat-container')
      if (el) {
        el.style.height = offset > 0 ? `${vv.height}px` : ''
      }
    }

    updateOffset()
    vv.addEventListener('resize', updateOffset)
    vv.addEventListener('scroll', updateOffset)
    return () => {
      vv.removeEventListener('resize', updateOffset)
      vv.removeEventListener('scroll', updateOffset)
      setKeyboardOffsetCSS(0)
      if (document.body) document.body.style.height = ''
      const el = containerRef?.current ?? document.querySelector<HTMLElement>('.chat-container')
      if (el) el.style.height = ''
    }
  }, [containerRef])

  return { keyboardOffset }
}
