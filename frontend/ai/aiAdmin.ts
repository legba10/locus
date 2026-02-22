'use client'

export interface AiAdminReviewMetrics {
  positive: number
  negative: number
  commonProblems: string[]
}

export function getAiAdminMockReviewMetrics(): AiAdminReviewMetrics {
  return {
    positive: 74,
    negative: 26,
    commonProblems: [
      'Шум вечером',
      'Редко отвечают в чате',
      'Не хватает фото санузла',
    ],
  }
}
