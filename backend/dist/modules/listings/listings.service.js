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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_pricing_service_1 = require("../ai-orchestrator/services/ai-pricing.service");
const ai_quality_service_1 = require("../ai-orchestrator/services/ai-quality.service");
const ai_risk_service_1 = require("../ai-orchestrator/services/ai-risk.service");
function toJsonValue(value) {
    if (value === undefined || value === null)
        return undefined;
    return value;
}
function startOfDayUtc(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}
let ListingsService = class ListingsService {
    constructor(prisma, aiQuality, aiPricing, aiRisk) {
        this.prisma = prisma;
        this.aiQuality = aiQuality;
        this.aiPricing = aiPricing;
        this.aiRisk = aiRisk;
    }
    async getAll(params = {}) {
        const { city, limit = 50 } = params;
        return this.prisma.listing.findMany({
            where: {
                status: client_1.ListingStatus.PUBLISHED,
                ...(city ? { city } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                photos: { orderBy: { sortOrder: "asc" }, take: 1 },
                amenities: { include: { amenity: true } },
                aiScores: true,
            },
        });
    }
    async getById(id) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: {
                owner: { include: { profile: true } },
                photos: { orderBy: { sortOrder: "asc" } },
                amenities: { include: { amenity: true } },
                aiScores: { include: { explanation: true } },
                intelligence: true,
                reviews: { select: { rating: true } },
            },
        });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        return listing;
    }
    async create(ownerId, dto) {
        const listing = await this.prisma.listing.create({
            data: {
                ownerId,
                title: dto.title,
                description: dto.description,
                city: dto.city,
                addressLine: dto.addressLine,
                lat: dto.lat,
                lng: dto.lng,
                basePrice: dto.basePrice,
                currency: dto.currency ?? "RUB",
                capacityGuests: dto.capacityGuests ?? 2,
                bedrooms: dto.bedrooms ?? 1,
                beds: dto.beds ?? 1,
                bathrooms: dto.bathrooms ?? 1,
                houseRules: toJsonValue(dto.houseRules),
                status: client_1.ListingStatus.DRAFT,
                photos: dto.photos?.length
                    ? {
                        create: dto.photos.map((p) => ({
                            url: p.url,
                            sortOrder: p.sortOrder ?? 0,
                        })),
                    }
                    : undefined,
            },
        });
        if (dto.amenityKeys?.length) {
            for (const key of dto.amenityKeys) {
                const amenity = await this.prisma.amenity.upsert({
                    where: { key },
                    update: {},
                    create: { key, label: key },
                });
                await this.prisma.listingAmenity.upsert({
                    where: { listingId_amenityId: { listingId: listing.id, amenityId: amenity.id } },
                    update: {},
                    create: { listingId: listing.id, amenityId: amenity.id },
                });
            }
        }
        const days = [];
        const today = startOfDayUtc(new Date());
        for (let i = 0; i < 90; i++)
            days.push(new Date(today.getTime() + i * 24 * 60 * 60 * 1000));
        await this.prisma.availabilityDay.createMany({
            data: days.map((date) => ({ listingId: listing.id, date, isAvailable: true })),
            skipDuplicates: true,
        });
        await Promise.all([
            this.aiQuality.quality({ listingId: listing.id }),
            this.aiPricing.pricing({ listingId: listing.id }),
            this.aiRisk.risk({ listingId: listing.id }),
        ]);
        return this.getById(listing.id);
    }
    async update(ownerId, id, dto) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        if (listing.ownerId !== ownerId)
            throw new common_1.ForbiddenException("Not your listing");
        const { amenityKeys: _, ...listingFields } = dto;
        await this.prisma.listing.update({
            where: { id },
            data: {
                ...listingFields,
                houseRules: toJsonValue(dto.houseRules),
            },
        });
        if (dto.amenityKeys) {
            await this.prisma.listingAmenity.deleteMany({ where: { listingId: id } });
            for (const key of dto.amenityKeys) {
                const amenity = await this.prisma.amenity.upsert({
                    where: { key },
                    update: {},
                    create: { key, label: key },
                });
                await this.prisma.listingAmenity.create({
                    data: { listingId: id, amenityId: amenity.id },
                });
            }
        }
        await Promise.all([
            this.aiQuality.quality({ listingId: id }),
            this.aiPricing.pricing({ listingId: id }),
            this.aiRisk.risk({ listingId: id }),
        ]);
        return this.getById(id);
    }
    async publish(ownerId, id) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        if (listing.ownerId !== ownerId)
            throw new common_1.ForbiddenException("Not your listing");
        await this.prisma.listing.update({ where: { id }, data: { status: client_1.ListingStatus.PUBLISHED } });
        return this.getById(id);
    }
    async unpublish(ownerId, id) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        if (listing.ownerId !== ownerId)
            throw new common_1.ForbiddenException("Not your listing");
        await this.prisma.listing.update({ where: { id }, data: { status: client_1.ListingStatus.DRAFT } });
        return this.getById(id);
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_quality_service_1.AiQualityService,
        ai_pricing_service_1.AiPricingService,
        ai_risk_service_1.AiRiskService])
], ListingsService);
