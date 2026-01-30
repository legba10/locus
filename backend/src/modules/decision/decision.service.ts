import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DecisionResult {
  listingId: string;
  matchScore: number;
  reason: string;
}

export interface LocusInsight {
  score: number;
  label: 'Отличный' | 'Хороший' | 'Средний' | 'Слабый';
  summary: string;
  priceDiffPercent: number;
  demandLevel: 'низкий' | 'средний' | 'высокий';
  mainTip: string;
}

/**
 * DecisionService — определяет, насколько объявление подходит
 * 
 * Формула:
 * matchScore = priceScore * 0.4 + locationScore * 0.3 + demandScore * 0.2 + qualityScore * 0.1
 */
@Injectable()
export class DecisionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Рассчитать matchScore для списка объявлений
   */
  async calculateDecisions(
    listingIds: string[],
    userPrefs?: { maxPrice?: number; city?: string },
  ): Promise<DecisionResult[]> {
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: listingIds } },
      include: {
        photos: { take: 1 },
        reviews: { select: { rating: true } },
        amenities: { select: { amenityId: true } },
      },
    });

    // Получаем среднюю цену по рынку
    const allPrices = await this.prisma.listing.findMany({
      where: { status: 'PUBLISHED' },
      select: { basePrice: true },
      take: 100,
    });
    const avgPrice = allPrices.length > 0
      ? allPrices.reduce((s, l) => s + l.basePrice, 0) / allPrices.length
      : 3500;

    return listings.map((listing) => {
      // Price score (0-100)
      let priceScore = 50;
      const priceDiff = ((listing.basePrice - avgPrice) / avgPrice) * 100;
      if (priceDiff < -20) priceScore = 100;
      else if (priceDiff < -10) priceScore = 80;
      else if (priceDiff < 10) priceScore = 60;
      else if (priceDiff < 20) priceScore = 40;
      else priceScore = 20;

      if (userPrefs?.maxPrice && listing.basePrice > userPrefs.maxPrice) {
        priceScore = Math.max(0, priceScore - 30);
      }

      // Location score (0-100)
      let locationScore = 50;
      if (userPrefs?.city && listing.city === userPrefs.city) {
        locationScore = 100;
      }

      // Demand score (0-100)
      const photosCount = listing.photos?.length ?? 0;
      const amenitiesCount = listing.amenities?.length ?? 0;
      const demandScore = Math.min(100, photosCount * 10 + amenitiesCount * 5 + 30);

      // Quality score (0-100)
      const reviews = listing.reviews ?? [];
      let qualityScore = 50;
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        qualityScore = avgRating * 20;
      }

      // Match score
      const matchScore = Math.round(
        priceScore * 0.4 +
        locationScore * 0.3 +
        demandScore * 0.2 +
        qualityScore * 0.1
      );

      // Reason
      const reason = this.generateReason(matchScore, priceDiff);

      return {
        listingId: listing.id,
        matchScore,
        reason,
      };
    });
  }

  /**
   * Получить LocusInsight для объявления
   */
  async getInsight(listingId: string): Promise<LocusInsight> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        photos: true,
        reviews: { select: { rating: true } },
        amenities: { select: { amenityId: true } },
      },
    });

    if (!listing) {
      return this.getDefaultInsight();
    }

    // Расчёт score
    let score = 0;
    const photosCount = listing.photos?.length ?? 0;
    score += Math.min(30, photosCount * 6);
    score += Math.min(20, Math.floor(listing.description.length / 25));
    score += Math.min(20, (listing.amenities?.length ?? 0) * 3);

    const reviews = listing.reviews ?? [];
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      score += Math.round(avgRating * 6);
    }

    score = Math.max(0, Math.min(100, score));

    // Label
    const label = this.getLabel(score);

    // Price diff
    const avgPrice = await this.getAvgPrice(listing.city);
    const priceDiffPercent = Math.round(((listing.basePrice - avgPrice) / avgPrice) * 100);

    // Demand level
    const demandLevel = this.getDemandLevel(photosCount, listing.amenities?.length ?? 0);

    // Summary
    const summary = this.getSummary(score, priceDiffPercent);

    // Main tip
    const mainTip = this.getMainTip(listing);

    return {
      score,
      label,
      summary,
      priceDiffPercent,
      demandLevel,
      mainTip,
    };
  }

  private getLabel(score: number): LocusInsight['label'] {
    if (score >= 80) return 'Отличный';
    if (score >= 60) return 'Хороший';
    if (score >= 40) return 'Средний';
    return 'Слабый';
  }

  private getDemandLevel(photos: number, amenities: number): LocusInsight['demandLevel'] {
    const total = photos + amenities;
    if (total >= 12) return 'высокий';
    if (total >= 6) return 'средний';
    return 'низкий';
  }

  private getSummary(score: number, priceDiff: number): string {
    if (score >= 80 && priceDiff <= 0) return 'Отличный вариант по выгодной цене';
    if (score >= 80) return 'Качественное жильё';
    if (score >= 60 && priceDiff < -10) return 'Хороший вариант, цена ниже рынка';
    if (score >= 60) return 'Достойный вариант';
    if (score >= 40) return 'Средний вариант';
    return 'Требует доработки';
  }

  private getMainTip(listing: any): string {
    const photosCount = listing.photos?.length ?? 0;
    if (photosCount < 5) return 'Добавьте больше фото';
    if (listing.description.length < 200) return 'Расширьте описание';
    if ((listing.amenities?.length ?? 0) < 5) return 'Укажите все удобства';
    return 'Объявление заполнено хорошо';
  }

  private async getAvgPrice(city: string): Promise<number> {
    const similar = await this.prisma.listing.findMany({
      where: { city, status: 'PUBLISHED' },
      select: { basePrice: true },
      take: 50,
    });
    if (similar.length < 5) return 3500;
    return similar.reduce((s, l) => s + l.basePrice, 0) / similar.length;
  }

  private generateReason(score: number, priceDiff: number): string {
    if (score >= 80) return 'Отличный вариант';
    if (score >= 60 && priceDiff < 0) return 'Хорошая цена';
    if (score >= 60) return 'Достойный выбор';
    return 'Средний вариант';
  }

  private getDefaultInsight(): LocusInsight {
    return {
      score: 50,
      label: 'Средний',
      summary: 'Недостаточно данных',
      priceDiffPercent: 0,
      demandLevel: 'средний',
      mainTip: 'Добавьте информацию',
    };
  }
}
