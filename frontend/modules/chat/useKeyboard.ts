'use client'

import { useEffect, useState } from 'react'

/** TZ-58: --keyboard-offset на document для padding-bottom чата (iOS клавиатура). */
function setKeyboardOffsetCSS(px: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--keyboard-offset', `${px}px`)
}

export function useKeyboard() {
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - vv.height)
      setKeyboardOffset(offset)
      setKeyboardOffsetCSS(offset)
    }

    updateOffset()
    vv.addEventListener('resize', updateOffset)
    vv.addEventListener('scroll', updateOffset)
    return () => {
      vv.removeEventListener('resize', updateOffset)
      vv.removeEventListener('scroll', updateOffset)
      setKeyboardOffsetCSS(0)
    }
  }, [])

  return { keyboardOffset }
}
