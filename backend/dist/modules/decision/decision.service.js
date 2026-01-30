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
exports.DecisionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DecisionService = class DecisionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateDecisions(listingIds, userPrefs) {
        const listings = await this.prisma.listing.findMany({
            where: { id: { in: listingIds } },
            include: {
                photos: { take: 1 },
                reviews: { select: { rating: true } },
                amenities: { select: { amenityId: true } },
            },
        });
        const allPrices = await this.prisma.listing.findMany({
            where: { status: 'PUBLISHED' },
            select: { basePrice: true },
            take: 100,
        });
        const avgPrice = allPrices.length > 0
            ? allPrices.reduce((s, l) => s + l.basePrice, 0) / allPrices.length
            : 3500;
        return listings.map((listing) => {
            let priceScore = 50;
            const priceDiff = ((listing.basePrice - avgPrice) / avgPrice) * 100;
            if (priceDiff < -20)
                priceScore = 100;
            else if (priceDiff < -10)
                priceScore = 80;
            else if (priceDiff < 10)
                priceScore = 60;
            else if (priceDiff < 20)
                priceScore = 40;
            else
                priceScore = 20;
            if (userPrefs?.maxPrice && listing.basePrice > userPrefs.maxPrice) {
                priceScore = Math.max(0, priceScore - 30);
            }
            let locationScore = 50;
            if (userPrefs?.city && listing.city === userPrefs.city) {
                locationScore = 100;
            }
            const photosCount = listing.photos?.length ?? 0;
            const amenitiesCount = listing.amenities?.length ?? 0;
            const demandScore = Math.min(100, photosCount * 10 + amenitiesCount * 5 + 30);
            const reviews = listing.reviews ?? [];
            let qualityScore = 50;
            if (reviews.length > 0) {
                const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                qualityScore = avgRating * 20;
            }
            const matchScore = Math.round(priceScore * 0.4 +
                locationScore * 0.3 +
                demandScore * 0.2 +
                qualityScore * 0.1);
            const reason = this.generateReason(matchScore, priceDiff);
            return {
                listingId: listing.id,
                matchScore,
                reason,
            };
        });
    }
    async getInsight(listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                photos: true,
                reviews: { select: { rating: true } },
                amenities: { select: { amenityId: true } },
            },
        });
        if (!listing) {
            return this.getDefaultInsight();
        }
        let score = 0;
        const photosCount = listing.photos?.length ?? 0;
        score += Math.min(30, photosCount * 6);
        score += Math.min(20, Math.floor(listing.description.length / 25));
        score += Math.min(20, (listing.amenities?.length ?? 0) * 3);
        const reviews = listing.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            score += Math.round(avgRating * 6);
        }
        score = Math.max(0, Math.min(100, score));
        const label = this.getLabel(score);
        const avgPrice = await this.getAvgPrice(listing.city);
        const priceDiffPercent = Math.round(((listing.basePrice - avgPrice) / avgPrice) * 100);
        const demandLevel = this.getDemandLevel(photosCount, listing.amenities?.length ?? 0);
        const summary = this.getSummary(score, priceDiffPercent);
        const mainTip = this.getMainTip(listing);
        return {
            score,
            label,
            summary,
            priceDiffPercent,
            demandLevel,
            mainTip,
        };
    }
    getLabel(score) {
        if (score >= 80)
            return 'Отличный';
        if (score >= 60)
            return 'Хороший';
        if (score >= 40)
            return 'Средний';
        return 'Слабый';
    }
    getDemandLevel(photos, amenities) {
        const total = photos + amenities;
        if (total >= 12)
            return 'высокий';
        if (total >= 6)
            return 'средний';
        return 'низкий';
    }
    getSummary(score, priceDiff) {
        if (score >= 80 && priceDiff <= 0)
            return 'Отличный вариант по выгодной цене';
        if (score >= 80)
            return 'Качественное жильё';
        if (score >= 60 && priceDiff < -10)
            return 'Хороший вариант, цена ниже рынка';
        if (score >= 60)
            return 'Достойный вариант';
        if (score >= 40)
            return 'Средний вариант';
        return 'Требует доработки';
    }
    getMainTip(listing) {
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount < 5)
            return 'Добавьте больше фото';
        if (listing.description.length < 200)
            return 'Расширьте описание';
        if ((listing.amenities?.length ?? 0) < 5)
            return 'Укажите все удобства';
        return 'Объявление заполнено хорошо';
    }
    async getAvgPrice(city) {
        const similar = await this.prisma.listing.findMany({
            where: { city, status: 'PUBLISHED' },
            select: { basePrice: true },
            take: 50,
        });
        if (similar.length < 5)
            return 3500;
        return similar.reduce((s, l) => s + l.basePrice, 0) / similar.length;
    }
    generateReason(score, priceDiff) {
        if (score >= 80)
            return 'Отличный вариант';
        if (score >= 60 && priceDiff < 0)
            return 'Хорошая цена';
        if (score >= 60)
            return 'Достойный выбор';
        return 'Средний вариант';
    }
    getDefaultInsight() {
        return {
            score: 50,
            label: 'Средний',
            summary: 'Недостаточно данных',
            priceDiffPercent: 0,
            demandLevel: 'средний',
            mainTip: 'Добавьте информацию',
        };
    }
};
exports.DecisionService = DecisionService;
exports.DecisionService = DecisionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DecisionService);
