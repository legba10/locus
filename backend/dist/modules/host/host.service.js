"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HostService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const product_intelligence_service_1 = require("../ai/product-intelligence/product-intelligence.service");
let HostService = HostService_1 = class HostService {
    constructor(prisma, intelligence) {
        this.prisma = prisma;
        this.intelligence = intelligence;
        this.logger = new common_1.Logger(HostService_1.name);
    }
    async getHostIntelligence(hostId) {
        this.logger.log(`Getting intelligence for host ${hostId}`);
        const listings = await this.prisma.listing.findMany({
            where: { ownerId: hostId },
            include: {
                intelligence: true,
                photos: { take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
        const properties = [];
        for (const listing of listings) {
            let intel = listing.intelligence;
            if (!intel) {
                try {
                    const profile = await this.intelligence.calculateAndSave(listing.id);
                    intel = await this.prisma.propertyIntelligence.findUnique({
                        where: { listingId: listing.id },
                    });
                }
                catch (e) {
                    this.logger.warn(`Failed to calculate intelligence for ${listing.id}:`, e);
                }
            }
            const explanation = intel?.explanation ?? {
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
        const summary = await this.intelligence.getHostSummary(hostId);
        const occupancyForecast = summary.avgBookingProbability;
        const revenueForecast = summary.totalRevenueForecast;
        let riskLevel = 'low';
        if (summary.avgRisk >= 60)
            riskLevel = 'high';
        else if (summary.avgRisk >= 35)
            riskLevel = 'medium';
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
    async recalculateAll(hostId) {
        this.logger.log(`Recalculating all intelligence for host ${hostId}`);
        await this.intelligence.recalculateForHost(hostId);
    }
    async getOverview(hostId) {
        const [totalListings, publishedListings, totalBookings, pendingBookings] = await Promise.all([
            this.prisma.listing.count({ where: { ownerId: hostId } }),
            this.prisma.listing.count({ where: { ownerId: hostId, status: 'PUBLISHED' } }),
            this.prisma.booking.count({ where: { hostId } }),
            this.prisma.booking.count({ where: { hostId, status: 'PENDING' } }),
        ]);
        const recentBookings = await this.prisma.booking.findMany({
            where: { hostId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                listing: { select: { title: true } },
                guest: { select: { email: true, profile: true } },
            },
        });
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
};
exports.HostService = HostService;
exports.HostService = HostService = HostService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        product_intelligence_service_1.ProductIntelligenceService])
], HostService);
