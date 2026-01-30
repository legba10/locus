import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExplanationEngine } from './explanation.engine';
import { LocusInsight, OwnerInsight, VERDICT_TEXTS, PRICE_POSITION_TEXTS, DEMAND_LEVEL_TEXTS } from '../types';

/**
 * InsightEngine — главный движок AI-анализа
 * 
 * Принцип: Все данные переводятся в человеческий язык
 */
@Injectable()
export class InsightEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly explainer: ExplanationEngine,
  ) {}

  /**
   * Получить полный insight для объявления
   */
  async getListingInsight(listingId: string): Promise<LocusInsight> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        photos: true,
        amenities: { include: { amenity: true } },
        reviews: true,
        bookings: { where: { status: 'CONFIRMED' } },
      },
    });

    if (!listing) {
      throw new NotFoundException('Объявление не найдено');
    }

    // Расчёт оценки
    const score = this.calculateScore(listing);
    const verdict = this.getVerdict(score);
    
    // Анализ цены
    const priceAnalysis = await this.analyzePricePosition(listing);
    
    // Анализ спроса
    const demandAnalysis = this.analyzeDemand(listing, score);
    
    // Генерация плюсов и минусов
    const { pros, cons, risks } = this.explainer.generateProsCons(listing, score, priceAnalysis);
    
    // Главная рекомендация
    const recommendation = this.explainer.generateRecommendation(score, priceAnalysis, demandAnalysis);
    
    // Советы
    const tips = this.explainer.generateTips(listing);

    return {
      score,
      verdict,
      verdictText: VERDICT_TEXTS[verdict] ?? "Оценка",
      pros,
      cons,
      risks,
      pricePosition: priceAnalysis.position,
      priceText: this.explainer.formatPriceText(priceAnalysis),
      recommendedPrice: priceAnalysis.recommended,
      demandLevel: demandAnalysis.level,
      demandText: DEMAND_LEVEL_TEXTS[demandAnalysis.level] ?? "Спрос",
      bookingProbability: demandAnalysis.probability,
      recommendation,
      tips,
    };
  }

  /**
   * Insight для владельца — расширенная версия
   */
  async getOwnerInsight(ownerId: string): Promise<{ listings: Array<{ id: string; title: string; insight: OwnerInsight }> }> {
    const listings = await this.prisma.listing.findMany({
      where: { ownerId },
      include: {
        photos: true,
        amenities: { include: { amenity: true } },
        reviews: true,
        bookings: { where: { status: 'CONFIRMED' } },
      },
    });

    const results = await Promise.all(
      listings.map(async (listing) => {
        const baseInsight = await this.getListingInsight(listing.id);
        
        // Дополнительная аналитика для владельца
        const monthlyRevenue = this.calculateMonthlyRevenue(listing);
        const potentialGrowth = this.explainer.generateGrowthPotential(listing);
        const marketComparison = await this.getMarketComparison(listing);

        const ownerInsight: OwnerInsight = {
          ...baseInsight,
          monthlyRevenueForecast: monthlyRevenue,
          potentialGrowth,
          marketComparison,
        };

        return {
          id: listing.id,
          title: listing.title,
          insight: ownerInsight,
        };
      }),
    );

    return { listings: results };
  }

  /**
   * Расчёт оценки качества (0-100)
   */
  private calculateScore(listing: any): number {
    let score = 0;

    // Фото (до 25 баллов)
    const photosCount = listing.photos?.length ?? 0;
    score += Math.min(25, photosCount * 5);

    // Описание (до 20 баллов)
    const descLength = listing.description?.length ?? 0;
    if (descLength > 500) score += 20;
    else if (descLength > 200) score += 15;
    else if (descLength > 50) score += 8;
    else score += 3;

    // Удобства (до 15 баллов)
    const amenitiesCount = listing.amenities?.length ?? 0;
    score += Math.min(15, amenitiesCount * 2);

    // Отзывы (до 20 баллов)
    const reviews = listing.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      score += Math.round(avgRating * 4);
    }

    // Полнота информации (до 10 баллов)
    if (listing.addressLine) score += 3;
    if (listing.lat && listing.lng) score += 3;
    if (listing.houseRules) score += 2;
    score += 2;

    // Опыт сдачи (до 10 баллов)
    const bookingsCount = listing.bookings?.length ?? 0;
    score += Math.min(10, bookingsCount);

    return Math.max(0, Math.min(100, score));
  }

  private getVerdict(score: number): 'excellent' | 'good' | 'average' | 'bad' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'bad';
  }

  private async analyzePricePosition(listing: any) {
    // Получаем среднюю цену по городу
    const similar = await this.prisma.listing.findMany({
      where: { city: listing.city, status: 'PUBLISHED', id: { not: listing.id } },
      select: { basePrice: true },
      take: 50,
    });

    let marketAvg = 3500;
    if (similar.length >= 5) {
      const prices = similar.map(l => l.basePrice).sort((a, b) => a - b);
      const mid = Math.floor(prices.length / 2);
      const lo = prices[mid - 1] ?? 0;
      const hi = prices[mid] ?? 0;
      marketAvg = prices.length % 2 ? hi : (lo + hi) / 2;
    }

    const diff = ((listing.basePrice - marketAvg) / marketAvg) * 100;
    
    let position: 'below_market' | 'market' | 'above_market';
    if (diff < -10) position = 'below_market';
    else if (diff > 10) position = 'above_market';
    else position = 'market';

    return {
      position,
      recommended: Math.round(marketAvg * 1.0),
      diff: Math.round(diff),
      marketAvg,
    };
  }

  private analyzeDemand(listing: any, score: number) {
    // Базовая вероятность
    let probability = 50;

    // Корректировка на качество
    if (score >= 80) probability += 20;
    else if (score >= 60) probability += 10;
    else if (score < 40) probability -= 15;

    // Корректировка на удобства
    const amenitiesCount = listing.amenities?.length ?? 0;
    if (amenitiesCount >= 8) probability += 10;
    else if (amenitiesCount < 3) probability -= 10;

    probability = Math.max(10, Math.min(95, probability));

    let level: 'low' | 'medium' | 'high';
    if (probability >= 70) level = 'high';
    else if (probability >= 45) level = 'medium';
    else level = 'low';

    return { level, probability };
  }

  private calculateMonthlyRevenue(listing: any): number {
    const avgOccupancy = 0.6; // 60% заполняемость
    const daysInMonth = 30;
    return Math.round(listing.basePrice * avgOccupancy * daysInMonth);
  }

  private async getMarketComparison(listing: any) {
    const competitors = await this.prisma.listing.findMany({
      where: { city: listing.city, status: 'PUBLISHED', id: { not: listing.id } },
      select: { basePrice: true },
    });

    const avgPrice = competitors.length > 0
      ? competitors.reduce((s, c) => s + c.basePrice, 0) / competitors.length
      : listing.basePrice;

    const diff = ((listing.basePrice - avgPrice) / avgPrice) * 100;
    
    let yourPosition: string;
    if (diff < -10) yourPosition = 'Цена ниже конкурентов';
    else if (diff > 10) yourPosition = 'Цена выше конкурентов';
    else yourPosition = 'Цена на уровне рынка';

    return {
      avgPrice: Math.round(avgPrice),
      yourPosition,
      competitorCount: competitors.length,
    };
  }
}
