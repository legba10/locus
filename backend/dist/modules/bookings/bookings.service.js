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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
function startOfDayUtc(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}
function enumerateNights(checkIn, checkOut) {
    const start = startOfDayUtc(checkIn);
    const end = startOfDayUtc(checkOut);
    const nights = [];
    for (let t = start.getTime(); t < end.getTime(); t += 24 * 60 * 60 * 1000) {
        nights.push(new Date(t));
    }
    return nights;
}
let BookingsService = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByIdForUser(id, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { listing: true },
        });
        if (!booking)
            throw new common_1.NotFoundException("Booking not found");
        if (booking.guestId !== userId && booking.hostId !== userId) {
            throw new common_1.ForbiddenException("No access to this booking");
        }
        return booking;
    }
    async create(guestId, dto) {
        const checkIn = startOfDayUtc(dto.checkIn);
        const checkOut = startOfDayUtc(dto.checkOut);
        if (!(checkOut.getTime() > checkIn.getTime())) {
            throw new common_1.BadRequestException("checkOut must be after checkIn");
        }
        const listing = await this.prisma.listing.findUnique({
            where: { id: dto.listingId },
        });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        if (listing.status !== client_1.ListingStatus.PUBLISHED)
            throw new common_1.BadRequestException("Listing is not bookable");
        if (dto.guestsCount > listing.capacityGuests)
            throw new common_1.BadRequestException("Too many guests");
        const overlap = await this.prisma.booking.findFirst({
            where: {
                listingId: listing.id,
                status: { in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED] },
                AND: [
                    { checkIn: { lt: checkOut } },
                    { checkOut: { gt: checkIn } },
                ],
            },
        });
        if (overlap)
            throw new common_1.BadRequestException("Dates are not available (overlap)");
        const nights = enumerateNights(checkIn, checkOut);
        if (nights.length === 0)
            throw new common_1.BadRequestException("Invalid date range");
        const availability = await this.prisma.availabilityDay.findMany({
            where: { listingId: listing.id, date: { in: nights } },
        });
        const availMap = new Map(availability.map((d) => [d.date.toISOString(), d]));
        for (const n of nights) {
            const day = availMap.get(n.toISOString());
            if (!day || !day.isAvailable)
                throw new common_1.BadRequestException("Dates are not available (calendar)");
        }
        const nightly = nights.map((n) => {
            const day = availMap.get(n.toISOString());
            return { date: n.toISOString(), price: day.priceOverride ?? listing.basePrice };
        });
        const totalPrice = nightly.reduce((sum, x) => sum + x.price, 0);
        const priceBreakdown = {
            currency: listing.currency,
            nights: nights.length,
            nightly,
            subtotal: totalPrice,
        };
        return this.prisma.booking.create({
            data: {
                listingId: listing.id,
                guestId,
                hostId: listing.ownerId,
                checkIn,
                checkOut,
                guestsCount: dto.guestsCount,
                totalPrice,
                currency: listing.currency,
                status: client_1.BookingStatus.PENDING,
                priceBreakdown,
            },
            include: { listing: true },
        });
    }
    async confirm(id, hostId) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking)
            throw new common_1.NotFoundException("Booking not found");
        if (booking.hostId !== hostId)
            throw new common_1.ForbiddenException("Only host can confirm");
        return this.prisma.booking.update({
            where: { id },
            data: { status: client_1.BookingStatus.CONFIRMED },
            include: { listing: true },
        });
    }
    async cancel(id, userId) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking)
            throw new common_1.NotFoundException("Booking not found");
        if (booking.guestId !== userId && booking.hostId !== userId) {
            throw new common_1.ForbiddenException("No access");
        }
        return this.prisma.booking.update({
            where: { id },
            data: { status: client_1.BookingStatus.CANCELED },
            include: { listing: true },
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
