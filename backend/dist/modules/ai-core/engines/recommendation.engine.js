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
exports.RecommendationEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecommendationEngine = class RecommendationEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRecommendedListings(params) {
        const { city, maxPrice, guests, limit = 10 } = params;
        const where = { status: 'PUBLISHED' };
        if (city)
            where.city = city;
        if (maxPrice)
            where.basePrice = { lte: maxPrice };
        if (guests)
            where.capacityGuests = { gte: guests };
        const listings = await this.prisma.listing.findMany({
            where,
            include: {
                photos: { take: 1 },
                reviews: { select: { rating: true } },
                amenities: { select: { amenityId: true } },
            },
            take: 50,
        });
        const scored = listings.map(listing => {
            let score = 0;
            score += Math.min(20, (listing.photos?.length ?? 0) * 4);
            score += Math.min(15, Math.floor(listing.description.length / 30));
            if (listing.reviews.length > 0) {
                const avgRating = listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length;
                score += avgRating * 4;
            }
            score += Math.min(15, (listing.amenities?.length ?? 0) * 2);
            if (listing.basePrice < 3000)
                score += 10;
            else if (listing.basePrice < 5000)
                score += 5;
            return { listing, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(({ listing, score }) => ({
            id: listing.id,
            title: listing.title,
            city: listing.city,
            price: listing.basePrice,
            photo: listing.photos[0]?.url,
            score: Math.min(100, Math.round(score)),
            reason: this.getRecommendationReason(score),
        }));
    }
    getRecommendationReason(score) {
        if (score >= 70)
            return 'Отличный вариант по всем параметрам';
        if (score >= 50)
            return 'Хорошее соотношение цены и качества';
        return 'Подходящий вариант';
    }
};
exports.RecommendationEngine = RecommendationEngine;
exports.RecommendationEngine = RecommendationEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecommendationEngine);
//# sourceMappingURL=recommendation.engine.js.map