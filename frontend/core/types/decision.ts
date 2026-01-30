/**
 * LOCUS Decision Types
 * 
 * Единый формат AI решения для всего UI.
 * Используется в карточках, страницах, поиске.
 */

import type { VerdictType, ReasonType, DemandLevel } from '../i18n/ru'

/**
 * Причина решения
 */
export interface LocusReason {
  /** Тип: positive (✓), neutral (•), negative (⚠) */
  type: ReasonType
  /** Текст причины на русском */
  text: string
}

/**
 * LOCUS Decision - главный объект AI решения
 * 
 * Этот объект отвечает на 3 вопроса:
 * 1. Что это? → verdict + verdictText
 * 2. Почему подходит/не подходит? → reasons
 * 3. Что делать? → recommendation
 */
export interface LocusDecision {
  /** Тип вердикта (для стилей) */
  verdict: VerdictType
  
  /** Текст вердикта: "Хороший вариант" */
  verdictText: string
  
  /** Числовая оценка (0-100) - НЕ показывается пользователю напрямую */
  score: number
  
  /** Причины (макс 3) */
  reasons: LocusReason[]
  
  /** Рекомендация: "Можно бронировать" */
  recommendation: string
  
  /** Уровень спроса */
  demandLevel: DemandLevel
  
  /** Отклонение цены от рынка (%) */
  priceDiff?: number
  
  /** Уровень риска */
  riskLevel?: 'low' | 'medium' | 'high'
  
  /** Персонализированные причины */
  personalReasons?: string[]
}

/**
 * Данные для блока "Подходит именно вам"
 */
export interface PersonalFit {
  /** Причины персонализации */
  reasons: string[]
  /** Заголовок */
  title?: string
}

/**
 * Полный объект решения для страницы объявления
 */
export interface LocusListingDecision extends LocusDecision {
  /** Персональное соответствие */
  personalFit?: PersonalFit
  
  /** Риски */
  risks?: LocusReason[]
  
  /** Советы для владельца (если смотрит владелец) */
  ownerTips?: string[]
}

/**
 * Решение для владельца (кабинет)
 */
export interface LocusOwnerDecision {
  /** Вердикт объявления */
  verdict: VerdictType
  verdictText: string
  score: number
  
  /** Текущий доход */
  currentIncome: number
  
  /** Потенциальный доход */
  potentialIncome: number
  
  /** Процент роста */
  growthPercent: number
  
  /** Что улучшить */
  improvements: {
    action: string
    impact: string
  }[]
  
  /** Проблемы */
  problems: string[]
}
