import { Injectable } from '@nestjs/common';

interface QualityInput {
  photos: any[];
  description: string;
  amenities: any[];
  reviews: any[];
  address?: string;
  coordinates?: { lat: number; lng: number };
  houseRules?: any;
  bookings?: any[];
}

interface QualityResult {
  score: number;
  label: 'excellent' | 'good' | 'average' | 'needs_improvement';
  factors: Array<{ name: string; score: number; maxScore: number }>;
}

/**
 * Анализатор качества объявления
 * Оценивает полноту и привлекательность
 */
@Injectable()
export class QualityAnalyzer {
  analyze(input: QualityInput): QualityResult {
    const factors: Array<{ name: string; score: number; maxScore: number }> = [];
    let totalScore = 0;

    // 1. Фотографии (до 25 баллов)
    const photosCount = input.photos?.length ?? 0;
    const photosScore = Math.min(25, photosCount * 5);
    factors.push({ name: 'Фотографии', score: photosScore, maxScore: 25 });
    totalScore += photosScore;

    // 2. Описание (до 20 баллов)
    const descLength = input.description?.length ?? 0;
    let descScore = 0;
    if (descLength > 500) descScore = 20;
    else if (descLength > 200) descScore = 15;
    else if (descLength > 50) descScore = 8;
    else descScore = 3;
    factors.push({ name: 'Описание', score: descScore, maxScore: 20 });
    totalScore += descScore;

    // 3. Удобства (до 15 баллов)
    const amenitiesCount = input.amenities?.length ?? 0;
    const amenitiesScore = Math.min(15, amenitiesCount * 2);
    factors.push({ name: 'Удобства', score: amenitiesScore, maxScore: 15 });
    totalScore += amenitiesScore;

    // 4. Отзывы (до 20 баллов)
    const reviews = input.reviews ?? [];
    let reviewsScore = 0;
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      reviewsScore = Math.round(avgRating * 4);
    }
    factors.push({ name: 'Отзывы', score: reviewsScore, maxScore: 20 });
    totalScore += reviewsScore;

    // 5. Полнота профиля (до 10 баллов)
    let profileScore = 0;
    if (input.address) profileScore += 3;
    if (input.coordinates?.lat && input.coordinates?.lng) profileScore += 3;
    if (input.houseRules) profileScore += 2;
    profileScore = Math.min(10, profileScore + 2);
    factors.push({ name: 'Полнота информации', score: profileScore, maxScore: 10 });
    totalScore += profileScore;

    // 6. История бронирований (до 10 баллов)
    const bookingsCount = input.bookings?.length ?? 0;
    const bookingsScore = Math.min(10, bookingsCount);
    factors.push({ name: 'Опыт сдачи', score: bookingsScore, maxScore: 10 });
    totalScore += bookingsScore;

    // Ограничиваем 0-100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Определяем лейбл
    let label: 'excellent' | 'good' | 'average' | 'needs_improvement';
    if (totalScore >= 80) label = 'excellent';
    else if (totalScore >= 60) label = 'good';
    else if (totalScore >= 40) label = 'average';
    else label = 'needs_improvement';

    return { score: totalScore, label, factors };
  }

  /**
   * Генерирует плюсы объявления (понятным языком)
   */
  generatePros(input: QualityInput, qualityResult: QualityResult): string[] {
    const pros: string[] = [];

    const photosCount = input.photos?.length ?? 0;
    if (photosCount >= 8) {
      pros.push('Много качественных фотографий');
    } else if (photosCount >= 5) {
      pros.push('Достаточно фотографий для оценки');
    }

    const descLength = input.description?.length ?? 0;
    if (descLength > 300) {
      pros.push('Подробное описание жилья');
    }

    const amenitiesCount = input.amenities?.length ?? 0;
    if (amenitiesCount >= 8) {
      pros.push('Много удобств');
    } else if (amenitiesCount >= 5) {
      pros.push('Хороший набор удобств');
    }

    const reviews = input.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      if (avgRating >= 4.5) {
        pros.push('Отличные отзывы гостей');
      } else if (avgRating >= 4) {
        pros.push('Хорошие отзывы');
      }
    }

    if (input.coordinates?.lat && input.coordinates?.lng) {
      pros.push('Точное местоположение на карте');
    }

    const bookingsCount = input.bookings?.length ?? 0;
    if (bookingsCount >= 10) {
      pros.push('Проверенный владелец с опытом сдачи');
    } else if (bookingsCount >= 3) {
      pros.push('Есть успешный опыт сдачи');
    }

    // Если мало плюсов, добавляем общие
    if (pros.length === 0) {
      if (qualityResult.score >= 50) {
        pros.push('Базовая информация заполнена');
      }
    }

    return pros.slice(0, 5); // Максимум 5 плюсов
  }
}
