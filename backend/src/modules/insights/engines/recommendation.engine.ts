import { Injectable } from '@nestjs/common';
import { ScoreResult } from './score.engine';
import { PriceResult } from './price.engine';

export interface RecommendationResult {
  bookingProbability: number;
  tips: string[];
  mainRecommendation: string;
}

/**
 * RecommendationEngine — генерация рекомендаций
 */
@Injectable()
export class RecommendationEngine {
  generate(listing: any, score: ScoreResult, price: PriceResult): RecommendationResult {
    const tips: string[] = [];

    // Базовая вероятность
    let probability = 50;

    // Корректировка на качество
    if (score.score >= 80) probability += 20;
    else if (score.score >= 60) probability += 10;
    else if (score.score < 40) probability -= 15;

    // Корректировка на цену
    if (price.position === 'below_market') probability += 15;
    else if (price.position === 'above_market') probability -= 10;

    // Корректировка на спрос
    if (price.demand === 'high') probability += 10;
    else if (price.demand === 'low') probability -= 10;

    probability = Math.max(10, Math.min(95, probability));

    // Генерация советов
    const photosCount = listing.photos?.length ?? 0;
    if (photosCount < 5) {
      tips.push('Добавьте больше фотографий — это главное для привлечения гостей');
    }

    const descLength = listing.description?.length ?? 0;
    if (descLength < 200) {
      tips.push('Расширьте описание — расскажите о районе и особенностях');
    }

    const amenitiesCount = listing.amenities?.length ?? 0;
    if (amenitiesCount < 5) {
      tips.push('Укажите все доступные удобства');
    }

    if (!listing.lat || !listing.lng) {
      tips.push('Добавьте точное местоположение на карте');
    }

    if (price.position === 'above_market') {
      tips.push(`Снизьте цену до ${price.recommended} ₽ для увеличения бронирований`);
    }

    // Главная рекомендация
    const mainRecommendation = this.getMainRecommendation(score, price);

    return {
      bookingProbability: probability / 100,
      tips: tips.slice(0, 5),
      mainRecommendation,
    };
  }

  private getMainRecommendation(score: ScoreResult, price: PriceResult): string {
    if (score.score >= 80 && price.position !== 'above_market') {
      return 'Отличный вариант! Рекомендуем бронировать.';
    }

    if (score.score >= 80 && price.position === 'above_market') {
      return 'Хорошее жильё, но цена выше средней.';
    }

    if (score.score >= 60) {
      if (price.position === 'below_market') {
        return 'Хороший вариант с выгодной ценой.';
      }
      return 'Достойный вариант. Изучите детали.';
    }

    if (score.score >= 40) {
      return 'Средний вариант. Сравните с другими.';
    }

    return 'Объявление требует доработки.';
  }
}
