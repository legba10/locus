'use client'

import { useState, useEffect, memo } from 'react'

/** ТЗ-1: 6 фраз, после фразы — « в {город}». Premium-анимация, без прыжков. */
const PHRASES = [
  'подобранное для вас',
  'с AI',
  'без риэлторов',
  'быстрее',
  'в вашем районе',
  'по вашим параметрам',
]

const TYPE_SPEED_MS = 45
const PAUSE_AFTER_LINE_MS = 1600
const DELETE_SPEED_MS = 25
const PAUSE_BEFORE_NEW_MS = 400

interface HeroTypingProps {
  city?: string
}

function HeroTypingInner({ city = '' }: HeroTypingProps) {
  const [text, setText] = useState('')
  const [charIndex, setCharIndex] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const citySuffix = city?.trim() ? ` в ${city.trim()}` : ''
  const fullString = PHRASES[phraseIndex % PHRASES.length] + citySuffix

  /** ТЗ-1: при смене города — перезапуск текущей фразы с новым суффиксом */
  useEffect(() => {
    setText('')
    setCharIndex(0)
    setIsDeleting(false)
  }, [city?.trim()])

  useEffect(() => {
    if (!fullString) return

    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting) {
      if (charIndex < fullString.length) {
        timeout = setTimeout(() => {
          setText(fullString.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, TYPE_SPEED_MS)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_LINE_MS)
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setText(fullString.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, DELETE_SPEED_MS)
      } else {
        timeout = setTimeout(() => {
          setText('')
          setIsDeleting(false)
          setPhraseIndex((phraseIndex + 1) % PHRASES.length)
          setCharIndex(0)
        }, PAUSE_BEFORE_NEW_MS)
      }
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex, fullString])

  return (
    <span className="hero-typing-tz12 hero-typing-tz1 typing inline-block min-w-[2ch] text-left align-baseline">
      {text}
    </span>
  )
}

export const HeroTyping = memo(HeroTypingInner)
