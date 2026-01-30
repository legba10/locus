import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisService } from './services/analysis.service';
import { PriceAdvisorService } from './services/price-advisor.service';
import { ImprovementService } from './services/improvement.service';

export interface ListingAnalysisResult {
  listingId: string;
  locusRating: number;
  ratingLabel: string;
  priceAdvice: {
    recommended: number;
    position: string;
    diffPercent: number;
  };
  riskAssessment: {
    level: string;
    factors: string[];
  };
  explanation: {
    summary: string;
    pros: string[];
    cons: string[];
    tips: string[];
  };
  improvements: Array<{
    type: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly analysis: AnalysisService,
    private readonly priceAdvisor: PriceAdvisorService,
    private readonly improvement: ImprovementService,
  ) {}

  /**
   * Полный анализ объявления
   */
  async analyzeListing(listingId: string): Promise<ListingAnalysisResult> {
    this.logger.log(`Analyzing listing ${listingId}`);

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

    // Calculate LOCUS rating
    const rating = this.analysis.calculateLocusRating(listing);
    
    // Get price advice
    const priceAdvice = await this.priceAdvisor.getRecommendation(listing);
    
    // Assess risks
    const riskAssessment = this.analysis.assessRisks(listing);
    
    // Generate explanation
    const explanation = this.analysis.generateExplanation(listing, rating, priceAdvice, riskAssessment);
    
    // Get improvement suggestions
    const improvements = this.improvement.getSuggestions(listing);

    // Save analysis to DB
    await this.saveAnalysis(listingId, {
      locusRating: rating.score,
      ratingLabel: rating.label,
      priceAdvice,
      riskAssessment,
      explanation,
      improvements,
    });

    return {
      listingId,
      locusRating: rating.score,
      ratingLabel: rating.label,
      priceAdvice: {
        recommended: priceAdvice.recommended,
        position: priceAdvice.position,
        diffPercent: priceAdvice.diffPercent,
      },
      riskAssessment: {
        level: riskAssessment.level,
        factors: riskAssessment.factors,
      },
      explanation,
      improvements,
    };
  }

