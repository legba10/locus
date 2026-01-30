import { Injectable } from '@nestjs/common';
import type { ListingContext } from '../ai-brain.service';

/**
 * Demand Strategy — оценка спроса на объявление.
 * 
 * Факторы:
 * - Город (популярность)
 * - Сезонность (MVP: упрощённая)
 * - История бронирований
 * - Качество описания
 * - Ценовое позиционирование
 */
@Injectable()
export class DemandStrategy {
  // Коэффициенты популярности городов (MVP)
  private readonly cityDemand: Record<string, number> = {
    'Moscow': 85,
    'Москва': 85,
    'Saint Petersburg': 80,
    'Санкт-Петербург': 80,
    'Sochi': 75,
    'Сочи': 75,
    'Kazan': 65,
    'Казань': 65,
    'default': 50,
  };

  calculate(context: ListingContext): number {
    let score = 0;

    // 1. City popularity (base 30-85 points)
    const cityScore = (this.cityDemand[context.city] ?? this.cityDemand['default']) ?? 0.5;
    score += cityScore * 0.4; // Max ~34 points

    // 2. Booking history (max 25 points)
    const bookingScore = Math.min(25, context.bookingsCount * 5);
    score += bookingScore;

    // 3. Reviews and rating (max 20 points)
    if (context.reviewsCount > 0) {
      const ratingBonus = (context.avgRating / 5) * 15;
      const reviewsBonus = Math.min(5, context.reviewsCount);
      score += ratingBonus + reviewsBonus;
    }

    // 4. Content quality signals (max 15 points)
    if (context.photosCount >= 5) score += 5;
    if (context.description && context.description.length >= 150) score += 5;
    if (context.amenitiesCount >= 5) score += 5;

    // 5. Seasonal adjustment (simplified MVP)
    const month = new Date().getMonth();
    // Summer months and New Year have higher demand
    if ([5, 6, 7, 11, 0].includes(month)) {
      score *= 1.1;
    }
    // Low season
    if ([2, 3, 10].includes(month)) {
      score *= 0.9;
    }

    // 6. Price competitiveness bonus
    // Lower prices relative to market = higher demand potential
    // (This is simplified; real implementation would compare to market)
    if (context.basePrice > 0 && context.basePrice < 3000) {
      score += 5;
    }

    // Clamp to 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
