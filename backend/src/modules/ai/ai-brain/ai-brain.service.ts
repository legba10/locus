import { Injectable, Logger } from '@nestjs/common';
import { QualityStrategy } from './strategies/quality.strategy';
import { PricingStrategy } from './strategies/pricing.strategy';
import { RiskStrategy } from './strategies/risk.strategy';
import { DemandStrategy } from './strategies/demand.strategy';
import { ExplanationGenerator } from './explainers/explanation.generator';

export interface ListingContext {
  id: string;
  title: string;
  description: string;
  city: string;
  basePrice: number;
  currency: string;
  photosCount: number;
  amenitiesCount: number;
  hasCoordinates: boolean;
  ownerStatus: string;
  reviewsCount: number;
  avgRating: number;
  bookingsCount: number;
}

export interface IntelligenceResult {
  qualityScore: number;
  demandScore: number;
  riskScore: number;
  completenessScore: number;
  bookingProbability: number;
  recommendedPrice: number;
  priceDeltaPercent: number;
  marketPosition: 'below_market' | 'at_market' | 'above_market';
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  explanation: {
    text: string;
    bullets: string[];
    suggestions: string[];
  };
}

/**
 * AI Brain — центральный decision engine платформы LOCUS.
 * 
 * Принцип: deterministic AI (без ML на первом этапе).
 * Все решения основаны на правилах и эвристиках, которые можно объяснить.
 */
@Injectable()
export class AiBrainService {
  private readonly logger = new Logger(AiBrainService.name);

  constructor(
    private readonly quality: QualityStrategy,
    private readonly pricing: PricingStrategy,
    private readonly risk: RiskStrategy,
    private readonly demand: DemandStrategy,
    private readonly explainer: ExplanationGenerator,
  ) {}

  /**
   * Рассчитать полный AI профиль для объявления
   */
  async calculateIntelligence(context: ListingContext): Promise<IntelligenceResult> {
    this.logger.log(`Calculating intelligence for listing ${context.id}`);

    // 1. Calculate individual scores
    const qualityScore = this.quality.calculate(context);
    const demandScore = this.demand.calculate(context);
    const riskResult = this.risk.calculate(context);
    const pricingResult = this.pricing.calculate(context, demandScore);

    // 2. Calculate completeness
    const completenessScore = this.calculateCompleteness(context);

    // 3. Calculate booking probability
    const bookingProbability = this.calculateBookingProbability(
      qualityScore,
      demandScore,
      riskResult.score,
      pricingResult.marketPosition,
    );

    // 4. Generate explanation
    const explanation = this.explainer.generate({
      qualityScore,
      demandScore,
      riskScore: riskResult.score,
      riskFactors: riskResult.factors,
      pricingResult,
      completenessScore,
      bookingProbability,
    });

    return {
      qualityScore,
      demandScore,
      riskScore: riskResult.score,
      completenessScore,
      bookingProbability,
      recommendedPrice: pricingResult.recommendedPrice,
      priceDeltaPercent: pricingResult.deltaPct,
      marketPosition: pricingResult.marketPosition,
      riskLevel: riskResult.level,
      riskFactors: riskResult.factors,
      explanation,
    };
  }

  /**
   * Быстрый пересчет отдельного score (для событий)
   */
  async recalculateQuality(context: ListingContext): Promise<number> {
    return this.quality.calculate(context);
  }

  async recalculateDemand(context: ListingContext): Promise<number> {
    return this.demand.calculate(context);
  }

  async recalculateRisk(context: ListingContext): Promise<{ score: number; level: string; factors: string[] }> {
    return this.risk.calculate(context);
  }

  private calculateCompleteness(context: ListingContext): number {
    let score = 0;
    const weights = {
      title: 10,
      description: 20,
      photos: 25,
      amenities: 15,
      coordinates: 15,
      price: 15,
    };

    // Title (10 points)
    if (context.title && context.title.length >= 10) score += weights.title;
    else if (context.title) score += weights.title * 0.5;

    // Description (20 points)
    const descLen = context.description?.length ?? 0;
    if (descLen >= 200) score += weights.description;
    else if (descLen >= 100) score += weights.description * 0.7;
    else if (descLen >= 50) score += weights.description * 0.4;
    else if (descLen > 0) score += weights.description * 0.2;

    // Photos (25 points)
    if (context.photosCount >= 5) score += weights.photos;
    else if (context.photosCount >= 3) score += weights.photos * 0.7;
    else if (context.photosCount >= 1) score += weights.photos * 0.4;

    // Amenities (15 points)
    if (context.amenitiesCount >= 5) score += weights.amenities;
    else if (context.amenitiesCount >= 3) score += weights.amenities * 0.7;
    else if (context.amenitiesCount >= 1) score += weights.amenities * 0.4;

    // Coordinates (15 points)
    if (context.hasCoordinates) score += weights.coordinates;

    // Price (15 points)
    if (context.basePrice > 0) score += weights.price;

    return Math.round(score);
  }

  private calculateBookingProbability(
    quality: number,
    demand: number,
    risk: number,
    marketPosition: string,
  ): number {
    // Base probability from scores
    let prob = (quality * 0.3 + demand * 0.4 + (100 - risk) * 0.3) / 100;

    // Adjust for market position
    if (marketPosition === 'below_market') prob *= 1.15;
    else if (marketPosition === 'above_market') prob *= 0.85;

    // Clamp to [0.05, 0.95]
    return Math.max(0.05, Math.min(0.95, prob));
  }
}
