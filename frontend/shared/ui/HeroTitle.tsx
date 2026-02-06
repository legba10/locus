'use client'

import { useEffect, useState } from 'react'

const TEXT1 = 'Найдите жильё'
const TEXT2 = ', которое подходит вам'

export function HeroTitle() {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

      for (let i = 0; i <= TEXT1.length; i++) {
        if (cancelled) return
        setDisplayed(TEXT1.slice(0, i))
        await delay(35)
      }
      await delay(400)

      for (let i = 0; i <= TEXT2.length; i++) {
        if (cancelled) return
        setDisplayed(TEXT1 + TEXT2.slice(0, i))
        await delay(35)
      }
      await delay(1000)
      if (!cancelled) setDone(true)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <h1 className="hero-title">
      {displayed}
      {!done && <span className="hero-title-cursor" aria-hidden />}
    </h1>
  )
}
