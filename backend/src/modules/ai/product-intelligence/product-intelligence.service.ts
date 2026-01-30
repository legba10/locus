import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiBrainService, ListingContext } from '../ai-brain/ai-brain.service';

export interface IntelligenceProfile {
  listingId: string;
  qualityScore: number;
  demandScore: number;
  riskScore: number;
  completenessScore: number;
  bookingProbability: number;
  recommendedPrice: number;
  priceDeltaPercent: number;
  marketPosition: string;
  riskLevel: string;
  riskFactors: string[];
  explanation: {
    text: string;
    bullets: string[];
    suggestions: string[];
  };
  lastCalculatedAt: Date;
}

/**
 * Product Intelligence Service — управление AI профилями объявлений.
 * 
 * Каждое объявление имеет AI профиль с:
 * - Quality Score
 * - Demand Score
 * - Risk Score
 * - Booking Probability
 * - Recommended Price
 * - Human-readable Explanation
 */
@Injectable()
export class ProductIntelligenceService {
  private readonly logger = new Logger(ProductIntelligenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiBrain: AiBrainService,
  ) {}

  /**
   * Получить или создать AI профиль для объявления
   */
  async getOrCreateProfile(listingId: string): Promise<IntelligenceProfile> {
    // Попробуем найти существующий профиль
    const existing = await this.prisma.propertyIntelligence.findUnique({
      where: { listingId },
    });

    if (existing) {
      return this.toProfile(existing);
    }

    // Создать новый профиль
    return this.calculateAndSave(listingId);
  }