  /**
   * Рекомендация цены
   */
  async recommendPrice(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { photos: true, amenities: { include: { amenity: true } } },
    });

    if (!listing) {
      throw new NotFoundException('Объявление не найдено');
    }

    const advice = await this.priceAdvisor.getRecommendation(listing);
    
    return {
      currentPrice: listing.basePrice,
      recommendedPrice: advice.recommended,
      position: advice.position,
      diffPercent: advice.diffPercent,
      reasoning: advice.reasoning,
    };
  }

  /**
   * Объяснение оценки
   */
  async explainListingScore(listingId: string) {
    const analysis = await this.prisma.listingAnalysis.findUnique({
      where: { listingId },
    });

    if (!analysis) {
      // Run analysis if not exists
      const result = await this.analyzeListing(listingId);
      return {
        locusRating: result.locusRating,
        ratingLabel: result.ratingLabel,
        explanation: result.explanation,
      };
    }

    return {
      locusRating: analysis.locusRating,
      ratingLabel: analysis.ratingLabel,
      explanation: analysis.explanation,
    };
  }

  /**
   * Предложения по улучшению
   */
  async suggestImprovements(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        photos: true,
        amenities: { include: { amenity: true } },
        analysis: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Объявление не найдено');
    }

    // Get fresh suggestions
    const suggestions = this.improvement.getSuggestions(listing);

    return {
      listingId,
      currentRating: listing.analysis?.locusRating ?? 0,
      potentialRating: this.improvement.calculatePotentialRating(listing, suggestions),
      suggestions,
    };
  }

  /**
   * Получить аналитику арендодателя
   */
  async getLandlordInsights(landlordId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { ownerId: landlordId },
      include: {
        analysis: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { totalPrice: true, createdAt: true },
        },
        reviews: { select: { rating: true } },
      },
    });

    // Calculate aggregate stats
    const totalListings = listings.length;
    const avgRating = listings.reduce((sum, l) => sum + (l.analysis?.locusRating ?? 0), 0) / (totalListings || 1);
    
    // Revenue last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenue30d = listings.reduce((sum, l) => {
      return sum + l.bookings
        .filter(b => b.createdAt >= thirtyDaysAgo)
        .reduce((s, b) => s + b.totalPrice, 0);
    }, 0);

    // Get aggregate recommendations
    const recommendations = this.generateLandlordRecommendations(listings);

    return {
      summary: {
        totalListings,
        avgLocusRating: Math.round(avgRating),
        revenue30d,
        listingsNeedingAttention: listings.filter(l => (l.analysis?.locusRating ?? 0) < 50).length,
      },
      properties: listings.map(l => ({
        id: l.id,
        title: l.title,
        city: l.city,
        locusRating: l.analysis?.locusRating ?? 0,
        ratingLabel: l.analysis?.ratingLabel ?? 'не оценено',
        pricePosition: l.analysis?.pricePosition ?? 'unknown',
      })),
      recommendations,
    };
  }

  /**
   * Обзор рынка
   */
  async getMarketOverview(city?: string) {
    const where = city ? { city } : {};
    
    const [listings, totalCount] = await Promise.all([
      this.prisma.listing.findMany({
        where: { ...where, status: 'PUBLISHED' },
        select: {
          basePrice: true,
          city: true,
          analysis: { select: { locusRating: true } },
        },
      }),
      this.prisma.listing.count({ where: { ...where, status: 'PUBLISHED' } }),
    ]);

    // Calculate market stats
    const prices = listings.map(l => l.basePrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
    const minPrice = Math.min(...prices) || 0;
    const maxPrice = Math.max(...prices) || 0;

    // City breakdown
    const cityStats = listings.reduce((acc, l) => {
      const key = l.city ?? "unknown";
      if (!acc[key]) {
        acc[key] = { count: 0, totalPrice: 0 };
      }
      acc[key].count++;
      acc[key].totalPrice += l.basePrice;
      return acc;
    }, {} as Record<string, { count: number; totalPrice: number }>);

    return {
      overview: {
        totalListings: totalCount,
        avgPrice: Math.round(avgPrice),
        priceRange: { min: minPrice, max: maxPrice },
      },
      cities: Object.entries(cityStats).map(([city, stats]) => ({
        city,
        listingCount: stats.count,
        avgPrice: Math.round(stats.totalPrice / stats.count),
      })),
    };
  }

  private async saveAnalysis(listingId: string, data: any) {
    await this.prisma.listingAnalysis.upsert({
      where: { listingId },
      update: {
        locusRating: data.locusRating,
        ratingLabel: data.ratingLabel,
        priceAdvice: data.priceAdvice.recommended,
        pricePosition: data.priceAdvice.position,
        priceDiffPercent: data.priceAdvice.diffPercent,
        riskLevel: data.riskAssessment.level,
        riskFactors: data.riskAssessment.factors,
        explanation: data.explanation,
        improvements: data.improvements,
      },
      create: {
        listingId,
        locusRating: data.locusRating,
        ratingLabel: data.ratingLabel,
        priceAdvice: data.priceAdvice.recommended,
        pricePosition: data.priceAdvice.position,
        priceDiffPercent: data.priceAdvice.diffPercent,
        riskLevel: data.riskAssessment.level,
        riskFactors: data.riskAssessment.factors,
        explanation: data.explanation,
        improvements: data.improvements,
      },
    });
  }

  private generateLandlordRecommendations(listings: any[]): string[] {
    const recommendations: string[] = [];

    const lowRatedCount = listings.filter(l => (l.analysis?.locusRating ?? 0) < 50).length;
    if (lowRatedCount > 0) {
      recommendations.push(`У ${lowRatedCount} объявлений низкий рейтинг LOCUS. Улучшите описание и фото.`);
    }

    const noPhotosCount = listings.filter(l => !l.photos || l.photos.length === 0).length;
    if (noPhotosCount > 0) {
      recommendations.push(`Добавьте фотографии к ${noPhotosCount} объявлениям для повышения конверсии.`);
    }

    const overpriced = listings.filter(l => l.analysis?.pricePosition === 'above_market').length;
    if (overpriced > 0) {
      recommendations.push(`${overpriced} объявлений имеют цену выше рынка. Рассмотрите снижение для увеличения бронирований.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Все ваши объявления в хорошем состоянии! Продолжайте в том же духе.');
    }

    return recommendations;
  }
}
