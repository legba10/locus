'use client'

import { useState, useEffect, memo } from 'react'

/** ТЗ-16/ТЗ-21: фразы только хвост после «Найдите жильё,» — спокойная печать, читабельно */
const PHRASES = [
  'которое подходит вам.',
  'быстрее с AI.',
  'без риэлторов.',
  'под ваш бюджет.',
  'рядом с работой.',
  'для отдыха.',
  'на любой срок.',
]

const TYPE_SPEED_MS = 45
const DELETE_SPEED_MS = 25
const PAUSE_MS = 1400

function HeroTypingInner() {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = PHRASES[phraseIndex % PHRASES.length]
    if (!current) return

    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting) {
      if (index < current.length) {
        timeout = setTimeout(() => {
          setText(current.substring(0, index + 1))
          setIndex(index + 1)
        }, TYPE_SPEED_MS)
      } else {
        timeout = setTimeout(() => setIsDeleting(true), PAUSE_MS)
      }
    } else {
      if (index > 0) {
        timeout = setTimeout(() => {
          setText(current.substring(0, index - 1))
          setIndex(index - 1)
        }, DELETE_SPEED_MS)
      } else {
        timeout = setTimeout(() => {
          setText('')
          setIsDeleting(false)
          setPhraseIndex((phraseIndex + 1) % PHRASES.length)
          setIndex(0)
        }, DELETE_SPEED_MS)
      }
    }

    return () => clearTimeout(timeout)
  }, [index, isDeleting, phraseIndex])

  return <span className="hero-typing-tz12 typing min-w-[2ch] text-left">{text}</span>
}

export const HeroTyping = memo(HeroTypingInner)
