export interface AiSearchFilters {
  city?: string
  budgetMin?: number
  budgetMax?: number
  guests?: number
  rooms?: number
  dateFrom?: string
  dateTo?: string
  preferences: string[]
}

export interface AiSearchInput {
  text?: string
  filters?: Partial<AiSearchFilters>
}

export interface AiListingCandidate {
  id: string
  city?: string
  district?: string
  title?: string
  description?: string
  price?: number
  rooms?: number
  rating?: number
  responseRate?: number
}

export interface AiSearchResult {
  parsed: AiSearchFilters
  items: Array<AiListingCandidate & { aiMatchScore: number }>
}

function extractNumber(text: string, rx: RegExp): number | undefined {
  const m = text.match(rx)
  if (!m?.[1]) return undefined
  const n = Number(m[1].replace(/[^\d]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

function parseTextToFilters(textRaw: string): Partial<AiSearchFilters> {
  const text = textRaw.toLowerCase()
  const parsed: Partial<AiSearchFilters> = { preferences: [] }

  const budgetMax =
    extractNumber(text, /до\s*([\d\s]+)/i) ??
    extractNumber(text, /бюджет\s*([\d\s]+)/i)
  if (budgetMax) parsed.budgetMax = budgetMax

  const rooms = extractNumber(text, /(\d+)\s*комн/i)
  if (rooms) parsed.rooms = rooms

  const guests = extractNumber(text, /(\d+)\s*(гост|чел|человек)/i)
  if (guests) parsed.guests = guests

  if (text.includes('сегодня')) {
    const today = new Date().toISOString().slice(0, 10)
    parsed.dateFrom = today
    parsed.dateTo = today
  }

  const cityHints = ['москва', 'санкт-петербург', 'питер', 'сочи', 'казань', 'екатеринбург', 'новосибирск']
  const hitCity = cityHints.find((c) => text.includes(c))
  if (hitCity) parsed.city = hitCity === 'питер' ? 'Санкт-Петербург' : hitCity[0].toUpperCase() + hitCity.slice(1)

  const preferences: string[] = []
  if (text.includes('центр')) preferences.push('центр')
  if (text.includes('метро')) preferences.push('рядом метро')
  if (text.includes('тихо')) preferences.push('тихо')
  if (text.includes('питом') || text.includes('животн')) preferences.push('можно с питомцем')
  parsed.preferences = preferences

  return parsed
}

function computeScore(item: AiListingCandidate, filters: AiSearchFilters): number {
  let score = 50
  if (filters.city && item.city && item.city.toLowerCase().includes(filters.city.toLowerCase())) score += 22
  if (typeof filters.budgetMax === 'number' && typeof item.price === 'number') {
    if (item.price <= filters.budgetMax) score += 18
    else score -= 12
  }
  if (typeof filters.rooms === 'number' && typeof item.rooms === 'number') {
    score += item.rooms === filters.rooms ? 14 : -5
  }
  if (filters.preferences.includes('центр') && item.district?.toLowerCase().includes('центр')) score += 8
  if (filters.preferences.includes('рядом метро') && /метро/i.test(`${item.title ?? ''} ${item.description ?? ''}`)) score += 6
  score += Math.round((item.rating ?? 0) * 2)
  score += Math.round((item.responseRate ?? 0) / 20)
  return Math.max(1, Math.min(99, score))
}

export function aiSearch(
  input: AiSearchInput,
  baseFilters: Partial<AiSearchFilters>,
  listings: AiListingCandidate[]
): AiSearchResult {
  const parsedFromText = parseTextToFilters(input.text ?? '')
  const parsed: AiSearchFilters = {
    city: input.filters?.city ?? baseFilters.city ?? parsedFromText.city,
    budgetMin: input.filters?.budgetMin ?? baseFilters.budgetMin ?? parsedFromText.budgetMin,
    budgetMax: input.filters?.budgetMax ?? baseFilters.budgetMax ?? parsedFromText.budgetMax,
    guests: input.filters?.guests ?? baseFilters.guests ?? parsedFromText.guests ?? 2,
    rooms: input.filters?.rooms ?? baseFilters.rooms ?? parsedFromText.rooms,
    dateFrom: input.filters?.dateFrom ?? baseFilters.dateFrom ?? parsedFromText.dateFrom,
    dateTo: input.filters?.dateTo ?? baseFilters.dateTo ?? parsedFromText.dateTo,
    preferences: Array.from(
      new Set([...(baseFilters.preferences ?? []), ...(parsedFromText.preferences ?? []), ...(input.filters?.preferences ?? [])])
    ),
  }

  const filtered = listings.filter((l) => {
    if (parsed.city && l.city && !l.city.toLowerCase().includes(parsed.city.toLowerCase())) return false
    if (typeof parsed.budgetMax === 'number' && typeof l.price === 'number' && l.price > parsed.budgetMax) return false
    if (typeof parsed.rooms === 'number' && typeof l.rooms === 'number' && l.rooms !== parsed.rooms) return false
    return true
  })

  const ranked = filtered
    .map((item) => ({ ...item, aiMatchScore: computeScore(item, parsed) }))
    .sort((a, b) => {
      if (b.aiMatchScore !== a.aiMatchScore) return b.aiMatchScore - a.aiMatchScore
      if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0)
      if ((b.responseRate ?? 0) !== (a.responseRate ?? 0)) return (b.responseRate ?? 0) - (a.responseRate ?? 0)
      return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER)
    })

  return { parsed, items: ranked }
}
