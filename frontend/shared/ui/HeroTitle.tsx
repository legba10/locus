'use client'

import { useEffect, useState, useRef } from 'react'

const BASE_LINE = 'Найдите жильё,'
const PHRASES = ['под ваш бюджет', 'которое подходит вам', 'быстрее с AI']

// Per spec:
// typing: 55ms, delete: 35ms, pause: 1600ms
const TYPE_MS = 55
const ERASE_MS = 35
const PAUSE_AFTER_FULL_MS = 1600
const PAUSE_AFTER_ERASE_MS = 200

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function HeroTitle() {
  // We keep the first line static and animate only the second line
  const [secondLine, setSecondLine] = useState('')
  const phraseIndexRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      while (!cancelled) {
        const phrase = PHRASES[phraseIndexRef.current]

        // 1. Type phrase
        for (let i = 1; i <= phrase.length; i += 1) {
          if (cancelled) return
          setSecondLine(phrase.slice(0, i))
          await delay(TYPE_MS)
        }

        // 2. Pause after full phrase
        await delay(PAUSE_AFTER_FULL_MS)
        if (cancelled) return

        // 3. Erase back to empty second line
        for (let i = phrase.length - 1; i >= 0; i -= 1) {
          if (cancelled) return
          setSecondLine(phrase.slice(0, i))
          await delay(ERASE_MS)
        }

        // 4. Pause after erase
        await delay(PAUSE_AFTER_ERASE_MS)
        if (cancelled) return

        phraseIndexRef.current = (phraseIndexRef.current + 1) % PHRASES.length
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <h1 className="hero-title hero-title-fixed-height">
      <span>{BASE_LINE}</span>
      <br />
      <span>
        {secondLine}
        <span className="hero-title-cursor" aria-hidden />
      </span>
    </h1>
  )
}
