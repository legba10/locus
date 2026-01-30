import { Injectable } from '@nestjs/common';
import type { ListingContext } from '../ai-brain.service';

export interface PricingResult {
  recommendedPrice: number;
  deltaPct: number;
  marketPosition: 'below_market' | 'at_market' | 'above_market';
  priceScore: number;
}

/**
 * Pricing Strategy — рекомендация цены и позиция на рынке.
 * 
 * MVP: простая эвристика на основе города и demand score.
 * TODO: подключить рыночные данные для сравнения.
 */
@Injectable()
export class PricingStrategy {
  // Средние цены по городам (MVP hardcoded, потом из аналитики)
  private readonly cityAvgPrices: Record<string, number> = {
    'Moscow': 4500,
    'Москва': 4500,
    'Saint Petersburg': 3500,
    'Санкт-Петербург': 3500,
    'Kazan': 2500,
    'Казань': 2500,
    'Sochi': 5000,
    'Сочи': 5000,
    'default': 3000,
  };

  calculate(context: ListingContext, demandScore: number): PricingResult {
    const currentPrice = context.basePrice;
    const avgPrice = this.getAvgPrice(context.city);

    // Calculate recommended price based on demand
    // Higher demand = can charge more
    const demandMultiplier = 1 + (demandScore - 50) / 200; // 0.75 - 1.25
    let recommendedPrice = Math.round(avgPrice * demandMultiplier);

    // Adjust for quality signals
    if (context.photosCount >= 5) recommendedPrice *= 1.05;
    if (context.avgRating >= 4.5) recommendedPrice *= 1.1;
    if (context.amenitiesCount >= 5) recommendedPrice *= 1.05;

    recommendedPrice = Math.round(recommendedPrice);

    // Calculate delta
    const deltaPct = currentPrice > 0 
      ? Math.round(((recommendedPrice - currentPrice) / currentPrice) * 100)
      : 0;

    // Determine market position
    let marketPosition: 'below_market' | 'at_market' | 'above_market';
    const deviation = currentPrice / avgPrice;
    
    if (deviation < 0.85) {
      marketPosition = 'below_market';
    } else if (deviation > 1.15) {
      marketPosition = 'above_market';
    } else {
      marketPosition = 'at_market';
    }

    // Price score: how well-positioned is the current price?
    // 100 = perfect pricing, lower = suboptimal
    let priceScore = 100;
    if (marketPosition === 'below_market') {
      // Potentially leaving money on the table
      priceScore = Math.max(50, 100 - Math.abs(deltaPct));
    } else if (marketPosition === 'above_market') {
      // May have lower conversion
      priceScore = Math.max(40, 100 - Math.abs(deltaPct) * 1.2);
    }

    return {
      recommendedPrice,
      deltaPct,
      marketPosition,
      priceScore: Math.round(priceScore),
    };
  }

  private getAvgPrice(city: string): number {
    return this.cityAvgPrices[city] ?? this.cityAvgPrices['default'] ?? 0;
  }
}
