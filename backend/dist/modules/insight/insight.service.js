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
var InsightService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const quality_analyzer_1 = require("./analyzers/quality.analyzer");
const price_advisor_1 = require("./analyzers/price.advisor");
const demand_analyzer_1 = require("./analyzers/demand.analyzer");
const risk_analyzer_1 = require("./analyzers/risk.analyzer");
const tips_generator_1 = require("./analyzers/tips.generator");
let InsightService = InsightService_1 = class InsightService {
    constructor(prisma, qualityAnalyzer, priceAdvisor, demandAnalyzer, riskAnalyzer, tipsGenerator) {
        this.prisma = prisma;
        this.qualityAnalyzer = qualityAnalyzer;
        this.priceAdvisor = priceAdvisor;
        this.demandAnalyzer = demandAnalyzer;
        this.riskAnalyzer = riskAnalyzer;
        this.tipsGenerator = tipsGenerator;
        this.logger = new common_1.Logger(InsightService_1.name);
    }
    async getListingInsight(listingId) {
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
            throw new common_1.NotFoundException('Объявление не найдено');
        }
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
        const priceResult = await this.priceAdvisor.analyze({
            listingId: listing.id,
            currentPrice: listing.basePrice,
            city: listing.city,
            capacityGuests: listing.capacityGuests,
            bedrooms: listing.bedrooms,
            amenities: listing.amenities,
            reviews: listing.reviews,
        });
        const demandResult = await this.demandAnalyzer.analyze({
            city: listing.city,
            price: listing.basePrice,
            amenities: listing.amenities,
            qualityScore: qualityResult.score,
        });
        const riskResult = this.riskAnalyzer.analyze({
            photos: listing.photos,
            description: listing.description,
            reviews: listing.reviews,
            price: listing.basePrice,
            coordinates: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
            ownerBookingsCount: listing.owner.bookingsAsHost.length,
        });
        const pros = this.qualityAnalyzer.generatePros({
            photos: listing.photos,
            description: listing.description,
            amenities: listing.amenities,
            reviews: listing.reviews,
            address: listing.addressLine ?? undefined,
            coordinates: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
            bookings: listing.bookings,
        }, qualityResult);
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
        const summary = this.tipsGenerator.generateSummary(qualityResult.score, priceResult.position, demandResult.level);
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
    async getOwnerDashboard(ownerId) {
        this.logger.log(`Getting dashboard for owner ${ownerId}`);
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
        const listingsWithInsight = await Promise.all(listings.map(async (listing) => {
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
        }));
        const totalListings = listings.length;
        const publishedListings = listings.filter(l => l.status === 'PUBLISHED').length;
        const avgScore = listingsWithInsight.reduce((s, l) => s + l.insight.score, 0) / (totalListings || 1);
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
        const pendingBookings = await this.prisma.booking.count({
            where: { hostId: ownerId, status: 'PENDING' },
        });
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
    async getMarketOverview(city) {
        const where = city ? { city, status: 'PUBLISHED' } : { status: 'PUBLISHED' };
        const listings = await this.prisma.listing.findMany({
            where,
            select: {
                basePrice: true,
                city: true,
            },
        });
        const prices = listings.map(l => l.basePrice);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const cityMap = new Map();
        for (const l of listings) {
            if (!cityMap.has(l.city)) {
                cityMap.set(l.city, { prices: [] });
            }
            cityMap.get(l.city).prices.push(l.basePrice);
        }
        const cities = await Promise.all(Array.from(cityMap.entries()).map(async ([city, data]) => {
            const cityAvg = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
            const demandLevel = await this.demandAnalyzer.getCityDemand(city);
            return {
                city,
                count: data.prices.length,
                avgPrice: Math.round(cityAvg),
                demandLevel,
            };
        }));
        cities.sort((a, b) => b.count - a.count);
        return {
            stats: {
                totalListings: listings.length,
                avgPrice: Math.round(avgPrice),
                priceRange: { min: minPrice, max: maxPrice },
            },
            cities: cities.slice(0, 10),
            trends: {
                priceChange7d: 0,
                demandChange7d: 0,
            },
        };
    }
    generateOwnerRecommendations(listings) {
        const recommendations = [];
        const lowScoreListings = listings.filter(l => l.insight.score < 50);
        if (lowScoreListings.length > 0) {
            recommendations.push(`${lowScoreListings.length} объявлений требуют улучшения. Добавьте фотографии и описание.`);
        }
        const overpriced = listings.filter(l => l.insight.pricePosition === 'above_market');
        if (overpriced.length > 0) {
            recommendations.push(`У ${overpriced.length} объявлений цена выше рынка. Снизьте для увеличения бронирований.`);
        }
        const highRisk = listings.filter(l => l.insight.risks.length >= 3);
        if (highRisk.length > 0) {
            recommendations.push(`${highRisk.length} объявлений имеют замечания. Проверьте раздел «Риски» в каждом.`);
        }
        const excellent = listings.filter(l => l.insight.score >= 80);
        if (excellent.length > 0) {
            recommendations.push(`${excellent.length} объявлений отлично оформлены. Отличная работа!`);
        }
        if (recommendations.length === 0) {
            recommendations.push('Проверьте советы LOCUS для каждого объявления.');
        }
        return recommendations;
    }
};
exports.InsightService = InsightService;
exports.InsightService = InsightService = InsightService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quality_analyzer_1.QualityAnalyzer,
        price_advisor_1.PriceAdvisor,
        demand_analyzer_1.DemandAnalyzer,
        risk_analyzer_1.RiskAnalyzer,
        tips_generator_1.TipsGenerator])
], InsightService);
