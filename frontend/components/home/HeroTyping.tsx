'use client'

import { useState, useEffect, memo } from 'react'
import { cityIn } from '@/shared/lib/cityDeclension'

/** Жёсткое ТЗ: массив полных фраз, {city} подставляется склонённым городом (в Москве, в Сургуте). */
const PHRASE_TEMPLATES = [
  'Найдите жильё, подобранное для вас {city}',
  'Найдите жильё с AI {city}',
  'Найдите жильё без риэлторов {city}',
  'Найдите жильё рядом с вами {city}',
  'Найдите жильё быстрее {city}',
  'Найдите жильё под ваш бюджет {city}',
]

const TYPE_SPEED_MS = 70
const PAUSE_AFTER_LINE_MS = 2000
const DELETE_SPEED_MS = 40
const PAUSE_BEFORE_NEW_MS = 800

interface HeroTypingProps {
  city?: string
}

function HeroTypingInner({ city = '' }: HeroTypingProps) {
  const [text, setText] = useState('')
  const [charIndex, setCharIndex] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const cityPhrase = city?.trim() ? cityIn(city.trim()) : 'в вашем городе'
  const fullString = PHRASE_TEMPLATES[phraseIndex % PHRASE_TEMPLATES.length].replace('{city}', cityPhrase)

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
          setPhraseIndex((phraseIndex + 1) % PHRASE_TEMPLATES.length)
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
