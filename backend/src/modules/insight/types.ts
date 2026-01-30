/**
 * AI Insight — понятный AI-анализ для пользователей
 * 
 * Структура данных используется во всём продукте:
 * - карточки объявлений
 * - страница объявления
 * - кабинет владельца
 * - аналитика агентства
 */

export interface AIInsight {
  /** Общая оценка качества жилья (0-100) */
  score: number;
  
  /** Текстовая оценка: "отлично" | "хорошо" | "средне" | "требует улучшения" */
  scoreLabel: 'excellent' | 'good' | 'average' | 'needs_improvement';
  
  /** Почему это хороший вариант (3-5 пунктов) */
  pros: string[];
  
  /** Риски и предупреждения */
  risks: string[];
  
  /** Рекомендуемая цена */
  priceRecommendation: number;
  
  /** Текущая цена относительно рынка */
  pricePosition: 'below_market' | 'market' | 'above_market';
  
  /** Разница с рекомендуемой ценой в % */
  priceDiff: number;
  
  /** Уровень спроса */
  demandLevel: 'low' | 'medium' | 'high';
  
  /** Вероятность бронирования (0-100%) */
  bookingProbability: number;
  
  /** Советы от LOCUS AI */
  tips: string[];
  
  /** Краткое резюме одним предложением */
  summary: string;
}

export interface InsightRequest {
  listingId: string;
  /** Пересчитать даже если есть кэш */
  forceRecalculate?: boolean;
}

export interface OwnerDashboardData {
  /** Общая статистика */
  summary: {
    totalListings: number;
    publishedListings: number;
    avgScore: number;
    totalRevenue30d: number;
    pendingBookings: number;
  };
  
  /** Объявления с AI-анализом */
  listings: Array<{
    id: string;
    title: string;
    city: string;
    price: number;
    status: string;
    insight: AIInsight;
    photo?: string;
  }>;
  
  /** Рекомендации для владельца */
  recommendations: string[];
}

export interface MarketOverview {
  /** Общая статистика рынка */
  stats: {
    totalListings: number;
    avgPrice: number;
    priceRange: { min: number; max: number };
  };
  
  /** Статистика по городам */
  cities: Array<{
    city: string;
    count: number;
    avgPrice: number;
    demandLevel: 'low' | 'medium' | 'high';
  }>;
  
  /** Тренды */
  trends: {
    priceChange7d: number; // % изменения цен за 7 дней
    demandChange7d: number; // % изменения спроса
  };
}
