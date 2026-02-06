'use client'

import { useEffect, useState, useRef } from 'react'

const BASE = 'Найдите жильё,'
const PHRASES = [
  ' которое подходит вам',
  ' быстрее с AI',
  ' под ваш бюджет',
]

const TYPE_MS = 55
const ERASE_MS = 35
const PAUSE_AFTER_FULL_MS = 1400
const PAUSE_AFTER_ERASE_MS = 300

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function HeroTitle() {
  const [displayed, setDisplayed] = useState(BASE)
  const phraseIndexRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      while (!cancelled) {
        const phrase = PHRASES[phraseIndexRef.current]
        const fullText = BASE + phrase

        // 1. Type phrase (base already shown)
        for (let i = 1; i <= phrase.length; i++) {
          if (cancelled) return
          setDisplayed(BASE + phrase.slice(0, i))
          await delay(TYPE_MS)
        }

        // 2. Pause 1200ms after full string
        await delay(PAUSE_AFTER_FULL_MS)
        if (cancelled) return

        // 3. Erase back to BASE
        for (let i = phrase.length - 1; i >= 0; i--) {
          if (cancelled) return
          setDisplayed(BASE + phrase.slice(0, i))
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
      {displayed}
      <span className="hero-title-cursor" aria-hidden />
    </h1>
  )
}