  /**
   * Рассчитать и сохранить AI профиль
   */
  async calculateAndSave(listingId: string): Promise<IntelligenceProfile> {
    this.logger.log(`Calculating intelligence for listing ${listingId}`);

    // Загрузить данные объявления
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        owner: true,
        photos: true,
        amenities: { include: { amenity: true } },
        reviews: true,
        bookings: true,
      },
    });

    if (!listing) {
      throw new Error(`Listing ${listingId} not found`);
    }

    // Подготовить контекст для AI Brain
    const context: ListingContext = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      city: listing.city,
      basePrice: listing.basePrice,
      currency: listing.currency,
      photosCount: listing.photos.length,
      amenitiesCount: listing.amenities.length,
      hasCoordinates: listing.lat != null && listing.lng != null,
      ownerStatus: listing.owner.status,
      reviewsCount: listing.reviews.length,
      avgRating: listing.reviews.length > 0
        ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
        : 0,
      bookingsCount: listing.bookings.length,
    };

    // Рассчитать через AI Brain
    const result = await this.aiBrain.calculateIntelligence(context);

    // Сохранить в БД
    const saved = await this.prisma.propertyIntelligence.upsert({
      where: { listingId },
      update: {
        qualityScore: result.qualityScore,
        demandScore: result.demandScore,
        riskScore: result.riskScore,
        completenessScore: result.completenessScore,
        bookingProbability: result.bookingProbability,
        recommendedPrice: result.recommendedPrice,
        priceDeltaPercent: result.priceDeltaPercent,
        marketPosition: result.marketPosition,
        riskLevel: result.riskLevel,
        riskFactors: result.riskFactors,
        explanation: result.explanation,
        lastCalculatedAt: new Date(),
        calculationVersion: 'v1',
      },
      create: {
        listingId,
        qualityScore: result.qualityScore,
        demandScore: result.demandScore,
        riskScore: result.riskScore,
        completenessScore: result.completenessScore,
        bookingProbability: result.bookingProbability,
        recommendedPrice: result.recommendedPrice,
        priceDeltaPercent: result.priceDeltaPercent,
        marketPosition: result.marketPosition,
        riskLevel: result.riskLevel,
        riskFactors: result.riskFactors,
        explanation: result.explanation,
        lastCalculatedAt: new Date(),
        calculationVersion: 'v1',
      },
    });

    this.logger.log(`Saved intelligence for listing ${listingId}: quality=${result.qualityScore}, demand=${result.demandScore}`);

    return this.toProfile(saved);
  }

  /**
   * Массовый пересчёт для всех объявлений хоста
   */
  async recalculateForHost(hostId: string): Promise<IntelligenceProfile[]> {
    const listings = await this.prisma.listing.findMany({
      where: { ownerId: hostId },
      select: { id: true },
    });

    const profiles: IntelligenceProfile[] = [];
    for (const listing of listings) {
      const profile = await this.calculateAndSave(listing.id);
      profiles.push(profile);
    }

    return profiles;
  }

  /**
   * Получить сводку для хоста
   */
  async getHostSummary(hostId: string): Promise<{
    totalListings: number;
    avgQuality: number;
    avgDemand: number;
    avgRisk: number;
    avgBookingProbability: number;
    totalRevenueForecast: number;
    overallHealth: 'excellent' | 'good' | 'needs_attention';
    recommendations: string[];
  }> {
    const profiles = await this.prisma.propertyIntelligence.findMany({
      where: {
        listing: { ownerId: hostId },
      },
      include: {
        listing: true,
      },
    });

    if (profiles.length === 0) {
      return {
        totalListings: 0,
        avgQuality: 0,
        avgDemand: 0,
        avgRisk: 0,
        avgBookingProbability: 0,
        totalRevenueForecast: 0,
        overallHealth: 'needs_attention',
        recommendations: ['Создайте первое объявление'],
      };
    }

    const avgQuality = profiles.reduce((s, p) => s + p.qualityScore, 0) / profiles.length;
    const avgDemand = profiles.reduce((s, p) => s + p.demandScore, 0) / profiles.length;
    const avgRisk = profiles.reduce((s, p) => s + p.riskScore, 0) / profiles.length;
    const avgBookingProbability = profiles.reduce((s, p) => s + p.bookingProbability, 0) / profiles.length;

    // Прогноз выручки: сумма (recommendedPrice * bookingProbability * 30 дней)
    const totalRevenueForecast = profiles.reduce((s, p) => {
      const monthlyRevenue = (p.recommendedPrice || p.listing.basePrice) * p.bookingProbability * 30;
      return s + monthlyRevenue;
    }, 0);

    // Определить health
    const healthScore = avgQuality * 0.3 + avgDemand * 0.3 + (100 - avgRisk) * 0.2 + avgBookingProbability * 100 * 0.2;
    let overallHealth: 'excellent' | 'good' | 'needs_attention';
    if (healthScore >= 70) {
      overallHealth = 'excellent';
    } else if (healthScore >= 45) {
      overallHealth = 'good';
    } else {
      overallHealth = 'needs_attention';
    }

    // Рекомендации
    const recommendations: string[] = [];
    if (avgQuality < 60) {
      recommendations.push('Улучшите качество описаний и добавьте фотографии');
    }
    if (avgRisk > 50) {
      recommendations.push('Обратите внимание на объявления с высоким риском');
    }
    const underpriced = profiles.filter(p => p.recommendedPrice && p.recommendedPrice > p.listing.basePrice * 1.1);
    if (underpriced.length > 0) {
      recommendations.push(`${underpriced.length} объявлений можно поднять в цене`);
    }

    return {
      totalListings: profiles.length,
      avgQuality: Math.round(avgQuality),
      avgDemand: Math.round(avgDemand),
      avgRisk: Math.round(avgRisk),
      avgBookingProbability: Math.round(avgBookingProbability * 100) / 100,
      totalRevenueForecast: Math.round(totalRevenueForecast),
      overallHealth,
      recommendations,
    };
  }

  private toProfile(data: any): IntelligenceProfile {
    return {
      listingId: data.listingId,
      qualityScore: data.qualityScore,
      demandScore: data.demandScore,
      riskScore: data.riskScore,
      completenessScore: data.completenessScore,
      bookingProbability: data.bookingProbability,
      recommendedPrice: data.recommendedPrice,
      priceDeltaPercent: data.priceDeltaPercent,
      marketPosition: data.marketPosition,
      riskLevel: data.riskLevel,
      riskFactors: data.riskFactors as string[],
      explanation: data.explanation as any,
      lastCalculatedAt: data.lastCalculatedAt,
    };
  }
}
