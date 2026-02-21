export interface HostListingInput {
  id: string
  title?: string
  description?: string
  photosCount?: number
  price?: number
  city?: string
  district?: string
  floor?: number | null
  amenities?: string[]
  metroDistanceMin?: number | null
}

export interface HostListingAnalysis {
  score: number
  checks: Array<{ kind: 'good' | 'warn'; text: string }>
  recommendations: string[]
  completeness: number
}

export interface HostPriceSuggestion {
  averageDistrictPrice: number
  recommendedPrice: number
  reasons: string[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalizeText(v?: string): string {
  return (v ?? '').trim()
}

function computeCompleteness(input: HostListingInput): number {
  const fields = [
    Boolean(normalizeText(input.title)),
    Boolean(normalizeText(input.description)),
    (input.photosCount ?? 0) > 0,
    (input.price ?? 0) > 0,
    Boolean(normalizeText(input.city)),
    Boolean(normalizeText(input.district)),
    input.floor != null,
    (input.amenities?.length ?? 0) > 0,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

export function analyzeListing(input: HostListingInput): HostListingAnalysis {
  const checks: HostListingAnalysis['checks'] = []
  const recommendations: string[] = []
  let score = 60

  const title = normalizeText(input.title)
  const description = normalizeText(input.description)
  const photosCount = input.photosCount ?? 0
  const amenitiesCount = input.amenities?.length ?? 0

  if (title.length >= 18) {
    score += 6
    checks.push({ kind: 'good', text: 'Заголовок достаточно информативный' })
  } else {
    score -= 6
    checks.push({ kind: 'warn', text: 'Слабый заголовок' })
    recommendations.push('Уточните заголовок: добавьте район, формат жилья и ключевое преимущество')
  }

  if (description.length >= 180) {
    score += 10
    checks.push({ kind: 'good', text: 'Описание раскрывает объект' })
  } else {
    score -= 12
    checks.push({ kind: 'warn', text: 'Слабое описание' })
    recommendations.push('Улучшите описание: добавьте состояние, планировку, условия заселения')
  }

  if (photosCount >= 8) {
    score += 10
    checks.push({ kind: 'good', text: 'Достаточно фото' })
  } else if (photosCount >= 5) {
    score += 2
    checks.push({ kind: 'warn', text: 'Фото есть, но набор можно усилить' })
    recommendations.push('Добавьте 2-3 фото ключевых зон (кухня, санузел, вход)')
  } else {
    score -= 12
    checks.push({ kind: 'warn', text: 'Мало фото' })
    recommendations.push('Добавьте не менее 8 фото, включая кухню и санузел')
  }

  if ((input.price ?? 0) > 0) {
    score += 5
    checks.push({ kind: 'good', text: 'Цена указана' })
  } else {
    score -= 10
    checks.push({ kind: 'warn', text: 'Цена не заполнена' })
    recommendations.push('Укажите базовую цену — без неё конверсия ниже')
  }

  if (normalizeText(input.district)) {
    score += 4
    checks.push({ kind: 'good', text: 'Район указан' })
  } else {
    recommendations.push('Добавьте район — это повышает точность выдачи')
  }

  if (input.floor == null) {
    recommendations.push('Укажите этаж и этажность дома')
  }

  if (amenitiesCount < 4) {
    recommendations.push('Добавьте удобства: парковка, Wi-Fi, кондиционер, лифт')
  }

  if (input.metroDistanceMin == null) {
    recommendations.push('Уточните расстояние до метро/транспорта')
  }

  const completeness = computeCompleteness(input)
  score += Math.round((completeness - 60) / 8)

  return {
    score: clamp(Math.round(score), 10, 98),
    checks,
    recommendations: Array.from(new Set(recommendations)),
    completeness,
  }
}

export function suggestPrice(input: HostListingInput): HostPriceSuggestion {
  const base = 4200
  const districtBoost = normalizeText(input.district).toLowerCase().includes('центр') ? 350 : 0
  const photosBoost = (input.photosCount ?? 0) >= 8 ? 180 : 0
  const descriptionBoost = normalizeText(input.description).length >= 180 ? 120 : 0
  const metroBoost = (input.metroDistanceMin ?? 99) <= 12 ? 160 : 0

  const recommendedPrice = Math.round(base + districtBoost + photosBoost + descriptionBoost + metroBoost)
  const reasons: string[] = []
  if (districtBoost > 0) reasons.push('близко к центру')
  if (photosBoost > 0) reasons.push('хорошие фото')
  if (descriptionBoost > 0) reasons.push('подробное описание')
  if (metroBoost > 0) reasons.push('высокая транспортная доступность')
  if (!reasons.length) reasons.push('цена близка к среднерыночной для вашего сегмента')

  return {
    averageDistrictPrice: base + districtBoost,
    recommendedPrice,
    reasons,
  }
}

export function improveDescription(input: HostListingInput): string {
  const source = normalizeText(input.description)
  const title = normalizeText(input.title) || 'Уютная квартира'
  const district = normalizeText(input.district) || 'в удобном районе'
  const photos = input.photosCount ?? 0
  const amenities = input.amenities?.length ? input.amenities.slice(0, 4).join(', ') : 'базовые удобства'

  if (source.length >= 220) {
    return `${source}\n\nДополнительно: район ${district}, фото ${photos}, удобства: ${amenities}.`
  }

  return `${title} ${district}. Квартира аккуратная, готова к заселению, подходит для комфортного проживания.\n` +
    `В описании указаны ключевые параметры и условия аренды. Фото: ${photos}. Удобства: ${amenities}.\n` +
    `Рекомендуем заранее согласовать детали заселения и время просмотра.`
}
