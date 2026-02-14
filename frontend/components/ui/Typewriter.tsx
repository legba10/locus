'use client'

import { useState, useEffect, useRef, memo } from 'react'

const PHRASES = [
  'Быстрее с AI',
  'Без риелторов',
  'По вашему бюджету',
  'В нужном районе',
]

const TYPE_MS = 40
const ERASE_MS = 20
const PAUSE_MS = 1200

/**
 * ТЗ-3: typewriter — один state, один useEffect, таймер в ref, cleanup.
 * Печать → пауза → стирание → следующая фраза. Не триггерит родителя.
 */
function TypewriterInner() {
  const [text, setText] = useState('')
  const phraseIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const isDeletingRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const schedule = (ms: number, fn: () => void) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(fn, ms)
    }

    const tick = () => {
      const phrase = PHRASES[phraseIndexRef.current % PHRASES.length]
      const isDeleting = isDeletingRef.current

      if (!isDeleting) {
        if (charIndexRef.current < phrase.length) {
          charIndexRef.current += 1
          setText(phrase.slice(0, charIndexRef.current))
          schedule(TYPE_MS, tick)
        } else {
          schedule(PAUSE_MS, () => {
            isDeletingRef.current = true
            schedule(ERASE_MS, tick)
          })
        }
      } else {
        if (charIndexRef.current > 0) {
          charIndexRef.current -= 1
          setText(phrase.slice(0, charIndexRef.current))
          schedule(ERASE_MS, tick)
        } else {
          isDeletingRef.current = false
          phraseIndexRef.current += 1
          schedule(TYPE_MS, tick)
        }
      }
    }

    schedule(TYPE_MS, tick)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  return (
    <span className="text-indigo-400 font-medium tracking-wide">
      {text}
      <span className="animate-pulse" aria-hidden>|</span>
    </span>
  )
}

export const Typewriter = memo(TypewriterInner)
