import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PriceResult {
  recommended: number;
  diff: number;
  position: 'below_market' | 'market' | 'above_market';
  positionText: string;
  demand: 'low' | 'medium' | 'high';
  marketAvg: number;
}

/**
 * PriceEngine — анализ цены
 */
@Injectable()
export class PriceEngine {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(listing: any): Promise<PriceResult> {
    // Получаем среднюю цену по городу
    const similar = await this.prisma.listing.findMany({
      where: { 
        city: listing.city, 
        status: 'PUBLISHED', 
        id: { not: listing.id } 
      },
      select: { basePrice: true },
      take: 100,
    });

    let marketAvg = 3500;
    if (similar.length >= 5) {
      const prices = similar.map(l => l.basePrice).sort((a, b) => a - b);
      const mid = Math.floor(prices.length / 2);
      const lo = prices[mid - 1] ?? 0;
      const hi = prices[mid] ?? 0;
      marketAvg = prices.length % 2 ? hi : (lo + hi) / 2;
    }

    const currentPrice = listing.basePrice;
    const diff = Math.round(((currentPrice - marketAvg) / marketAvg) * 100);

    let position: 'below_market' | 'market' | 'above_market';
    let positionText: string;

    if (diff < -10) {
      position = 'below_market';
      positionText = `Ниже рынка на ${Math.abs(diff)}%`;
    } else if (diff > 10) {
      position = 'above_market';
      positionText = `Выше рынка на ${diff}%`;
    } else {
      position = 'market';
      positionText = 'Цена по рынку';
    }

    // Определяем спрос
    const demand = this.calculateDemand(similar.length);

    return {
      recommended: Math.round(marketAvg),
      diff,
      position,
      positionText,
      demand,
      marketAvg: Math.round(marketAvg),
    };
  }

  private calculateDemand(competitorCount: number): 'low' | 'medium' | 'high' {
    if (competitorCount < 10) return 'high';
    if (competitorCount < 30) return 'medium';
    return 'low';
  }
}
