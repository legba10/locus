export interface AiDescriptionInput {
  city: string
  district: string
  street: string
  typeLabel: string
  amenities: string[]
  price: string
  photosCount: number
}

export interface AiDescriptionPack {
  short: string
  sales: string
  advantages: string
}

export function buildAiDescription(input: AiDescriptionInput): AiDescriptionPack {
  const location = [input.city, input.district, input.street].filter(Boolean).join(', ')
  const areaPart = location ? `в районе ${location}` : 'в удобной локации'
  const amenityPart = input.amenities.length
    ? `Из удобств: ${input.amenities.slice(0, 6).join(', ')}.`
    : 'Есть базовые удобства для комфортного проживания.'
  const pricePart = input.price ? `Цена: ${input.price} ₽.` : ''

  return {
    short: `${input.typeLabel} ${areaPart}. ${input.photosCount} фото, аккуратное состояние, быстрый заезд.`,
    sales: `${input.typeLabel} ${areaPart}. ${amenityPart} ${pricePart} Отличный вариант для долгосрочной аренды: продуманная планировка, удобная инфраструктура рядом и комфортные условия для жизни.`,
    advantages: [
      'Преимущества:',
      `- Удобный адрес: ${location || 'рядом с ключевой инфраструктурой'}`,
      `- Готовность к просмотру: ${input.photosCount} фото`,
      `- Формат жилья: ${input.typeLabel}`,
      `- Условия: ${input.price ? `${input.price} ₽` : 'обсуждаемые'}`,
    ].join('\n'),
  }
}
