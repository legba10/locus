import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QualityAnalyzer } from './analyzers/quality.analyzer';
import { PriceAdvisor } from './analyzers/price.advisor';
import { DemandAnalyzer } from './analyzers/demand.analyzer';
import { RiskAnalyzer } from './analyzers/risk.analyzer';
import { TipsGenerator } from './analyzers/tips.generator';
import { AIInsight, OwnerDashboardData, MarketOverview } from './types';

/**
 * Главный сервис AI-анализа
 * Объединяет все анализаторы и формирует понятные рекомендации
 */
@Injectable()
export class InsightService {
  private readonly logger = new Logger(InsightService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly qualityAnalyzer: QualityAnalyzer,
    private readonly priceAdvisor: PriceAdvisor,
    private readonly demandAnalyzer: DemandAnalyzer,
    private readonly riskAnalyzer: RiskAnalyzer,
    private readonly tipsGenerator: TipsGenerator,
  ) {}

  /**
   * Получить полный AI-анализ объявления
   */
  async getListingInsight(listingId: string): Promise<AIInsight> {
    this.logger.log(`Getting insight for listing ${listingId}`);

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        photos: true,
        amenities: { include: { amenity: true } },
        reviews: true,
        bookings: { where: { status: 'CONFIRMED' } },
        owner: {
          include: {
            bookingsAsHost: { where: { status: 'CONFIRMED' } },
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Объявление не найдено');
    }

    // 1. Анализ качества
    const qualityResult = this.qualityAnalyzer.analyze({
      photos: listing.photos,
      description: listing.description,
      amenities: listing.amenities,
      reviews: listing.reviews,
      address: listing.addressLine ?? undefined,
      coordinates: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
      houseRules: listing.houseRules,
      bookings: listing.bookings,
    });

    // 2. Анализ цены
    const priceResult = await this.priceAdvisor.analyze({
      listingId: listing.id,
      currentPrice: listing.basePrice,
      city: listing.city,
      capacityGuests: listing.capacityGuests,
      bedrooms: listing.bedrooms,
      amenities: listing.amenities,
      reviews: listing.reviews,
    });

    // 3. Анализ спроса
    const demandResult = await this.demandAnalyzer.analyze({
      city: listing.city,
      price: listing.basePrice,
      amenities: listing.amenities,
      qualityScore: qualityResult.score,
    });

    // 4. Анализ рисков
    const riskResult = this.riskAnalyzer.analyze({
      photos: listing.photos,
      description: listing.description,
      reviews: listing.reviews,
      price: listing.basePrice,
      coordinates: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
      ownerBookingsCount: listing.owner.bookingsAsHost.length,
    });

    // 5. Генерация плюсов
    const pros = this.qualityAnalyzer.generatePros(
      {
        photos: listing.photos,
        description: listing.description,
        amenities: listing.amenities,
        reviews: listing.reviews,
        address: listing.addressLine ?? undefined,
        coordinates: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
        bookings: listing.bookings,
      },
      qualityResult,
    );

    // 6. Генерация советов
    const tips = this.tipsGenerator.generate({
      photos: listing.photos,
      description: listing.description,
      amenities: listing.amenities,
      reviews: listing.reviews,
      price: listing.basePrice,
      pricePosition: priceResult.position,
      coordinates: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
      houseRules: listing.houseRules,
      qualityScore: qualityResult.score,
    });

    // 7. Генерация резюме
    const summary = this.tipsGenerator.generateSummary(
      qualityResult.score,
      priceResult.position,
      demandResult.level,
    );

    return {
      score: qualityResult.score,
      scoreLabel: qualityResult.label,
      pros,
      risks: riskResult.risks,
      priceRecommendation: priceResult.recommended,
      pricePosition: priceResult.position,
      priceDiff: priceResult.diffPercent,
      demandLevel: demandResult.level,
      bookingProbability: demandResult.bookingProbability,
      tips,
      summary,
    };
  }

  /**
   * Получить данные для кабинета владельца
   */
  async getOwnerDashboard(ownerId: string): Promise<OwnerDashboardData> {
    this.logger.log(`Getting dashboard for owner ${ownerId}`);

    // Получаем все объявления владельца
    const listings = await this.prisma.listing.findMany({
      where: { ownerId },
      include: {
        photos: { take: 1, orderBy: { sortOrder: 'asc' } },
        amenities: { include: { amenity: true } },
        reviews: true,
        bookings: { where: { status: 'CONFIRMED' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Получаем insight для каждого объявления
    const listingsWithInsight = await Promise.all(
      listings.map(async (listing) => {
        const insight = await this.getListingInsight(listing.id);
        return {
          id: listing.id,
          title: listing.title,
          city: listing.city,
          price: listing.basePrice,
          status: listing.status,
          insight,
          photo: listing.photos[0]?.url,
        };
      }),
    );

    // Считаем статистику
    const totalListings = listings.length;
    const publishedListings = listings.filter(l => l.status === 'PUBLISHED').length;
    const avgScore = listingsWithInsight.reduce((s, l) => s + l.insight.score, 0) / (totalListings || 1);

    // Доход за 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const confirmedBookings = await this.prisma.booking.findMany({
      where: {
        hostId: ownerId,
        status: 'CONFIRMED',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { totalPrice: true },
    });
    const totalRevenue30d = confirmedBookings.reduce((s, b) => s + b.totalPrice, 0);

    // Ожидающие подтверждения
    const pendingBookings = await this.prisma.booking.count({
      where: { hostId: ownerId, status: 'PENDING' },
    });

    // Генерируем рекомендации для владельца
    const recommendations = this.generateOwnerRecommendations(listingsWithInsight);

    return {
      summary: {
        totalListings,
        publishedListings,
        avgScore: Math.round(avgScore),
        totalRevenue30d,
        pendingBookings,
      },
      listings: listingsWithInsight,
      recommendations,
    };
  }

  /**
   * Получить обзор рынка
   */
  async getMarketOverview(city?: string): Promise<MarketOverview> {
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
    const avgPrice = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Статистика по городам
    const cityMap = new Map<string, { prices: number[] }>();
    for (const l of listings) {
      if (!cityMap.has(l.city)) {
        cityMap.set(l.city, { prices: [] });
      }
      cityMap.get(l.city)!.prices.push(l.basePrice);
    }

    const cities = await Promise.all(
      Array.from(cityMap.entries()).map(async ([city, data]) => {
        const cityAvg = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
        const demandLevel = await this.demandAnalyzer.getCityDemand(city);
        return {
          city,
          count: data.prices.length,
          avgPrice: Math.round(cityAvg),
          demandLevel,
        };
      }),
    );

    // Сортируем по количеству объявлений
    cities.sort((a, b) => b.count - a.count);

    return {
      stats: {
        totalListings: listings.length,
        avgPrice: Math.round(avgPrice),
        priceRange: { min: minPrice, max: maxPrice },
      },
      cities: cities.slice(0, 10), // Топ 10 городов
      trends: {
        priceChange7d: 0, // TODO: реальные тренды
        demandChange7d: 0,
      },
    };
  }

  private generateOwnerRecommendations(listings: Array<{ insight: AIInsight; title: string }>): string[] {
    const recommendations: string[] = [];

    // Объявления с низкой оценкой
    const lowScoreListings = listings.filter(l => l.insight.score < 50);
    if (lowScoreListings.length > 0) {
      recommendations.push(
        `${lowScoreListings.length} объявлений требуют улучшения. Добавьте фотографии и описание.`,
      );
    }

    // Объявления с высокой ценой
    const overpriced = listings.filter(l => l.insight.pricePosition === 'above_market');
    if (overpriced.length > 0) {
      recommendations.push(
        `У ${overpriced.length} объявлений цена выше рынка. Снизьте для увеличения бронирований.`,
      );
    }

    // Объявления с высокими рисками
    const highRisk = listings.filter(l => l.insight.risks.length >= 3);
    if (highRisk.length > 0) {
      recommendations.push(
        `${highRisk.length} объявлений имеют замечания. Проверьте раздел «Риски» в каждом.`,
      );
    }

    // Позитивные рекомендации
    const excellent = listings.filter(l => l.insight.score >= 80);
    if (excellent.length > 0) {
      recommendations.push(
        `${excellent.length} объявлений отлично оформлены. Отличная работа!`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Проверьте советы LOCUS для каждого объявления.');
    }

    return recommendations;
  }
}
