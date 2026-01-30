import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PriceRecommendation {
  recommended: number;
  position: 'below_market' | 'market' | 'above_market';
  diffPercent: number;
  reasoning: string[];
}

@Injectable()
export class PriceAdvisorService {
  // Средние цены по городам (в реальности будет из аналитики)
  private readonly cityAvgPrices: Record<string, number> = {
    'Москва': 4500,
    'Moscow': 4500,
    'Санкт-Петербург': 3800,
    'Saint Petersburg': 3800,
    'Сочи': 5500,
    'Sochi': 5500,
    'Казань': 3000,
    'Kazan': 3000,
    'default': 3500,
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить рекомендацию по цене
   */
  async getRecommendation(listing: any): Promise<PriceRecommendation> {
    const currentPrice = listing.basePrice;
    const city = listing.city;

    // Получаем среднюю цену по городу из БД
    const avgPrice = await this.calculateMarketPrice(city, listing);
    
    // Корректируем на основе характеристик
    const adjustedPrice = this.adjustPriceForFeatures(avgPrice, listing);
    
    // Определяем позицию на рынке
    const diffPercent = Math.round(((currentPrice - adjustedPrice) / adjustedPrice) * 100);
    
    let position: 'below_market' | 'market' | 'above_market';
    if (diffPercent < -10) {
      position = 'below_market';
    } else if (diffPercent > 10) {
      position = 'above_market';
    } else {
      position = 'market';
    }

    // Генерируем обоснование
    const reasoning = this.generateReasoning(listing, adjustedPrice, position);

    return {
      recommended: Math.round(adjustedPrice),
      position,
      diffPercent,
      reasoning,
    };
  }

  /**
   * Расчёт рыночной цены
   */
  private async calculateMarketPrice(city: string, listing: any): Promise<number> {
    // Пытаемся получить реальную среднюю цену из БД
    const similarListings = await this.prisma.listing.findMany({
      where: {
        city,
        status: 'PUBLISHED',
        id: { not: listing.id },
      },
      select: { basePrice: true },
      take: 50,
    });

    if (similarListings.length >= 5) {
      const prices = similarListings.map(l => l.basePrice).sort((a, b) => a - b);
      const mid = Math.floor(prices.length / 2);
      const lo = prices[mid - 1] ?? 0;
      const hi = prices[mid] ?? 0;
      return prices.length % 2 ? hi : (lo + hi) / 2;
    }
    return this.cityAvgPrices[city] ?? this.cityAvgPrices['default'] ?? 0;
  }

  /**
   * Корректировка цены на основе характеристик
   */
  private adjustPriceForFeatures(basePrice: number, listing: any): number {
    let multiplier = 1.0;

    // Количество гостей
    if (listing.capacityGuests > 4) {
      multiplier += 0.15;
    } else if (listing.capacityGuests > 2) {
      multiplier += 0.08;
    }

    // Количество комнат
    if (listing.bedrooms > 2) {
      multiplier += 0.12;
    } else if (listing.bedrooms > 1) {
      multiplier += 0.06;
    }

    // Фотографии (качественное объявление)
    const photosCount = listing.photos?.length ?? 0;
    if (photosCount >= 10) {
      multiplier += 0.05;
    }

    // Отзывы и рейтинг
    const reviews = listing.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      if (avgRating >= 4.5) {
        multiplier += 0.1;
      } else if (avgRating >= 4) {
        multiplier += 0.05;
      } else if (avgRating < 3.5) {
        multiplier -= 0.1;
      }
    }

    // Удобства
    const amenitiesCount = listing.amenities?.length ?? 0;
    if (amenitiesCount >= 8) {
      multiplier += 0.08;
    } else if (amenitiesCount >= 5) {
      multiplier += 0.04;
    }

    return basePrice * multiplier;
  }

  /**
   * Генерация обоснования цены
   */
  private generateReasoning(listing: any, recommendedPrice: number, position: string): string[] {
    const reasons: string[] = [];

    if (position === 'below_market') {
      reasons.push('Ваша цена ниже рыночной — отлично для привлечения гостей');
      reasons.push('Рассмотрите повышение после получения положительных отзывов');
    } else if (position === 'above_market') {
      reasons.push('Цена выше средней по рынку');
      reasons.push('Для конкурентоспособности рекомендуем снизить до ' + Math.round(recommendedPrice) + ' ₽');
    } else {
      reasons.push('Цена соответствует рынку');
    }

    // Характеристики влияющие на цену
    if (listing.capacityGuests > 4) {
      reasons.push('Большая вместимость позволяет устанавливать цену выше');
    }

    const reviews = listing.reviews ?? [];
    if (reviews.length > 5) {
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      if (avgRating >= 4.5) {
        reasons.push('Высокий рейтинг оправдывает премиальную цену');
      }
    }

    return reasons;
  }
}
