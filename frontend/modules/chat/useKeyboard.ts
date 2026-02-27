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
      /* TZ-61: iOS — при открытой клавиатуре подгоняем высоту body под visualViewport */
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.height = offset > 0 ? `${vv.height}px` : ''
      }
    }

    updateOffset()
    vv.addEventListener('resize', updateOffset)
    vv.addEventListener('scroll', updateOffset)
    return () => {
      vv.removeEventListener('resize', updateOffset)
      vv.removeEventListener('scroll', updateOffset)
      setKeyboardOffsetCSS(0)
      if (typeof document !== 'undefined' && document.body) document.body.style.height = ''
    }
  }, [])

  return { keyboardOffset }
}
