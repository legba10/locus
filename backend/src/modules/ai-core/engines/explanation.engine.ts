import { Injectable } from '@nestjs/common';

/**
 * ExplanationEngine — переводит AI в человеческий язык
 * 
 * Принцип: Никаких технических терминов
 */
@Injectable()
export class ExplanationEngine {
  /**
   * Генерация плюсов, минусов и рисков
   */
  generateProsCons(listing: any, score: number, priceAnalysis: any) {
    const pros: string[] = [];
    const cons: string[] = [];
    const risks: string[] = [];

    // Анализ фото
    const photosCount = listing.photos?.length ?? 0;
    if (photosCount >= 8) {
      pros.push('Много качественных фотографий');
    } else if (photosCount >= 5) {
      pros.push('Достаточно фотографий для оценки');
    } else if (photosCount < 3) {
      cons.push('Мало фотографий');
      if (photosCount === 0) risks.push('Нет фотографий — сложно оценить жильё');
    }

    // Анализ описания
    const descLength = listing.description?.length ?? 0;
    if (descLength > 300) {
      pros.push('Подробное описание');
    } else if (descLength < 100) {
      cons.push('Краткое описание');
    }

    // Анализ удобств
    const amenitiesCount = listing.amenities?.length ?? 0;
    if (amenitiesCount >= 8) {
      pros.push('Много удобств');
    } else if (amenitiesCount >= 5) {
      pros.push('Хороший набор удобств');
    } else if (amenitiesCount < 3) {
      cons.push('Мало удобств');
    }

    // Анализ отзывов
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

    // Анализ цены
    if (priceAnalysis.position === 'below_market') {
      pros.push(`Цена ниже рынка на ${Math.abs(priceAnalysis.diff)}%`);
    } else if (priceAnalysis.position === 'above_market') {
      cons.push(`Цена выше рынка на ${priceAnalysis.diff}%`);
    }

    // Анализ местоположения
    if (listing.lat && listing.lng) {
      pros.push('Точное местоположение на карте');
    } else {
      cons.push('Не указано точное местоположение');
    }

    // Опыт сдачи
    const bookingsCount = listing.bookings?.length ?? 0;
    if (bookingsCount >= 10) {
      pros.push('Проверенный владелец с опытом');
    } else if (bookingsCount === 0) {
      risks.push('Новый владелец без опыта сдачи');
    }

    return { pros: pros.slice(0, 5), cons: cons.slice(0, 3), risks: risks.slice(0, 3) };
  }

  /**
   * Главная рекомендация
   */
  generateRecommendation(score: number, priceAnalysis: any, demandAnalysis: any): string {
    if (score >= 80 && priceAnalysis.position !== 'above_market') {
      return 'Отличный вариант! Рекомендуем бронировать.';
    }
    
    if (score >= 80 && priceAnalysis.position === 'above_market') {
      return 'Хорошее жильё, но цена выше средней. Попробуйте договориться о скидке.';
    }
    
    if (score >= 60) {
      if (demandAnalysis.level === 'high') {
        return 'Хороший вариант с высоким спросом. Бронируйте заранее.';
      }
      return 'Достойный вариант. Изучите детали перед бронированием.';
    }
    
    if (score >= 40) {
      return 'Средний вариант. Рекомендуем сравнить с другими предложениями.';
    }
    
    return 'Объявление требует доработки. Рассмотрите другие варианты.';
  }

  /**
   * Текст о цене
   */
  formatPriceText(priceAnalysis: any): string {
    if (priceAnalysis.position === 'below_market') {
      return `Выгодная цена — на ${Math.abs(priceAnalysis.diff)}% ниже рынка`;
    }
    if (priceAnalysis.position === 'above_market') {
      return `Цена на ${priceAnalysis.diff}% выше средней по рынку`;
    }
    return 'Цена соответствует рынку';
  }

  /**
   * Советы по улучшению
   */
  generateTips(listing: any): string[] {
    const tips: string[] = [];

    const photosCount = listing.photos?.length ?? 0;
    if (photosCount < 5) {
      tips.push('Добавьте больше фотографий — это главное для привлечения гостей');
    }

    const descLength = listing.description?.length ?? 0;
    if (descLength < 200) {
      tips.push('Расширьте описание — расскажите о районе и особенностях жилья');
    }

    const amenitiesCount = listing.amenities?.length ?? 0;
    if (amenitiesCount < 5) {
      tips.push('Укажите все доступные удобства');
    }

    if (!listing.lat || !listing.lng) {
      tips.push('Добавьте точное местоположение на карте');
    }

    const reviewsCount = listing.reviews?.length ?? 0;
    if (reviewsCount === 0) {
      tips.push('Получите первые отзывы — предложите скидку первым гостям');
    }

    return tips.slice(0, 5);
  }

  /**
   * Потенциал роста для владельца
   */
  generateGrowthPotential(listing: any): Array<{ action: string; impact: string; percentIncrease: number }> {
    const growth: Array<{ action: string; impact: string; percentIncrease: number }> = [];

    const photosCount = listing.photos?.length ?? 0;
    if (photosCount < 5) {
      growth.push({
        action: 'Добавьте 3-5 фотографий',
        impact: 'Повышение интереса гостей',
        percentIncrease: 25,
      });
    }

    const descLength = listing.description?.length ?? 0;
    if (descLength < 200) {
      growth.push({
        action: 'Расширьте описание до 300+ символов',
        impact: 'Больше доверия гостей',
        percentIncrease: 15,
      });
    }

    // Цена
    growth.push({
      action: 'Снизьте цену на 5%',
      impact: 'Больше бронирований',
      percentIncrease: 18,
    });

    return growth.slice(0, 3);
  }
}
