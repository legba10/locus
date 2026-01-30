import { Injectable } from '@nestjs/common';
import type { ListingContext } from '../ai-brain.service';

export interface RiskResult {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
}

/**
 * Risk Strategy — оценка рисков объявления.
 * 
 * Риски:
 * - Владелец заблокирован
 * - Неполное описание
 * - Нет координат (сложно верифицировать)
 * - Слишком низкая цена (подозрительно)
 * - Нет фото
 * - Нет отзывов
 */
@Injectable()
export class RiskStrategy {
  calculate(context: ListingContext): RiskResult {
    const factors: string[] = [];
    let score = 10; // Base risk score

    // Owner status
    if (context.ownerStatus !== 'ACTIVE') {
      score += 40;
      factors.push('Владелец не в статусе ACTIVE');
    }

    // Description
    const descLen = context.description?.length ?? 0;
    if (descLen < 50) {
      score += 15;
      factors.push('Короткое описание — риск недопонимания условий');
    } else if (descLen < 100) {
      score += 5;
      factors.push('Описание могло бы быть подробнее');
    }

    // Coordinates
    if (!context.hasCoordinates) {
      score += 10;
      factors.push('Нет координат — сложнее верифицировать локацию');
    }

    // Photos
    if (context.photosCount === 0) {
      score += 20;
      factors.push('Нет фотографий — высокий риск несоответствия');
    } else if (context.photosCount < 3) {
      score += 10;
      factors.push('Мало фотографий — рекомендуется добавить больше');
    }

    // Price anomaly
    if (context.basePrice < 1000) {
      score += 15;
      factors.push('Подозрительно низкая цена');
    }

    // Reviews and bookings (trust signals)
    if (context.reviewsCount === 0 && context.bookingsCount === 0) {
      score += 5;
      factors.push('Новое объявление без истории бронирований');
    }

    // Rating
    if (context.reviewsCount > 0 && context.avgRating < 3.5) {
      score += 15;
      factors.push('Низкий рейтинг по отзывам');
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine level
    let level: 'low' | 'medium' | 'high';
    if (score >= 60) {
      level = 'high';
    } else if (score >= 35) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return { score, level, factors };
  }
}
