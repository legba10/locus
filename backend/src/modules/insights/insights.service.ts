import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoreEngine } from './engines/score.engine';
import { PriceEngine } from './engines/price.engine';
import { ExplanationEngine } from './engines/explanation.engine';
import { RecommendationEngine } from './engines/recommendation.engine';

export interface ListingInsightDto {
  id: string;
  listingId: string;
  score: number;
  verdict: string;
  priceDiff: number;
  pros: string[];
  cons: string[];
  risks: string[];
  demand: string;
  bookingProbability: number;
  recommendedPrice: number | null;
  tips: string[];
}

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoreEngine: ScoreEngine,
    private readonly priceEngine: PriceEngine,
    private readonly explainer: ExplanationEngine,
    private readonly recommender: RecommendationEngine,
  ) {}

  /**
   * Получить insight для объявления
   */
  async getInsight(listingId: string): Promise<ListingInsightDto> {
    // Проверяем кэш
    const cached = await this.prisma.listingInsight.findUnique({
      where: { listingId },
    });

    if (cached) {
      return this.formatInsight(cached);
    }

    // Генерируем новый insight
    return this.calculateInsight(listingId);
  }

  /**
   * Пересчитать insight для объявления
   */
  async recalculateInsight(listingId: string): Promise<ListingInsightDto> {
    return this.calculateInsight(listingId);
  }

  /**
   * Рассчитать insight
   */
  private async calculateInsight(listingId: string): Promise<ListingInsightDto> {
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
    const scoreResult = this.scoreEngine.calculate(listing);

    // Анализ цены
    const priceResult = await this.priceEngine.analyze(listing);

    // Генерация объяснений
    const explanation = this.explainer.generate(listing, scoreResult, priceResult);

    // Рекомендации
    const recommendations = this.recommender.generate(listing, scoreResult, priceResult);

    // Сохраняем в БД
    const insight = await this.prisma.listingInsight.upsert({
      where: { listingId },
      create: {
        listingId,
        score: scoreResult.score,
        verdict: scoreResult.verdict,
        priceDiff: priceResult.diff,
        pros: explanation.pros,
        cons: explanation.cons,
        risks: explanation.risks,
        demand: priceResult.demand,
        bookingProbability: recommendations.bookingProbability,
        recommendedPrice: priceResult.recommended,
        tips: recommendations.tips,
      },
      update: {
        score: scoreResult.score,
        verdict: scoreResult.verdict,
        priceDiff: priceResult.diff,
        pros: explanation.pros,
        cons: explanation.cons,
        risks: explanation.risks,
        demand: priceResult.demand,
        bookingProbability: recommendations.bookingProbability,
        recommendedPrice: priceResult.recommended,
        tips: recommendations.tips,
        updatedAt: new Date(),
      },
    });

    return this.formatInsight(insight);
  }

  private formatInsight(insight: any): ListingInsightDto {
    return {
      id: insight.id,
      listingId: insight.listingId,
      score: insight.score,
      verdict: insight.verdict,
      priceDiff: insight.priceDiff,
      pros: (insight.pros as string[]) ?? [],
      cons: (insight.cons as string[]) ?? [],
      risks: (insight.risks as string[]) ?? [],
      demand: insight.demand,
      bookingProbability: insight.bookingProbability,
      recommendedPrice: insight.recommendedPrice,
      tips: (insight.tips as string[]) ?? [],
    };
  }
}
