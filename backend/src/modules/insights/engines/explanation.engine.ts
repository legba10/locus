import { Injectable } from '@nestjs/common';
import { ScoreResult } from './score.engine';
import { PriceResult } from './price.engine';

export interface ExplanationResult {
  pros: string[];
  cons: string[];
  risks: string[];
}

/**
 * ExplanationEngine — генерация объяснений понятным языком
 */
@Injectable()
export class ExplanationEngine {
  generate(listing: any, score: ScoreResult, price: PriceResult): ExplanationResult {
    const pros: string[] = [];
    const cons: string[] = [];
    const risks: string[] = [];

    // Фото
    const photosCount = listing.photos?.length ?? 0;
    if (photosCount >= 8) {
      pros.push('Много качественных фотографий');
    } else if (photosCount >= 5) {
      pros.push('Достаточно фотографий');
    } else if (photosCount < 3) {
      cons.push('Мало фотографий');
      if (photosCount === 0) risks.push('Нет фотографий — сложно оценить');
    }

    // Описание
    const descLength = listing.description?.length ?? 0;
    if (descLength > 300) {
      pros.push('Подробное описание');
    } else if (descLength < 100) {
      cons.push('Краткое описание');
    }

    // Удобства
    const amenitiesCount = listing.amenities?.length ?? 0;
    if (amenitiesCount >= 8) {
      pros.push('Много удобств');
    } else if (amenitiesCount >= 5) {
      pros.push('Хороший набор удобств');
    } else if (amenitiesCount < 3) {
      cons.push('Мало удобств');
    }

    // Отзывы
    const reviews = listing.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      if (avgRating >= 4.5) {
        pros.push('Отличные отзывы гостей');
      } else if (avgRating >= 4) {
        pros.push('Хорошие отзывы');
      } else if (avgRating < 3.5) {
        risks.push('Низкий рейтинг по отзывам');
      }
    } else {
      cons.push('Пока нет отзывов');
    }

    // Цена
    if (price.position === 'below_market') {
      pros.push(`Выгодная цена — ${price.positionText.toLowerCase()}`);
    } else if (price.position === 'above_market') {
      cons.push(price.positionText);
    }

    // Локация
    if (listing.lat && listing.lng) {
      pros.push('Точное местоположение на карте');
    } else {
      cons.push('Не указано точное местоположение');
    }

    // Опыт
    const bookingsCount = listing.bookings?.length ?? 0;
    if (bookingsCount >= 10) {
      pros.push('Проверенный владелец');
    } else if (bookingsCount === 0) {
      risks.push('Новый владелец без опыта');
    }

    return {
      pros: pros.slice(0, 5),
      cons: cons.slice(0, 3),
      risks: risks.slice(0, 3),
    };
  }
}
