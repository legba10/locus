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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_search_service_1 = require("../ai-orchestrator/services/ai-search.service");
let SearchService = class SearchService {
    constructor(prisma, aiSearch) {
        this.prisma = prisma;
        this.aiSearch = aiSearch;
    }
    async search(dto) {
        const amenityKeys = dto.amenities?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        if (dto.ai === "1" && dto.q) {
            const ai = await this.aiSearch.search({
                query: dto.q,
                context: dto.city ? { city: dto.city } : undefined,
            });
            const ids = ai.results.map((r) => r.listingId);
            const listings = await this.prisma.listing.findMany({
                where: { id: { in: ids }, status: client_1.ListingStatus.PUBLISHED },
                include: {
                    photos: { orderBy: { sortOrder: "asc" }, take: 1 },
                    amenities: { include: { amenity: true } },
                    aiScores: true,
                    intelligence: true,
                },
            });
            const byId = new Map(listings.map((l) => [l.id, l]));
            const items = ids.map((id) => byId.get(id)).filter(Boolean);
            return {
                items,
                ai,
            };
        }
        const orderBy = dto.sort === "price_asc"
            ? { basePrice: "asc" }
            : dto.sort === "price_desc"
                ? { basePrice: "desc" }
                : { createdAt: "desc" };
        const where = {
            status: client_1.ListingStatus.PUBLISHED,
            ...(dto.city ? { city: dto.city } : {}),
            ...(dto.guests ? { capacityGuests: { gte: dto.guests } } : {}),
            ...(dto.priceMin || dto.priceMax
                ? {
                    basePrice: {
                        ...(dto.priceMin != null ? { gte: dto.priceMin } : {}),
                        ...(dto.priceMax != null ? { lte: dto.priceMax } : {}),
                    },
                }
                : {}),
            ...(dto.q
                ? {
                    OR: [
                        { title: { contains: dto.q, mode: "insensitive" } },
                        { description: { contains: dto.q, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(amenityKeys.length
                ? {
                    amenities: {
                        some: { amenity: { key: { in: amenityKeys } } },
                    },
                }
                : {}),
        };
        const items = await this.prisma.listing.findMany({
            where,
            orderBy,
            take: 50,
            include: {
                photos: { orderBy: { sortOrder: "asc" }, take: 1 },
                amenities: { include: { amenity: true } },
                aiScores: true,
                intelligence: true,
            },
        });
        return { items };
    }
    async searchAdvanced(dto) {
        const useAi = dto.useAi !== false;
        const where = {
            status: client_1.ListingStatus.PUBLISHED,
        };
        if (dto.city) {
            where.city = dto.city;
        }
        if (dto.guests) {
            where.capacityGuests = { gte: dto.guests };
        }
        if (dto.priceMin != null || dto.priceMax != null) {
            where.basePrice = {};
            if (dto.priceMin != null)
                where.basePrice.gte = dto.priceMin;
            if (dto.priceMax != null)
                where.basePrice.lte = dto.priceMax;
        }
        if (dto.query) {
            where.OR = [
                { title: { contains: dto.query, mode: "insensitive" } },
                { description: { contains: dto.query, mode: "insensitive" } },
                { city: { contains: dto.query, mode: "insensitive" } },
            ];
        }
        if (dto.amenities && dto.amenities.length > 0) {
            where.amenities = {
                some: { amenity: { key: { in: dto.amenities } } },
            };
        }
        let orderBy;
        switch (dto.sort) {
            case "price_asc":
                orderBy = { basePrice: "asc" };
                break;
            case "price_desc":
                orderBy = { basePrice: "desc" };
                break;
            case "ai_score":
                orderBy = { intelligence: { qualityScore: "desc" } };
                break;
            default:
                orderBy = { createdAt: "desc" };
        }
        let items = await this.prisma.listing.findMany({
            where,
            orderBy,
            take: 50,
            include: {
                photos: { orderBy: { sortOrder: "asc" }, take: 3 },
                amenities: { include: { amenity: true } },
                aiScores: true,
                intelligence: true,
                reviews: { select: { rating: true } },
            },
        });
        let aiExplanation = null;
        if (useAi && dto.query && dto.query.length > 3) {
            try {
                const aiResult = await this.aiSearch.search({
                    query: dto.query,
                    context: dto.city ? { city: dto.city } : undefined,
                });
                const aiScores = new Map(aiResult.results.map(r => [r.listingId, r.score]));
                items = items.sort((a, b) => {
                    const scoreA = aiScores.get(a.id) ?? 0;
                    const scoreB = aiScores.get(b.id) ?? 0;
                    return scoreB - scoreA;
                });
                aiExplanation = {
                    intent: aiResult.intent,
                    explanation: aiResult.explanation,
                    topMatches: aiResult.results.slice(0, 3).map(r => ({
                        listingId: r.listingId,
                        score: r.score,
                        reasons: r.reasons,
                    })),
                };
            }
            catch (error) {
                console.error("AI search error:", error);
            }
        }
        const enrichedItems = items.map(item => {
            const avgRating = item.reviews.length > 0
                ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
                : 0;
            return {
                ...item,
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: item.reviews.length,
            };
        });
        return {
            items: enrichedItems,
            total: enrichedItems.length,
            filters: {
                city: dto.city,
                priceMin: dto.priceMin,
                priceMax: dto.priceMax,
                guests: dto.guests,
                query: dto.query,
            },
            ai: aiExplanation,
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_search_service_1.AiSearchService])
], SearchService);
//# sourceMappingURL=search.service.js.map