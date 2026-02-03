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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function startOfDayUtc(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}
let AvailabilityService = class AvailabilityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(ownerId, listingId, from, to) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        if (listing.ownerId !== ownerId)
            throw new common_1.ForbiddenException("Not your listing");
        return this.prisma.availabilityDay.findMany({
            where: {
                listingId,
                ...(from || to
                    ? {
                        date: {
                            ...(from ? { gte: startOfDayUtc(from) } : {}),
                            ...(to ? { lte: startOfDayUtc(to) } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: { date: "asc" },
            take: 366,
        });
    }
    async update(ownerId, listingId, dto) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        if (listing.ownerId !== ownerId)
            throw new common_1.ForbiddenException("Not your listing");
        for (const item of dto.items) {
            const date = startOfDayUtc(item.date);
            await this.prisma.availabilityDay.upsert({
                where: { listingId_date: { listingId, date } },
                update: { isAvailable: item.isAvailable, priceOverride: item.priceOverride ?? null },
                create: { listingId, date, isAvailable: item.isAvailable, priceOverride: item.priceOverride ?? null },
            });
        }
        return this.list(ownerId, listingId);
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map