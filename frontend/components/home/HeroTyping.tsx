'use client'

import { useState, useEffect, useRef, memo } from 'react'

/** ТЗ-3 + ТЗ-20: фразы по ТЗ (включая «Проверенные объявления», «За 7 кликов»), скорость 60ms */
const PHRASES = [
  'Без риелторов',
  'Быстрее с AI',
  'Проверенные объявления',
  'Под ваш бюджет',
  'В нужном районе',
  'За 7 кликов',
]

const SPEED_MS = 60
const PAUSE_MS = 1800
const DELETE_SPEED_MS = 35

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
    <span className="hero-typing-tz20 inline-flex items-center justify-center gap-0.5 text-[var(--accent)] font-medium tracking-wide">
      <span className="min-w-[2ch] text-left">{text}</span>
      <span className="hero-typing-cursor inline-block w-[2px] h-[1em] bg-[var(--accent)] animate-pulse shrink-0" aria-hidden />
    </span>
  )
}

export const HeroTyping = memo(HeroTypingInner)
