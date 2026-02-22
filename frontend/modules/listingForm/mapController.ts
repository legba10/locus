export function buildMapQuery(parts: Array<string | null | undefined>): string {
  return parts.map((x) => (x ?? '').trim()).filter(Boolean).join(', ')
}

export function buildYandexMapsLink(query: string): string {
  if (!query) return '#'
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`
}

export function buildYandexMapsEmbed(query: string): string {
  if (!query) return ''
  return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(query)}&z=15`
}

export async function fetchYandexSuggestions(
  apiKey: string | undefined,
  query: string,
  mode: 'street' | 'house'
): Promise<string[]> {
  const q = query.trim()
  if (!apiKey || q.length < (mode === 'street' ? 2 : 1)) return []

  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${encodeURIComponent(apiKey)}&format=json&results=6&geocode=${encodeURIComponent(q)}`
    const res = await fetch(url)
    const data = await res.json()
    const collection = data?.response?.GeoObjectCollection?.featureMember ?? []
    const parsed = collection
      .map((x: any) => String(x?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.formatted ?? ''))
      .filter(Boolean)
      .map((line: string) => {
        if (mode === 'street') return line.split(',').slice(-2).join(',').trim()
        return line.split(',').pop()?.trim() ?? ''
      })
      .filter(Boolean)
    return Array.from(new Set(parsed)).slice(0, 6)
  } catch {
    return []
  }
}
