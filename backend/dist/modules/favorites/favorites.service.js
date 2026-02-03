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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FavoritesService = class FavoritesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addFavorite(userId, listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing) {
            throw new common_1.NotFoundException("Listing not found");
        }
        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_listingId: { userId, listingId },
            },
        });
        if (existing) {
            throw new common_1.ConflictException("Listing already in favorites");
        }
        const favorite = await this.prisma.favorite.create({
            data: { userId, listingId },
            include: {
                listing: {
                    include: {
                        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
                        aiScores: true,
                    },
                },
            },
        });
        return { success: true, favorite };
    }
    async removeFavorite(userId, listingId) {
        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_listingId: { userId, listingId },
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException("Favorite not found");
        }
        await this.prisma.favorite.delete({
            where: {
                userId_listingId: { userId, listingId },
            },
        });
        return { success: true };
    }
    async getFavorites(userId) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                listing: {
                    include: {
                        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
                        amenities: { include: { amenity: true } },
                        aiScores: true,
                        reviews: { select: { rating: true } },
                    },
                },
            },
        });
        const items = favorites.map((f) => {
            const avgRating = f.listing.reviews.length > 0
                ? f.listing.reviews.reduce((sum, r) => sum + r.rating, 0) / f.listing.reviews.length
                : 0;
            return {
                ...f.listing,
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: f.listing.reviews.length,
                favoritedAt: f.createdAt,
            };
        });
        return { items, total: items.length };
    }
    async isFavorite(userId, listingId) {
        const favorite = await this.prisma.favorite.findUnique({
            where: {
                userId_listingId: { userId, listingId },
            },
        });
        return !!favorite;
    }
    async toggleFavorite(userId, listingId) {
        const isFav = await this.isFavorite(userId, listingId);
        if (isFav) {
            await this.removeFavorite(userId, listingId);
            return { isFavorite: false };
        }
        else {
            await this.addFavorite(userId, listingId);
            return { isFavorite: true };
        }
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map