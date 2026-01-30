/**
 * LOCUS AI Core — единый формат AI-данных
 * 
 * Принцип: AI говорит человеческим языком
 */

/**
 * Универсальный ответ AI для любого объекта
 */
export interface LocusInsight {
  /** Оценка качества (0-100) */
  score: number;
  
  /** Вердикт понятным языком */
  verdict: 'excellent' | 'good' | 'average' | 'bad';
  
  /** Текстовый вердикт на русском */
  verdictText: string;
  
  /** Почему это хороший вариант */
  pros: string[];
  
  /** На что обратить внимание */
  cons: string[];
  
  /** Риски */
  risks: string[];
  
  /** Позиция цены относительно рынка */
  pricePosition: 'below_market' | 'market' | 'above_market';
  
  /** Текст о цене */
  priceText: string;
  
  /** Рекомендуемая цена */
  recommendedPrice: number;
  
  /** Уровень спроса */
  demandLevel: 'low' | 'medium' | 'high';
  
  /** Текст о спросе */
  demandText: string;
  
  /** Вероятность бронирования (0-100%) */
  bookingProbability: number;
  
  /** Главная рекомендация (одно предложение) */
  recommendation: string;
  
  /** Советы по улучшению */
  tips: string[];
}

/**
 * Insight для владельца — что делать с объектом
 */
export interface OwnerInsight extends LocusInsight {
  /** Прогноз дохода за месяц */
  monthlyRevenueForecast: number;
  
  /** Потенциальный рост бронирований при улучшении */
  potentialGrowth: {
    action: string;
    impact: string;
    percentIncrease: number;
  }[];
  
  /** Сравнение с конкурентами */
  marketComparison: {
    avgPrice: number;
    yourPosition: string;
    competitorCount: number;
  };
}

/**
 * Insight для рынка
 */
export interface MarketInsight {
  /** Общая статистика */
  overview: {
    totalListings: number;
    avgPrice: number;
    avgScore: number;
  };
  
  /** Тренды */
  trends: {
    priceChange: number;
    demandChange: number;
    period: string;
  };
  
  /** Топ города */
  topCities: Array<{
    city: string;
    count: number;
    avgPrice: number;
    demandLevel: 'low' | 'medium' | 'high';
  }>;
  
  /** Рекомендации для рынка */
  recommendations: string[];
}

/**
 * Текстовые переводы вердиктов
 */
export const VERDICT_TEXTS: Record<string, string> = {
  excellent: 'Отличный вариант',
  good: 'Хороший вариант',
  average: 'Средний вариант',
  bad: 'Требует улучшения',
};

export const PRICE_POSITION_TEXTS: Record<string, string> = {
  below_market: 'Ниже рынка',
  market: 'По рынку',
  above_market: 'Выше рынка',
};

export const DEMAND_LEVEL_TEXTS: Record<string, string> = {
  low: 'Низкий спрос',
  medium: 'Средний спрос',
  high: 'Высокий спрос',
};
