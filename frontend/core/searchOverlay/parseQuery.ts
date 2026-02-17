/**
 * ТЗ-2: простой парсер текстового запроса — город, тип жилья, цена.
 * Без AI. Примеры: "1 комнатная москва сегодня", "студия до 40", "сургут 2к".
 */
export interface ParsedQuery {
  city: string | null
  type: string | null
  rooms: number | null
  priceMax: number | null
  priceMin: number | null
}

const CITY_WORDS = new Set([
  'москва', 'санкт-петербург', 'спб', 'сургут', 'новосибирск', 'екатеринбург',
  'казань', 'нижний', 'сочи', 'краснодар', 'ростов', 'самара', 'воронеж', 'уфа',
])
const TYPE_WORDS: Record<string, string> = {
  'студия': 'studio',
  'квартира': 'apartment',
  'комната': 'room',
  'комнатная': 'room',
  'дом': 'house',
}
const ROOM_PATTERN = /(\d)\s*[кk]|(\d)\s*комнат/i
const PRICE_PATTERN = /до\s*(\d+)|(\d+)\s*-\s*(\d+)|от\s*(\d+)/i

export function parseSearchQuery(q: string): ParsedQuery {
  const s = (q || '').trim().toLowerCase()
  const result: ParsedQuery = { city: null, type: null, rooms: null, priceMax: null, priceMin: null }

  const tokens = s.split(/\s+/).filter(Boolean)
  for (const t of tokens) {
    const clean = t.replace(/[,\s]/g, '')
    if (CITY_WORDS.has(clean) || CITY_WORDS.has(t)) {
      result.city = t
      continue
    }
    for (const [ru, type] of Object.entries(TYPE_WORDS)) {
      if (t.includes(ru)) {
        result.type = type
        break
      }
    }
  }

  const roomMatch = s.match(ROOM_PATTERN)
  if (roomMatch) {
    const n = parseInt(roomMatch[1] || roomMatch[2] || '0', 10)
    if (n >= 1 && n <= 4) result.rooms = n
  }

  const priceMatch = s.match(PRICE_PATTERN)
  if (priceMatch) {
    if (priceMatch[1]) {
      const v = parseInt(priceMatch[1], 10)
      result.priceMax = v < 1000 ? v * 1000 : v
    } else if (priceMatch[2] && priceMatch[3]) {
      let a = parseInt(priceMatch[2], 10)
      let b = parseInt(priceMatch[3], 10)
      if (a < 1000) a *= 1000
      if (b < 1000) b *= 1000
      result.priceMin = Math.min(a, b)
      result.priceMax = Math.max(a, b)
    } else if (priceMatch[4]) {
      let v = parseInt(priceMatch[4], 10)
      result.priceMin = v < 1000 ? v * 1000 : v
    }
  }

  return result
}
