export interface ListingAnalyzerInput {
  title?: string
  description?: string
  basePrice?: number
  photosCount?: number
  hasKitchenPhoto?: boolean
  views?: number
  messages?: number
}

export interface ListingAnalyzerResult {
  score: number
  conversionChance: number
  tips: string[]
}

export function analyzeListing(listing: ListingAnalyzerInput): ListingAnalyzerResult {
  const photosCount = Number(listing.photosCount ?? 0)
  const descriptionLength = (listing.description ?? '').trim().length
  const basePrice = Number(listing.basePrice ?? 0)
  const views = Number(listing.views ?? 0)
  const messages = Number(listing.messages ?? 0)

  const tips: string[] = []
  let score = 7.8
  let conversionChance = 42

  if (photosCount < 5) {
    tips.push('Добавьте минимум 5 фото')
    score -= 0.6
  }

  if (!listing.hasKitchenPhoto) {
    tips.push('Добавьте фото кухни')
    score -= 0.4
  }

  if (descriptionLength < 200) {
    tips.push('Описание слишком короткое')
    score -= 0.5
  } else {
    tips.push('Опишите инфраструктуру рядом с домом')
  }

  if (basePrice > 12000) {
    tips.push('Цена выше рынка на 12%')
    score -= 0.3
  } else {
    tips.push('Снизьте цену на 5% для роста конверсии')
  }

  if (views > 20 && messages <= 1) {
    tips.push('Ответы арендаторам медленные')
    conversionChance -= 6
  }

  score = Math.max(5.5, Math.min(9.7, Number(score.toFixed(1))))
  conversionChance = Math.max(20, Math.min(88, Math.round(conversionChance)))

  return {
    score,
    conversionChance,
    tips: tips.slice(0, 6),
  }
}
