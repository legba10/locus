import { Injectable } from '@nestjs/common';

export interface ScoreResult {
  score: number;
  verdict: 'excellent' | 'good' | 'average' | 'bad';
  verdictText: string;
}

/**
 * ScoreEngine — расчёт оценки качества объявления
 */
@Injectable()
export class ScoreEngine {
  calculate(listing: any): ScoreResult {
    let score = 0;

    // Фото (до 25 баллов)
    const photosCount = listing.photos?.length ?? 0;
    score += Math.min(25, photosCount * 5);

    // Описание (до 20 баллов)
    const descLength = listing.description?.length ?? 0;
    if (descLength > 500) score += 20;
    else if (descLength > 200) score += 15;
    else if (descLength > 50) score += 8;
    else score += 3;

    // Удобства (до 15 баллов)
    const amenitiesCount = listing.amenities?.length ?? 0;
    score += Math.min(15, amenitiesCount * 2);

    // Отзывы (до 20 баллов)
    const reviews = listing.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      score += Math.round(avgRating * 4);
    }

    // Полнота данных (до 10 баллов)
    if (listing.addressLine) score += 3;
    if (listing.lat && listing.lng) score += 3;
    if (listing.houseRules) score += 2;
    score += 2;

    // Опыт (до 10 баллов)
    const bookingsCount = listing.bookings?.length ?? 0;
    score += Math.min(10, bookingsCount);

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      verdict: this.getVerdict(score),
      verdictText: this.getVerdictText(score),
    };
  }

  private getVerdict(score: number): 'excellent' | 'good' | 'average' | 'bad' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'bad';
  }

  private getVerdictText(score: number): string {
    if (score >= 80) return 'Отличный вариант';
    if (score >= 60) return 'Хороший вариант';
    if (score >= 40) return 'Средний вариант';
    return 'Требует улучшения';
  }
}
