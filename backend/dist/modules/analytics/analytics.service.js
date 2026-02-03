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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
function startOfDayUtc(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async hostOverview(hostId) {
        const [listingsTotal, listingsPublished] = await Promise.all([
            this.prisma.listing.count({ where: { ownerId: hostId } }),
            this.prisma.listing.count({ where: { ownerId: hostId, status: client_1.ListingStatus.PUBLISHED } }),
        ]);
        const [bookingsPending, bookingsConfirmed, revenueConfirmedAgg] = await Promise.all([
            this.prisma.booking.count({ where: { hostId, status: client_1.BookingStatus.PENDING } }),
            this.prisma.booking.count({ where: { hostId, status: client_1.BookingStatus.CONFIRMED } }),
            this.prisma.booking.aggregate({
                where: { hostId, status: client_1.BookingStatus.CONFIRMED },
                _sum: { totalPrice: true },
            }),
        ]);
        const from = startOfDayUtc(new Date());
        const to = new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);
        const bookings = await this.prisma.booking.findMany({
            where: {
                hostId,
                status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.PENDING] },
                AND: [{ checkIn: { lt: to } }, { checkOut: { gt: from } }],
            },
            select: { checkIn: true, checkOut: true },
        });
        const bookedDays = new Set();
        for (const b of bookings) {
            const start = startOfDayUtc(b.checkIn);
            const end = startOfDayUtc(b.checkOut);
            for (let t = start.getTime(); t < end.getTime(); t += 24 * 60 * 60 * 1000) {
                if (t >= from.getTime() && t < to.getTime())
                    bookedDays.add(new Date(t).toISOString());
            }
        }
        const totalDays = 30 * Math.max(1, listingsPublished);
        const occupancyPct = totalDays > 0 ? Math.round((bookedDays.size / totalDays) * 100) : 0;
        return {
            listingsTotal,
            listingsPublished,
            bookingsPending,
            bookingsConfirmed,
            revenueConfirmed: revenueConfirmedAgg._sum.totalPrice ?? 0,
            occupancyNext30Pct: occupancyPct,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map