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
var ProductIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_brain_service_1 = require("../ai-brain/ai-brain.service");
let ProductIntelligenceService = ProductIntelligenceService_1 = class ProductIntelligenceService {
    constructor(prisma, aiBrain) {
        this.prisma = prisma;
        this.aiBrain = aiBrain;
        this.logger = new common_1.Logger(ProductIntelligenceService_1.name);
    }
    async getOrCreateProfile(listingId) {
        const existing = await this.prisma.propertyIntelligence.findUnique({
            where: { listingId },
        });
        if (existing) {
            return this.toProfile(existing);
        }
        return this.calculateAndSave(listingId);
    }
    async calculateAndSave(listingId) {
        this.logger.log(`Calculating intelligence for listing ${listingId}`);
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
        const context = {
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
        const result = await this.aiBrain.calculateIntelligence(context);
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
    async recalculateForHost(hostId) {
        const listings = await this.prisma.listing.findMany({
            where: { ownerId: hostId },
            select: { id: true },
        });
        const profiles = [];
        for (const listing of listings) {
            const profile = await this.calculateAndSave(listing.id);
            profiles.push(profile);
        }
        return profiles;
    }
    async getHostSummary(hostId) {
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
        const totalRevenueForecast = profiles.reduce((s, p) => {
            const monthlyRevenue = (p.recommendedPrice || p.listing.basePrice) * p.bookingProbability * 30;
            return s + monthlyRevenue;
        }, 0);
        const healthScore = avgQuality * 0.3 + avgDemand * 0.3 + (100 - avgRisk) * 0.2 + avgBookingProbability * 100 * 0.2;
        let overallHealth;
        if (healthScore >= 70) {
            overallHealth = 'excellent';
        }
        else if (healthScore >= 45) {
            overallHealth = 'good';
        }
        else {
            overallHealth = 'needs_attention';
        }
        const recommendations = [];
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
    toProfile(data) {
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
            riskFactors: data.riskFactors,
            explanation: data.explanation,
            lastCalculatedAt: data.lastCalculatedAt,
        };
    }
};
exports.ProductIntelligenceService = ProductIntelligenceService;
exports.ProductIntelligenceService = ProductIntelligenceService = ProductIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_brain_service_1.AiBrainService])
], ProductIntelligenceService);
