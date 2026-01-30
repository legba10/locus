/**
 * LocusInsight — единый формат AI-анализа
 * 
 * Принцип: максимум 6 полей, всё понятно без объяснений
 */

export interface LocusInsight {
  /** Оценка 0-100 */
  score: number
  
  /** Текстовая оценка */
  label: 'Отличный' | 'Хороший' | 'Средний' | 'Слабый'
  
  /** Краткий вывод (1 предложение) */
  summary: string
  
  /** Разница с рынком в % */
  priceDiffPercent: number
  
  /** Уровень спроса */
  demandLevel: 'низкий' | 'средний' | 'высокий'
  
  /** Главный совет (1 строка) */
  mainTip: string
}

/**
 * Получить label по score
 */
export function getInsightLabel(score: number): LocusInsight['label'] {
  if (score >= 80) return 'Отличный'
  if (score >= 60) return 'Хороший'
  if (score >= 40) return 'Средний'
  return 'Слабый'
}

/**
 * Получить цвет по label
 */
export function getInsightColor(label: LocusInsight['label']) {
  switch (label) {
    case 'Отличный': return { bg: 'bg-emerald-500', text: 'text-white' }
    case 'Хороший': return { bg: 'bg-blue-500', text: 'text-white' }
    case 'Средний': return { bg: 'bg-amber-500', text: 'text-white' }
    case 'Слабый': return { bg: 'bg-gray-400', text: 'text-white' }
  }
}

/**
 * Форматировать разницу цены
 */
export function formatPriceDiff(diff: number): string {
  if (diff < -5) return `Ниже рынка на ${Math.abs(diff)}%`
  if (diff > 5) return `Выше рынка на ${diff}%`
  return 'По рынку'
}
