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
var AssistantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const analysis_service_1 = require("./services/analysis.service");
const price_advisor_service_1 = require("./services/price-advisor.service");
const improvement_service_1 = require("./services/improvement.service");
let AssistantService = AssistantService_1 = class AssistantService {
    constructor(prisma, analysis, priceAdvisor, improvement) {
        this.prisma = prisma;
        this.analysis = analysis;
        this.priceAdvisor = priceAdvisor;
        this.improvement = improvement;
        this.logger = new common_1.Logger(AssistantService_1.name);
    }
    async analyzeListing(listingId) {
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
            throw new common_1.NotFoundException('Объявление не найдено');
        }
        const rating = this.analysis.calculateLocusRating(listing);
        const priceAdvice = await this.priceAdvisor.getRecommendation(listing);
        const riskAssessment = this.analysis.assessRisks(listing);
        const explanation = this.analysis.generateExplanation(listing, rating, priceAdvice, riskAssessment);
        const improvements = this.improvement.getSuggestions(listing);
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
    async recommendPrice(listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: { photos: true, amenities: { include: { amenity: true } } },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Объявление не найдено');
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
    async explainListingScore(listingId) {
        const analysis = await this.prisma.listingAnalysis.findUnique({
            where: { listingId },
        });
        if (!analysis) {
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
    async suggestImprovements(listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                photos: true,
                amenities: { include: { amenity: true } },
                analysis: true,
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Объявление не найдено');
        }
        const suggestions = this.improvement.getSuggestions(listing);
        return {
            listingId,
            currentRating: listing.analysis?.locusRating ?? 0,
            potentialRating: this.improvement.calculatePotentialRating(listing, suggestions),
            suggestions,
        };
    }
    async getLandlordInsights(landlordId) {
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
        const totalListings = listings.length;
        const avgRating = listings.reduce((sum, l) => sum + (l.analysis?.locusRating ?? 0), 0) / (totalListings || 1);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const revenue30d = listings.reduce((sum, l) => {
            return sum + l.bookings
                .filter(b => b.createdAt >= thirtyDaysAgo)
                .reduce((s, b) => s + b.totalPrice, 0);
        }, 0);
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
    async getMarketOverview(city) {
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
        const prices = listings.map(l => l.basePrice);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
        const minPrice = Math.min(...prices) || 0;
        const maxPrice = Math.max(...prices) || 0;
        const cityStats = listings.reduce((acc, l) => {
            const key = l.city ?? "unknown";
            if (!acc[key]) {
                acc[key] = { count: 0, totalPrice: 0 };
            }
            acc[key].count++;
            acc[key].totalPrice += l.basePrice;
            return acc;
        }, {});
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
    async saveAnalysis(listingId, data) {
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
    generateLandlordRecommendations(listings) {
        const recommendations = [];
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
};
exports.AssistantService = AssistantService;
exports.AssistantService = AssistantService = AssistantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analysis_service_1.AnalysisService,
        price_advisor_service_1.PriceAdvisorService,
        improvement_service_1.ImprovementService])
], AssistantService);
//# sourceMappingURL=assistant.service.js.map