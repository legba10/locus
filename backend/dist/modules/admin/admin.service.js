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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [totalUsers, totalListings, pendingListings, publishedListings, totalBookings,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.listing.count(),
            this.prisma.listing.count({ where: { status: client_1.ListingStatus.PENDING_REVIEW } }),
            this.prisma.listing.count({ where: { status: client_1.ListingStatus.PUBLISHED } }),
            this.prisma.booking.count(),
        ]);
        return {
            users: { total: totalUsers },
            listings: { total: totalListings, pending: pendingListings, published: publishedListings },
            bookings: { total: totalBookings },
        };
    }
    async getPendingListings(limit = 50) {
        return this.prisma.listing.findMany({
            where: { status: client_1.ListingStatus.PENDING_REVIEW },
            orderBy: { createdAt: 'asc' },
            take: limit,
            include: {
                owner: { select: { id: true, email: true } },
                photos: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    async getAllListings(params = {}) {
        const { status, limit = 50 } = params;
        return this.prisma.listing.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                owner: { select: { id: true, email: true } },
                photos: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
        });
    }
    async approveListing(listingId) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        return this.prisma.listing.update({
            where: { id: listingId },
            data: { status: client_1.ListingStatus.PUBLISHED },
        });
    }
    async rejectListing(listingId, reason) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        return this.prisma.listing.update({
            where: { id: listingId },
            data: { status: client_1.ListingStatus.REJECTED },
        });
    }
    async blockListing(listingId) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        return this.prisma.listing.update({
            where: { id: listingId },
            data: { status: client_1.ListingStatus.BLOCKED },
        });
    }
    async getAllUsers(limit = 50) {
        return this.prisma.user.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                profile: true,
                _count: { select: { listings: true, bookingsAsGuest: true } },
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map