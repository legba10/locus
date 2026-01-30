import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarketInsight } from '../types';

/**
 * MarketEngine — анализ рынка
 */
@Injectable()
export class MarketEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить обзор рынка
   */
  async getMarketInsight(city?: string): Promise<MarketInsight> {
    const where = city ? { city, status: 'PUBLISHED' as const } : { status: 'PUBLISHED' as const };

    const listings = await this.prisma.listing.findMany({
      where,
      select: {
        basePrice: true,
        city: true,
      },
    });

    // Общая статистика
    const prices = listings.map(l => l.basePrice);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    // Статистика по городам
    const cityMap = new Map<string, number[]>();
    for (const l of listings) {
      if (!cityMap.has(l.city)) {
        cityMap.set(l.city, []);
      }
      cityMap.get(l.city)!.push(l.basePrice);
    }

    const topCities = Array.from(cityMap.entries())
      .map(([city, prices]) => ({
        city,
        count: prices.length,
        avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        demandLevel: this.getDemandLevel(prices.length) as 'low' | 'medium' | 'high',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Рекомендации
    const recommendations = this.generateMarketRecommendations(listings, topCities);

    return {
      overview: {
        totalListings: listings.length,
        avgPrice: Math.round(avgPrice),
        avgScore: 65, // Средняя оценка по рынку
      },
      trends: {
        priceChange: 0,
        demandChange: 0,
        period: 'за последние 7 дней',
      },
      topCities,
      recommendations,
    };
  }

  private getDemandLevel(count: number): string {
    if (count >= 20) return 'high';
    if (count >= 10) return 'medium';
    return 'low';
  }

  private generateMarketRecommendations(listings: any[], topCities: any[]): string[] {
    const recommendations: string[] = [];

    if (topCities.length > 0) {
      const topCity = topCities[0];
      recommendations.push(`${topCity.city} — самый популярный город с ${topCity.count} объявлениями`);
    }

    const avgPrice = listings.length > 0
      ? listings.reduce((s, l) => s + l.basePrice, 0) / listings.length
      : 0;

    recommendations.push(`Средняя цена по рынку: ${Math.round(avgPrice).toLocaleString('ru-RU')} ₽/ночь`);

    return recommendations;
  }
}
