'use client'

import { useEffect, useState, useRef } from 'react'

const PREFIX = 'Найдите жильё, '
const PHRASES = [
  'которое подходит вам',
  'быстро и без стресса',
  'с умным подбором AI',
  'в нужном районе',
  'по вашему бюджету',
]

const TYPE_MS = 35
const ERASE_MS = 20
const PAUSE_AFTER_FULL_MS = 1200
const PAUSE_AFTER_ERASE_MS = 300

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function HeroTitle() {
  const [displayed, setDisplayed] = useState(PREFIX)
  const phraseIndexRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      while (!cancelled) {
        const phrase = PHRASES[phraseIndexRef.current]
        const fullText = PREFIX + phrase

        // 1. Type tail (prefix already shown; we add chars of phrase)
        for (let i = 1; i <= phrase.length; i++) {
          if (cancelled) return
          setDisplayed(fullText.slice(0, PREFIX.length + i))
          await delay(TYPE_MS)
        }

        // 2. Pause after full string
        await delay(PAUSE_AFTER_FULL_MS)
        if (cancelled) return

        // 3. Erase back to PREFIX
        for (let i = phrase.length; i >= 0; i--) {
          if (cancelled) return
          setDisplayed(PREFIX + phrase.slice(0, i))
          await delay(ERASE_MS)
        }

        // 4. Pause after erase
        await delay(PAUSE_AFTER_ERASE_MS)
        if (cancelled) return

        // 5. Next phrase
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
