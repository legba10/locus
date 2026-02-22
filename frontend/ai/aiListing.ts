'use client'

export interface AiListingInput {
  title: string
  description: string
  photosCount: number
  price: number
  city: string
  district?: string | null
  amenities: string[]
  typeLabel: string
}

export interface AiListingReview {
  score: number
  issues: string[]
  tips: string[]
  suggestedPrice: number
  improvedDescription: string
}

export function runListingAiMock(input: AiListingInput): AiListingReview {
  let score = 100
  const issues: string[] = []
  const tips: string[] = []

  if (input.photosCount < 5) {
    score -= 18
    issues.push('Мало фото')
    tips.push('Добавьте минимум 5-7 фото, включая кухню и ванную')
  }
  if (input.description.trim().length < 120) {
    score -= 14
    issues.push('Описание слабое')
    tips.push('Расширьте описание: транспорт, инфраструктура, состояние квартиры')
  }
  if (input.price > 120000) {
    score -= 8
    issues.push('Цена может быть завышена')
    tips.push('Проверьте цену по району и рассмотрите снижение на 5%')
  }

  const suggestedPrice = Math.max(1000, Math.round(input.price * 0.95))
  const improvedDescription = [
    `${input.typeLabel} в ${input.city}${input.district ? `, район ${input.district}` : ''}.`,
    `Жилье подготовлено для комфортного заезда, удобная локация и продуманная планировка.`,
    input.amenities.length ? `Удобства: ${input.amenities.slice(0, 6).join(', ')}.` : 'Есть базовые удобства для проживания.',
    `Актуальная цена: ${input.price.toLocaleString('ru-RU')} ₽.`,
  ].join(' ')

  return {
    score: Math.max(40, score),
    issues,
    tips,
    suggestedPrice,
    improvedDescription,
  }
}
