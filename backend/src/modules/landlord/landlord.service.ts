import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductIntelligenceService } from '../ai/product-intelligence/product-intelligence.service';

export interface PropertyItem {
  listingId: string;
  title: string;
  city: string;
  currentPrice: number;
  status: string;
  locusRating: number;
  ratingLabel: string;
  priceAdvice: {
    recommended: number;
    position: string;
    diffPercent: number;
  };
  riskLevel: string;
  bookingProbability: number;
}

export interface LandlordDashboardResponse {
  summary: {
    totalListings: number;
    publishedListings: number;
    avgLocusRating: number;
    revenue30d: number;
    pendingBookings: number;
    riskLevel: string;
  };
  properties: PropertyItem[];
  recommendations: string[];
  recentBookings: any[];
}

@Injectable()
export class LandlordService {
  private readonly logger = new Logger(LandlordService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligence: ProductIntelligenceService,
  ) {}

  /**
   * Получить данные дашборда арендодателя
   */
  async getDashboard(landlordId: string): Promise<LandlordDashboardResponse> {
    this.logger.log(`Getting dashboard for landlord ${landlordId}`);

    // Получаем объявления с анализом
    const listings = await this.prisma.listing.findMany({
      where: { ownerId: landlordId },
      include: {
        intelligence: true,
        analysis: true,
        photos: { take: 1 },
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { totalPrice: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Формируем список объектов
    const properties: PropertyItem[] = [];
    
    for (const listing of listings) {
      const intel = listing.intelligence;
      const analysis = listing.analysis;
      
      properties.push({
        listingId: listing.id,
        title: listing.title,
        city: listing.city,
        currentPrice: listing.basePrice,
        status: listing.status,
        locusRating: analysis?.locusRating ?? intel?.qualityScore ?? 0,
        ratingLabel: analysis?.ratingLabel ?? this.getRatingLabel(intel?.qualityScore ?? 0),
        priceAdvice: {
          recommended: analysis?.priceAdvice ?? intel?.recommendedPrice ?? listing.basePrice,
          position: analysis?.pricePosition ?? intel?.marketPosition ?? 'market',
          diffPercent: analysis?.priceDiffPercent ?? intel?.priceDeltaPercent ?? 0,
        },
        riskLevel: analysis?.riskLevel ?? intel?.riskLevel ?? 'low',
        bookingProbability: intel?.bookingProbability ?? 0.5,
      });
    }

    // Считаем статистику
    const totalListings = listings.length;
    const publishedListings = listings.filter(l => l.status === 'PUBLISHED').length;
    const avgRating = properties.reduce((s, p) => s + p.locusRating, 0) / (totalListings || 1);
    
    // Доход за 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenue30d = listings.reduce((sum, l) => {
      return sum + l.bookings
        .filter(b => b.createdAt >= thirtyDaysAgo)
        .reduce((s, b) => s + b.totalPrice, 0);
    }, 0);

    // Ожидающие бронирования
    const pendingBookings = await this.prisma.booking.count({
      where: { hostId: landlordId, status: 'PENDING' },
    });

    // Определяем общий уровень риска
    const highRiskCount = properties.filter(p => p.riskLevel === 'high').length;
    const riskLevel = highRiskCount > totalListings / 2 ? 'high' : 
                      highRiskCount > 0 ? 'medium' : 'low';

    // Генерируем рекомендации
    const recommendations = this.generateRecommendations(properties);

    // Последние бронирования
    const recentBookings = await this.prisma.booking.findMany({
      where: { hostId: landlordId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        listing: { select: { title: true } },
        guest: { select: { email: true, profile: true } },
      },
    });

    return {
      summary: {
        totalListings,
        publishedListings,
        avgLocusRating: Math.round(avgRating),
        revenue30d,
        pendingBookings,
        riskLevel,
      },
      properties,
      recommendations,
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        listingTitle: b.listing.title,
        guestName: b.guest.profile?.name ?? b.guest.email,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        totalPrice: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt,
      })),
    };
  }

  /**
   * Пересчитать аналитику для всех объектов
   */
  async recalculateAnalytics(landlordId: string): Promise<void> {
    this.logger.log(`Recalculating analytics for landlord ${landlordId}`);
    await this.intelligence.recalculateForHost(landlordId);
  }

  private getRatingLabel(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs_improvement';
  }

  private generateRecommendations(properties: PropertyItem[]): string[] {
    const recommendations: string[] = [];

    const lowRated = properties.filter(p => p.locusRating < 50);
    if (lowRated.length > 0) {
      recommendations.push(
        `${lowRated.length} объявлений имеют низкий рейтинг LOCUS. Улучшите описания и добавьте фотографии.`
      );
    }

    const overpriced = properties.filter(p => p.priceAdvice.position === 'above_market');
    if (overpriced.length > 0) {
      recommendations.push(
        `У ${overpriced.length} объявлений цена выше рынка. Рассмотрите снижение для увеличения бронирований.`
      );
    }

    const highRisk = properties.filter(p => p.riskLevel === 'high');
    if (highRisk.length > 0) {
      recommendations.push(
        `${highRisk.length} объявлений имеют высокий уровень риска. Проверьте и исправьте проблемы.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Отличная работа! Ваши объявления в хорошем состоянии.');
    }

    return recommendations;
  }
}
