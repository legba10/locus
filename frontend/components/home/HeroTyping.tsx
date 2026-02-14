'use client'

import { useState, useEffect, useRef, memo } from 'react'

const PHRASES = [
  'Быстрее с AI',
  'Без риелторов',
  'Под ваш бюджет',
  'Проверенные объявления',
  'В нужном районе',
  'Без переплат',
]

const SPEED_MS = 40
const PAUSE_MS = 1200
const DELETE_SPEED_MS = 25

/**
 * ТЗ-1: печать подзаголовка в hero — тип → пауза → удаление → следующая фраза.
 * speed 40ms, pause 1200ms, deleteSpeed 25ms. Бесконечный цикл.
 */
function HeroTypingInner() {
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
          schedule(SPEED_MS, tick)
        } else {
          schedule(PAUSE_MS, () => {
            isDeletingRef.current = true
            schedule(DELETE_SPEED_MS, tick)
          })
        }
      } else {
        if (charIndexRef.current > 0) {
          charIndexRef.current -= 1
          setText(phrase.slice(0, charIndexRef.current))
          schedule(DELETE_SPEED_MS, tick)
        } else {
          isDeletingRef.current = false
          phraseIndexRef.current += 1
          schedule(SPEED_MS, tick)
        }
      }
    }

    schedule(SPEED_MS, tick)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  return (
    <span className="text-[var(--color-primary,#8B5CF6)] font-medium tracking-wide">
      {text}
      <span className="animate-pulse" aria-hidden>|</span>
    </span>
  )
}

export const HeroTyping = memo(HeroTypingInner)
