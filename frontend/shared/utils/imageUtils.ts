/**
 * Утилиты для работы с изображениями
 */

/**
 * Получить URL изображения с fallback на локальный placeholder
 */
export function getImageUrl(
  imageUrl: string | null | undefined,
  placeholder?: string
): string {
  const defaultPlaceholder = '/listing-placeholder.svg'

  if (!imageUrl) {
    return placeholder || defaultPlaceholder
  }

  try {
    // Для внешних URL проверяем, что строка валидная
    new URL(imageUrl)
    return imageUrl
  } catch {
    // Если URL некорректный — используем локальный placeholder
    return placeholder || defaultPlaceholder
  }
}

/**
 * Проверить, является ли строка валидным внешним URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Получить placeholder изображение (локальный)
 */
export function getPlaceholderImage(_id: string): string {
  // Один локальный placeholder, без зависимостей от внешних сервисов
  return '/listing-placeholder.svg'
}

