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
  const patch: Partial<SearchStoreState['filters']> = { aiMode: true }
  if (answers.city.trim()) patch.city = answers.city.trim()
  if (answers.budget != null) patch.priceTo = answers.budget
  if (answers.duration) patch.rentType = answers.duration
  if (answers.people != null) {
    patch.rooms = Math.max(1, Math.min(answers.people, 4))
    patch.guests = Math.max(1, answers.people)
  }
  if (answers.pets) patch.pets = true
  if (answers.when === 'dates' && answers.checkIn && answers.checkOut) {
    patch.dates = { checkIn: answers.checkIn, checkOut: answers.checkOut }
  }
  if (answers.type) patch.type = answers.type
  return { filters: patch }
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
