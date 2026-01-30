import { Injectable } from '@nestjs/common';

export interface RatingResult {
  score: number;
  label: string;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface Explanation {
  summary: string;
  pros: string[];
  cons: string[];
  tips: string[];
}

@Injectable()
export class AnalysisService {
  /**
   * Расчёт LOCUS рейтинга (0-100)
   */
  calculateLocusRating(listing: any): RatingResult {
    let score = 0;

    // 1. Фотографии (до 25 баллов)
    const photosCount = listing.photos?.length ?? 0;
    score += Math.min(25, photosCount * 5);

    // 2. Описание (до 20 баллов)
    const descLength = listing.description?.length ?? 0;
    if (descLength > 500) score += 20;
    else if (descLength > 200) score += 15;
    else if (descLength > 50) score += 8;
    else score += 3;

    // 3. Удобства (до 15 баллов)
    const amenitiesCount = listing.amenities?.length ?? 0;
    score += Math.min(15, amenitiesCount * 2);

    // 4. Рейтинг отзывов (до 20 баллов)
    const reviews = listing.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      score += Math.round(avgRating * 4);
    }

    // 5. Завершённость профиля (до 10 баллов)
    if (listing.addressLine) score += 3;
    if (listing.lat && listing.lng) score += 3;
    if (listing.houseRules) score += 2;
    if (listing.capacityGuests > 0) score += 2;

    // 6. История бронирований (до 10 баллов)
    const bookingsCount = listing.bookings?.length ?? 0;
    score += Math.min(10, bookingsCount);

    // Ограничиваем 0-100
    score = Math.max(0, Math.min(100, score));

    // Определяем лейбл
    let label: string;
    if (score >= 80) label = 'excellent';
    else if (score >= 60) label = 'good';
    else if (score >= 40) label = 'average';
    else label = 'needs_improvement';

    return { score, label };
  }

  /**
   * Оценка рисков
   */
  assessRisks(listing: any): RiskAssessment {
    const factors: string[] = [];
    let riskScore = 0;

    // Нет фото - высокий риск
    if (!listing.photos || listing.photos.length === 0) {
      factors.push('Отсутствуют фотографии');
      riskScore += 30;
    } else if (listing.photos.length < 3) {
      factors.push('Мало фотографий (менее 3)');
      riskScore += 15;
    }

    // Короткое описание
    if (!listing.description || listing.description.length < 50) {
      factors.push('Слишком короткое описание');
      riskScore += 20;
    }

    // Нет отзывов
    if (!listing.reviews || listing.reviews.length === 0) {
      factors.push('Нет отзывов');
      riskScore += 10;
    }

    // Низкий рейтинг
    const reviews = listing.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      if (avgRating < 3.5) {
        factors.push('Низкий средний рейтинг');
        riskScore += 15;
      }
    }

    // Нет координат
    if (!listing.lat || !listing.lng) {
      factors.push('Не указано точное местоположение');
      riskScore += 10;
    }

    // Подозрительно низкая цена
    if (listing.basePrice < 500) {
      factors.push('Подозрительно низкая цена');
      riskScore += 15;
    }

    // Определяем уровень риска
    let level: 'low' | 'medium' | 'high';
    if (riskScore >= 40) level = 'high';
    else if (riskScore >= 20) level = 'medium';
    else level = 'low';

    return { level, factors };
  }

  /**
   * Генерация объяснения
   */
  generateExplanation(
    listing: any,
    rating: RatingResult,
    priceAdvice: any,
    riskAssessment: RiskAssessment,
  ): Explanation {
    const pros: string[] = [];
    const cons: string[] = [];
    const tips: string[] = [];

    // Анализ плюсов
    if (listing.photos && listing.photos.length >= 5) {
      pros.push('Много качественных фотографий');
    }
    if (listing.description && listing.description.length > 200) {
      pros.push('Подробное описание жилья');
    }
    if (listing.amenities && listing.amenities.length >= 5) {
      pros.push('Много удобств');
    }
    if (listing.reviews && listing.reviews.length > 0) {
      const avgRating = listing.reviews.reduce((s: number, r: any) => s + r.rating, 0) / listing.reviews.length;
      if (avgRating >= 4.5) {
        pros.push('Отличные отзывы гостей');
      } else if (avgRating >= 4) {
        pros.push('Хорошие отзывы');
      }
    }
    if (priceAdvice.position === 'below_market') {
      pros.push('Цена ниже рынка');
    }

    // Анализ минусов
    if (!listing.photos || listing.photos.length < 3) {
      cons.push('Мало фотографий');
    }
    if (!listing.description || listing.description.length < 100) {
      cons.push('Краткое описание');
    }
    if (priceAdvice.position === 'above_market') {
      cons.push('Цена выше средней по рынку');
    }
    if (riskAssessment.level === 'high') {
      cons.push('Есть факторы риска');
    }

    // Советы
    if (!listing.photos || listing.photos.length < 5) {
      tips.push('Добавьте больше фотографий (минимум 5)');
    }
    if (!listing.description || listing.description.length < 200) {
      tips.push('Расширьте описание, добавьте детали о районе и инфраструктуре');
    }
    if (!listing.amenities || listing.amenities.length < 3) {
      tips.push('Укажите все доступные удобства');
    }
    if (!listing.lat || !listing.lng) {
      tips.push('Добавьте точные координаты для удобства гостей');
    }

    // Формируем summary
    let summary: string;
    if (rating.score >= 80) {
      summary = 'Отличное объявление! Высокие шансы на бронирование.';
    } else if (rating.score >= 60) {
      summary = 'Хорошее объявление. Небольшие улучшения повысят привлекательность.';
    } else if (rating.score >= 40) {
      summary = 'Объявление требует доработки для повышения конкурентоспособности.';
    } else {
      summary = 'Рекомендуем значительно улучшить объявление для привлечения гостей.';
    }

    return { summary, pros, cons, tips };
  }

  /**
   * Получить текстовое описание рейтинга
   */
  getRatingDescription(label: string): string {
    const descriptions: Record<string, string> = {
      excellent: 'Отличное объявление',
      good: 'Хорошее объявление',
      average: 'Среднее объявление',
      needs_improvement: 'Требует улучшения',
    };
    return descriptions[label] ?? 'Не оценено';
  }
}
