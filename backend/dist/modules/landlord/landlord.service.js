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
var LandlordService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandlordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const product_intelligence_service_1 = require("../ai/product-intelligence/product-intelligence.service");
let LandlordService = LandlordService_1 = class LandlordService {
    constructor(prisma, intelligence) {
        this.prisma = prisma;
        this.intelligence = intelligence;
        this.logger = new common_1.Logger(LandlordService_1.name);
    }
    async getDashboard(landlordId) {
        this.logger.log(`Getting dashboard for landlord ${landlordId}`);
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
        const properties = [];
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
        const totalListings = listings.length;
        const publishedListings = listings.filter(l => l.status === 'PUBLISHED').length;
        const avgRating = properties.reduce((s, p) => s + p.locusRating, 0) / (totalListings || 1);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const revenue30d = listings.reduce((sum, l) => {
            return sum + l.bookings
                .filter(b => b.createdAt >= thirtyDaysAgo)
                .reduce((s, b) => s + b.totalPrice, 0);
        }, 0);
        const pendingBookings = await this.prisma.booking.count({
            where: { hostId: landlordId, status: 'PENDING' },
        });
        const highRiskCount = properties.filter(p => p.riskLevel === 'high').length;
        const riskLevel = highRiskCount > totalListings / 2 ? 'high' :
            highRiskCount > 0 ? 'medium' : 'low';
        const recommendations = this.generateRecommendations(properties);
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
    async recalculateAnalytics(landlordId) {
        this.logger.log(`Recalculating analytics for landlord ${landlordId}`);
        await this.intelligence.recalculateForHost(landlordId);
    }
    getRatingLabel(score) {
        if (score >= 80)
            return 'excellent';
        if (score >= 60)
            return 'good';
        if (score >= 40)
            return 'average';
        return 'needs_improvement';
    }
    generateRecommendations(properties) {
        const recommendations = [];
        const lowRated = properties.filter(p => p.locusRating < 50);
        if (lowRated.length > 0) {
            recommendations.push(`${lowRated.length} объявлений имеют низкий рейтинг LOCUS. Улучшите описания и добавьте фотографии.`);
        }
        const overpriced = properties.filter(p => p.priceAdvice.position === 'above_market');
        if (overpriced.length > 0) {
            recommendations.push(`У ${overpriced.length} объявлений цена выше рынка. Рассмотрите снижение для увеличения бронирований.`);
        }
        const highRisk = properties.filter(p => p.riskLevel === 'high');
        if (highRisk.length > 0) {
            recommendations.push(`${highRisk.length} объявлений имеют высокий уровень риска. Проверьте и исправьте проблемы.`);
        }
        if (recommendations.length === 0) {
            recommendations.push('Отличная работа! Ваши объявления в хорошем состоянии.');
        }
        return recommendations;
    }
};
exports.LandlordService = LandlordService;
exports.LandlordService = LandlordService = LandlordService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        product_intelligence_service_1.ProductIntelligenceService])
], LandlordService);
