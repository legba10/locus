import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductIntelligenceService } from '../ai/product-intelligence/product-intelligence.service';

export interface PropertyIntelligenceItem {
  listingId: string;
  title: string;
  city: string;
  currentPrice: number;
  status: string;
  intelligence: {
    qualityScore: number;
    demandScore: number;
    riskScore: number;
    riskLevel: string;
    bookingProbability: number;
    recommendedPrice: number;
    priceDeltaPercent: number;
    marketPosition: string;
  };
  explanation: {
    text: string;
    bullets: string[];
    suggestions: string[];
  };
}

export interface HostIntelligenceResponse {
  summary: {
    totalListings: number;
    revenueForecast: number;
    occupancyForecast: number;
    riskLevel: 'low' | 'medium' | 'high';
    overallHealth: 'excellent' | 'good' | 'needs_attention';
    avgQuality: number;
    avgDemand: number;
  };
  properties: PropertyIntelligenceItem[];
  recommendations: string[];
}

@Injectable()
export class HostService {
  private readonly logger = new Logger(HostService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligence: ProductIntelligenceService,
  ) {}

  async getHostIntelligence(hostId: string): Promise<HostIntelligenceResponse> {
    this.logger.log(`Getting intelligence for host ${hostId}`);

    // Get host's listings with intelligence
    const listings = await this.prisma.listing.findMany({
      where: { ownerId: hostId },
      include: {
        intelligence: true,
        photos: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate or fetch intelligence for each listing
    const properties: PropertyIntelligenceItem[] = [];
    
    for (const listing of listings) {
      let intel = listing.intelligence;
      
      // If no intelligence exists, calculate it
      if (!intel) {
        try {
          const profile = await this.intelligence.calculateAndSave(listing.id);
          intel = await this.prisma.propertyIntelligence.findUnique({
            where: { listingId: listing.id },
          });
        } catch (e) {
          this.logger.warn(`Failed to calculate intelligence for ${listing.id}:`, e);
        }
      }

      const explanation = intel?.explanation as any ?? {
        text: 'Анализ недоступен',
        bullets: [],
        suggestions: ['Заполните описание объявления'],
      };

      properties.push({
        listingId: listing.id,
        title: listing.title,
        city: listing.city,
        currentPrice: listing.basePrice,
        status: listing.status,
        intelligence: {
          qualityScore: intel?.qualityScore ?? 0,
          demandScore: intel?.demandScore ?? 0,
          riskScore: intel?.riskScore ?? 0,
          riskLevel: intel?.riskLevel ?? 'medium',
          bookingProbability: intel?.bookingProbability ?? 0,
          recommendedPrice: intel?.recommendedPrice ?? listing.basePrice,
          priceDeltaPercent: intel?.priceDeltaPercent ?? 0,
          marketPosition: intel?.marketPosition ?? 'at_market',
        },
        explanation,
      });
    }

    // Calculate summary
    const summary = await this.intelligence.getHostSummary(hostId);
    
    // Calculate forecasts
    const occupancyForecast = summary.avgBookingProbability;
    const revenueForecast = summary.totalRevenueForecast;

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (summary.avgRisk >= 60) riskLevel = 'high';
    else if (summary.avgRisk >= 35) riskLevel = 'medium';

    return {
      summary: {
        totalListings: summary.totalListings,
        revenueForecast: Math.round(revenueForecast),
        occupancyForecast: Math.round(occupancyForecast * 100) / 100,
        riskLevel,
        overallHealth: summary.overallHealth,
        avgQuality: summary.avgQuality,
        avgDemand: summary.avgDemand,
      },
      properties,
      recommendations: summary.recommendations,
    };
  }

  async recalculateAll(hostId: string): Promise<void> {
    this.logger.log(`Recalculating all intelligence for host ${hostId}`);
    await this.intelligence.recalculateForHost(hostId);
  }

  async getOverview(hostId: string) {
    // Get basic stats
    const [totalListings, publishedListings, totalBookings, pendingBookings] = await Promise.all([
      this.prisma.listing.count({ where: { ownerId: hostId } }),
      this.prisma.listing.count({ where: { ownerId: hostId, status: 'PUBLISHED' } }),
      this.prisma.booking.count({ where: { hostId } }),
      this.prisma.booking.count({ where: { hostId, status: 'PENDING' } }),
    ]);

    // Get recent bookings
    const recentBookings = await this.prisma.booking.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        listing: { select: { title: true } },
        guest: { select: { email: true, profile: true } },
      },
    });

    // Calculate revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const confirmedBookings = await this.prisma.booking.findMany({
      where: {
        hostId,
        status: 'CONFIRMED',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { totalPrice: true },
    });
    
    const revenue30d = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      stats: {
        totalListings,
        publishedListings,
        totalBookings,
        pendingBookings,
        revenue30d,
      },
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
}
