import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface PriceInput {
  listingId: string;
  currentPrice: number;
  city: string;
  capacityGuests: number;
  bedrooms: number;
  amenities: any[];
  reviews: any[];
}

interface PriceResult {
  recommended: number;
  position: 'below_market' | 'market' | 'above_market';
  diffPercent: number;
  reasoning: string[];
}

/**
 * Советник по ценообразованию
 * Анализирует рынок и рекомендует оптимальную цену
 */
@Injectable()
export class PriceAdvisor {
  // Базовые цены по городам (в реальности — из аналитики)
  private readonly cityBasePrices: Record<string, number> = {
    'Москва': 4500,
    'Moscow': 4500,
    'Санкт-Петербург': 3800,
    'Saint Petersburg': 3800,
    'Сочи': 5500,
    'Sochi': 5500,
    'Казань': 3000,
    'Kazan': 3000,
    'Краснодар': 3200,
    'Екатеринбург': 2800,
    'Новосибирск': 2600,
    'default': 3500,
  };

  constructor(private readonly prisma: PrismaService) {}

  async analyze(input: PriceInput): Promise<PriceResult> {
    // Получаем рыночную цену
    const marketPrice = await this.calculateMarketPrice(input);
    
    // Корректируем на основе характеристик
    const adjustedPrice = this.adjustForFeatures(marketPrice, input);
    
    // Определяем позицию относительно рынка
    const diffPercent = Math.round(((input.currentPrice - adjustedPrice) / adjustedPrice) * 100);
    
    let position: 'below_market' | 'market' | 'above_market';
    if (diffPercent < -10) {
      position = 'below_market';
    } else if (diffPercent > 10) {
      position = 'above_market';
    } else {
      position = 'market';
    }

    // Генерируем обоснование
    const reasoning = this.generateReasoning(input, adjustedPrice, position);

    return {
      recommended: Math.round(adjustedPrice),
      position,
      diffPercent,
      reasoning,
    };
  }

  private async calculateMarketPrice(input: PriceInput): Promise<number> {
    // Ищем похожие объявления в городе
    const similar = await this.prisma.listing.findMany({
      where: {
        city: input.city,
        status: 'PUBLISHED',
        id: { not: input.listingId },
      },
      select: { basePrice: true },
      take: 50,
    });

    if (similar.length >= 5) {
      const prices = similar.map(l => l.basePrice).sort((a, b) => a - b);
      const mid = Math.floor(prices.length / 2);
      const lo = prices[mid - 1] ?? 0;
      const hi = prices[mid] ?? 0;
      return prices.length % 2 ? hi : (lo + hi) / 2;
    }
    return this.cityBasePrices[input.city] ?? this.cityBasePrices['default'] ?? 0;
  }

  private adjustForFeatures(basePrice: number, input: PriceInput): number {
    let multiplier = 1.0;

    // Вместимость
    if (input.capacityGuests > 6) {
      multiplier += 0.20;
    } else if (input.capacityGuests > 4) {
      multiplier += 0.12;
    } else if (input.capacityGuests > 2) {
      multiplier += 0.06;
    }

    // Количество комнат
    if (input.bedrooms > 3) {
      multiplier += 0.15;
    } else if (input.bedrooms > 2) {
      multiplier += 0.10;
    } else if (input.bedrooms > 1) {
      multiplier += 0.05;
    }

    // Удобства
    const amenitiesCount = input.amenities?.length ?? 0;
    if (amenitiesCount >= 10) {
      multiplier += 0.10;
    } else if (amenitiesCount >= 6) {
      multiplier += 0.05;
    }

    // Отзывы
    const reviews = input.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      if (avgRating >= 4.8) {
        multiplier += 0.12;
      } else if (avgRating >= 4.5) {
        multiplier += 0.08;
      } else if (avgRating >= 4.0) {
        multiplier += 0.04;
      } else if (avgRating < 3.5) {
        multiplier -= 0.10;
      }
    }

    return basePrice * multiplier;
  }

  private generateReasoning(input: PriceInput, recommended: number, position: string): string[] {
    const reasons: string[] = [];

    if (position === 'below_market') {
      reasons.push('Ваша цена ниже рыночной — это привлекает гостей');
      reasons.push('После получения положительных отзывов можно повысить');
    } else if (position === 'above_market') {
      reasons.push('Цена выше средней по рынку');
      reasons.push(`Рекомендуем: ${Math.round(recommended).toLocaleString('ru-RU')} ₽ за ночь`);
    } else {
      reasons.push('Цена соответствует рынку');
    }

    if (input.capacityGuests > 4) {
      reasons.push('Большая вместимость позволяет ставить цену выше');
    }

    const reviews = input.reviews ?? [];
    if (reviews.length >= 5) {
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      if (avgRating >= 4.5) {
        reasons.push('Высокий рейтинг оправдывает премиальную цену');
      }
    }

    return reasons;
  }
}
