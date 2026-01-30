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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const explanation_engine_1 = require("./explanation.engine");
const types_1 = require("../types");
let InsightEngine = class InsightEngine {
    constructor(prisma, explainer) {
        this.prisma = prisma;
        this.explainer = explainer;
    }
    async getListingInsight(listingId) {
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
            throw new common_1.NotFoundException('Объявление не найдено');
        }
        const score = this.calculateScore(listing);
        const verdict = this.getVerdict(score);
        const priceAnalysis = await this.analyzePricePosition(listing);
        const demandAnalysis = this.analyzeDemand(listing, score);
        const { pros, cons, risks } = this.explainer.generateProsCons(listing, score, priceAnalysis);
        const recommendation = this.explainer.generateRecommendation(score, priceAnalysis, demandAnalysis);
        const tips = this.explainer.generateTips(listing);
        return {
            score,
            verdict,
            verdictText: types_1.VERDICT_TEXTS[verdict] ?? "Оценка",
            pros,
            cons,
            risks,
            pricePosition: priceAnalysis.position,
            priceText: this.explainer.formatPriceText(priceAnalysis),
            recommendedPrice: priceAnalysis.recommended,
            demandLevel: demandAnalysis.level,
            demandText: types_1.DEMAND_LEVEL_TEXTS[demandAnalysis.level] ?? "Спрос",
            bookingProbability: demandAnalysis.probability,
            recommendation,
            tips,
        };
    }
    async getOwnerInsight(ownerId) {
        const listings = await this.prisma.listing.findMany({
            where: { ownerId },
            include: {
                photos: true,
                amenities: { include: { amenity: true } },
                reviews: true,
                bookings: { where: { status: 'CONFIRMED' } },
            },
        });
        const results = await Promise.all(listings.map(async (listing) => {
            const baseInsight = await this.getListingInsight(listing.id);
            const monthlyRevenue = this.calculateMonthlyRevenue(listing);
            const potentialGrowth = this.explainer.generateGrowthPotential(listing);
            const marketComparison = await this.getMarketComparison(listing);
            const ownerInsight = {
                ...baseInsight,
                monthlyRevenueForecast: monthlyRevenue,
                potentialGrowth,
                marketComparison,
            };
            return {
                id: listing.id,
                title: listing.title,
                insight: ownerInsight,
            };
        }));
        return { listings: results };
    }
    calculateScore(listing) {
        let score = 0;
        const photosCount = listing.photos?.length ?? 0;
        score += Math.min(25, photosCount * 5);
        const descLength = listing.description?.length ?? 0;
        if (descLength > 500)
            score += 20;
        else if (descLength > 200)
            score += 15;
        else if (descLength > 50)
            score += 8;
        else
            score += 3;
        const amenitiesCount = listing.amenities?.length ?? 0;
        score += Math.min(15, amenitiesCount * 2);
        const reviews = listing.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            score += Math.round(avgRating * 4);
        }
        if (listing.addressLine)
            score += 3;
        if (listing.lat && listing.lng)
            score += 3;
        if (listing.houseRules)
            score += 2;
        score += 2;
        const bookingsCount = listing.bookings?.length ?? 0;
        score += Math.min(10, bookingsCount);
        return Math.max(0, Math.min(100, score));
    }
    getVerdict(score) {
        if (score >= 80)
            return 'excellent';
        if (score >= 60)
            return 'good';
        if (score >= 40)
            return 'average';
        return 'bad';
    }
    async analyzePricePosition(listing) {
        const similar = await this.prisma.listing.findMany({
            where: { city: listing.city, status: 'PUBLISHED', id: { not: listing.id } },
            select: { basePrice: true },
            take: 50,
        });
        let marketAvg = 3500;
        if (similar.length >= 5) {
            const prices = similar.map(l => l.basePrice).sort((a, b) => a - b);
            const mid = Math.floor(prices.length / 2);
            const lo = prices[mid - 1] ?? 0;
            const hi = prices[mid] ?? 0;
            marketAvg = prices.length % 2 ? hi : (lo + hi) / 2;
        }
        const diff = ((listing.basePrice - marketAvg) / marketAvg) * 100;
        let position;
        if (diff < -10)
            position = 'below_market';
        else if (diff > 10)
            position = 'above_market';
        else
            position = 'market';
        return {
            position,
            recommended: Math.round(marketAvg * 1.0),
            diff: Math.round(diff),
            marketAvg,
        };
    }
    analyzeDemand(listing, score) {
        let probability = 50;
        if (score >= 80)
            probability += 20;
        else if (score >= 60)
            probability += 10;
        else if (score < 40)
            probability -= 15;
        const amenitiesCount = listing.amenities?.length ?? 0;
        if (amenitiesCount >= 8)
            probability += 10;
        else if (amenitiesCount < 3)
            probability -= 10;
        probability = Math.max(10, Math.min(95, probability));
        let level;
        if (probability >= 70)
            level = 'high';
        else if (probability >= 45)
            level = 'medium';
        else
            level = 'low';
        return { level, probability };
    }
    calculateMonthlyRevenue(listing) {
        const avgOccupancy = 0.6;
        const daysInMonth = 30;
        return Math.round(listing.basePrice * avgOccupancy * daysInMonth);
    }
    async getMarketComparison(listing) {
        const competitors = await this.prisma.listing.findMany({
            where: { city: listing.city, status: 'PUBLISHED', id: { not: listing.id } },
            select: { basePrice: true },
        });
        const avgPrice = competitors.length > 0
            ? competitors.reduce((s, c) => s + c.basePrice, 0) / competitors.length
            : listing.basePrice;
        const diff = ((listing.basePrice - avgPrice) / avgPrice) * 100;
        let yourPosition;
        if (diff < -10)
            yourPosition = 'Цена ниже конкурентов';
        else if (diff > 10)
            yourPosition = 'Цена выше конкурентов';
        else
            yourPosition = 'Цена на уровне рынка';
        return {
            avgPrice: Math.round(avgPrice),
            yourPosition,
            competitorCount: competitors.length,
        };
    }
};
exports.InsightEngine = InsightEngine;
exports.InsightEngine = InsightEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        explanation_engine_1.ExplanationEngine])
], InsightEngine);
