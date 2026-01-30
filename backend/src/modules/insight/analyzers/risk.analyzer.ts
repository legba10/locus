import { Injectable } from '@nestjs/common';

interface RiskInput {
  photos: any[];
  description: string;
  reviews: any[];
  price: number;
  coordinates?: { lat: number; lng: number };
  ownerBookingsCount: number;
}

interface RiskResult {
  risks: string[];
  level: 'low' | 'medium' | 'high';
  score: number; // 0-100 (0 = нет рисков)
}

/**
 * Анализатор рисков
 * Выявляет потенциальные проблемы
 */
@Injectable()
export class RiskAnalyzer {
  analyze(input: RiskInput): RiskResult {
    const risks: string[] = [];
    let riskScore = 0;

    // Нет фото — серьёзный риск
    const photosCount = input.photos?.length ?? 0;
    if (photosCount === 0) {
      risks.push('Нет фотографий — сложно оценить жильё');
      riskScore += 30;
    } else if (photosCount < 3) {
      risks.push('Мало фотографий');
      riskScore += 15;
    }

    // Короткое описание
    const descLength = input.description?.length ?? 0;
    if (descLength < 30) {
      risks.push('Очень короткое описание');
      riskScore += 20;
    } else if (descLength < 100) {
      risks.push('Описание недостаточно подробное');
      riskScore += 10;
    }

    // Нет отзывов
    const reviews = input.reviews ?? [];
    if (reviews.length === 0) {
      risks.push('Нет отзывов от гостей');
      riskScore += 10;
    } else {
      // Проверяем низкие оценки
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      if (avgRating < 3.0) {
        risks.push('Низкий рейтинг по отзывам');
        riskScore += 20;
      } else if (avgRating < 3.5) {
        risks.push('Рейтинг ниже среднего');
        riskScore += 10;
      }
    }

    // Нет точного адреса
    if (!input.coordinates?.lat || !input.coordinates?.lng) {
      risks.push('Не указано точное местоположение');
      riskScore += 10;
    }

    // Подозрительно низкая цена
    if (input.price < 500) {
      risks.push('Подозрительно низкая цена');
      riskScore += 15;
    }

    // Новый владелец без опыта
    if (input.ownerBookingsCount === 0) {
      risks.push('Владелец ещё не сдавал жильё');
      riskScore += 5;
    }

    // Определяем уровень риска
    riskScore = Math.min(100, riskScore);
    let level: 'low' | 'medium' | 'high';
    if (riskScore >= 40) {
      level = 'high';
    } else if (riskScore >= 20) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return { risks, level, score: riskScore };
  }
}
