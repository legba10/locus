'use client'

import type { SearchStoreState } from '@/search/searchStore'

export interface AiSearchAnswers {
  city: string
  budget: number | null
  duration: string | null
  people: number | null
  pets: boolean
  when: 'today' | 'dates' | null
  checkIn?: string
  checkOut?: string
  type?: string | null
}

export const AI_SEARCH_QUICK_HINTS = [
  'сегодня',
  'рядом',
  'до 50к',
  'с животными',
  'на месяц',
  'студия',
] as const

export function buildSearchStorePatchFromAi(answers: AiSearchAnswers): Partial<SearchStoreState> {
  return {
    city: answers.city || null,
    priceMax: answers.budget ?? null,
    duration: answers.duration ?? null,
    rooms: answers.people != null ? Math.max(1, Math.min(answers.people, 4)) : null,
    pets: answers.pets,
    dates:
      answers.when === 'dates' && answers.checkIn && answers.checkOut
        ? { checkIn: answers.checkIn, checkOut: answers.checkOut }
        : null,
    aiMode: true,
    type: answers.type ?? null,
  }
}

export function parseQuickHintToAi(quick: string): Partial<AiSearchAnswers> {
  const q = quick.toLowerCase()
  const out: Partial<AiSearchAnswers> = {}
  if (q.includes('сегодня')) out.when = 'today'
  if (q.includes('живот')) out.pets = true
  if (q.includes('месяц')) out.duration = 'long'
  if (q.includes('студия')) out.type = 'studio'
  if (q.includes('50')) out.budget = 50000
  return out
}
