import { Injectable } from '@nestjs/common';

interface TipsInput {
  photos: any[];
  description: string;
  amenities: any[];
  reviews: any[];
  price: number;
  pricePosition: 'below_market' | 'market' | 'above_market';
  coordinates?: { lat: number; lng: number };
  houseRules?: any;
  qualityScore: number;
}

interface Tip {
  text: string;
  impact: 'high' | 'medium' | 'low';
  potentialBoost: number; // Потенциальный прирост оценки
}

/**
 * Генератор советов от LOCUS AI
 * Даёт конкретные рекомендации по улучшению
 */
@Injectable()
export class TipsGenerator {
  generate(input: TipsInput): string[] {
    const tips: Tip[] = [];

    // Фотографии
    const photosCount = input.photos?.length ?? 0;
    if (photosCount === 0) {
      tips.push({
        text: 'Добавьте фотографии — объявления с фото получают в 10 раз больше просмотров',
        impact: 'high',
        potentialBoost: 25,
      });
    } else if (photosCount < 5) {
      tips.push({
        text: `Добавьте больше фотографий (сейчас ${photosCount}). Покажите все комнаты, кухню, ванную и вид из окна`,
        impact: 'high',
        potentialBoost: 15,
      });
    } else if (photosCount < 8) {
      tips.push({
        text: 'Добавьте фото окрестностей и инфраструктуры района',
        impact: 'medium',
        potentialBoost: 5,
      });
    }

    // Описание
    const descLength = input.description?.length ?? 0;
    if (descLength < 50) {
      tips.push({
        text: 'Напишите подробное описание (минимум 200 символов). Расскажите о районе, транспорте и особенностях жилья',
        impact: 'high',
        potentialBoost: 20,
      });
    } else if (descLength < 200) {
      tips.push({
        text: 'Расширьте описание. Добавьте информацию о ближайших магазинах, кафе и достопримечательностях',
        impact: 'medium',
        potentialBoost: 10,
      });
    }

    // Удобства
    const amenitiesCount = input.amenities?.length ?? 0;
    if (amenitiesCount === 0) {
      tips.push({
        text: 'Укажите доступные удобства: Wi-Fi, кондиционер, стиральная машина, парковка',
        impact: 'high',
        potentialBoost: 15,
      });
    } else if (amenitiesCount < 5) {
      tips.push({
        text: 'Добавьте больше удобств. Гости часто ищут конкретные удобства при бронировании',
        impact: 'medium',
        potentialBoost: 8,
      });
    }

    // Местоположение
    if (!input.coordinates?.lat || !input.coordinates?.lng) {
      tips.push({
        text: 'Укажите точное местоположение на карте — это важно для гостей',
        impact: 'medium',
        potentialBoost: 5,
      });
    }

    // Правила дома
    if (!input.houseRules) {
      tips.push({
        text: 'Добавьте правила проживания: время заезда/выезда, правила для животных и курения',
        impact: 'low',
        potentialBoost: 3,
      });
    }

    // Цена
    if (input.pricePosition === 'above_market') {
      tips.push({
        text: 'Ваша цена выше рынка. Снизьте для увеличения бронирований или улучшите объявление',
        impact: 'high',
        potentialBoost: 0,
      });
    } else if (input.pricePosition === 'below_market' && input.qualityScore >= 70) {
      tips.push({
        text: 'У вас хорошее объявление — можете немного повысить цену',
        impact: 'low',
        potentialBoost: 0,
      });
    }

    // Отзывы
    const reviewsCount = input.reviews?.length ?? 0;
    if (reviewsCount === 0) {
      tips.push({
        text: 'Получите первые отзывы! Предложите небольшую скидку первым гостям',
        impact: 'high',
        potentialBoost: 10,
      });
    }

    // Сортируем по важности
    tips.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.impact] - order[b.impact];
    });

    // Возвращаем только текст (максимум 5)
    return tips.slice(0, 5).map(t => t.text);
  }

  /**
   * Генерирует краткое резюме
   */
  generateSummary(qualityScore: number, pricePosition: string, demandLevel: string): string {
    if (qualityScore >= 80 && pricePosition !== 'above_market') {
      return 'Отличное предложение! Высокие шансы на бронирование.';
    }
    
    if (qualityScore >= 60) {
      if (pricePosition === 'above_market') {
        return 'Хорошее жильё, но цена выше рынка. Рассмотрите корректировку.';
      }
      return 'Хорошее предложение. Небольшие улучшения повысят привлекательность.';
    }
    
    if (qualityScore >= 40) {
      return 'Объявление требует доработки для повышения конкурентоспособности.';
    }
    
    return 'Рекомендуем значительно улучшить объявление для привлечения гостей.';
  }
}
