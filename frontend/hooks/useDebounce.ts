'use client'

import { useEffect, useState } from 'react'

/**
 * TZ-67: debounce значения для поиска/фильтров — не обновлять на каждый символ.
 * @param value — текущее значение
 * @param delayMs — задержка (например 400)
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}
