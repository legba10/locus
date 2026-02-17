import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, ListingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ChatsService } from "../chats/chats.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

function enumerateNights(checkIn: Date, checkOut: Date): Date[] {
  const start = startOfDayUtc(checkIn);
  const end = startOfDayUtc(checkOut);
  const nights: Date[] = [];
  for (let t = start.getTime(); t < end.getTime(); t += 24 * 60 * 60 * 1000) {
    nights.push(new Date(t));
  }
  return nights;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService,
  ) {}

  async getMyBookings(guestId: string) {
    const list = await this.prisma.booking.findMany({
      where: { guestId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            photos: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    });
    return list;
  }

  async getByIdForUser(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException("No access to this booking");
    }
    return booking;
  }

  async create(guestId: string, dto: CreateBookingDto) {
    const checkIn = startOfDayUtc(dto.checkIn);
    const checkOut = startOfDayUtc(dto.checkOut);
    if (!(checkOut.getTime() > checkIn.getTime())) {
      throw new BadRequestException("checkOut must be after checkIn");
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.status !== ListingStatus.PUBLISHED) throw new BadRequestException("Listing is not bookable");
    if (dto.guestsCount > listing.capacityGuests) throw new BadRequestException("Too many guests");

    // Check overlapping bookings (pending/confirmed)
    const overlap = await this.prisma.booking.findFirst({
      where: {
        listingId: listing.id,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        AND: [
          { checkIn: { lt: checkOut } }, // existing starts before requested ends
          { checkOut: { gt: checkIn } }, // existing ends after requested starts
        ],
      },
    });
    if (overlap) throw new BadRequestException("Dates are not available (overlap)");

    const nights = enumerateNights(checkIn, checkOut);
    if (nights.length === 0) throw new BadRequestException("Invalid date range");

    const availability = await this.prisma.availabilityDay.findMany({
      where: { listingId: listing.id, date: { in: nights } },
    });
    const availMap = new Map(availability.map((d) => [d.date.toISOString(), d]));

    for (const n of nights) {
      const day = availMap.get(n.toISOString());
      if (!day || !day.isAvailable) throw new BadRequestException("Dates are not available (calendar)");
    }

    const nightly = nights.map((n) => {
      const day = availMap.get(n.toISOString())!;
      return { date: n.toISOString(), price: day.priceOverride ?? listing.basePrice };
    });

    const totalPrice = nightly.reduce((sum, x) => sum + x.price, 0);
    const priceBreakdown = {
      currency: listing.currency,
      nights: nights.length,
      nightly,
      subtotal: totalPrice,
    };

    const booking = await this.prisma.booking.create({
      data: {
        listingId: listing.id,
        guestId,
        hostId: listing.ownerId,
        checkIn,
        checkOut,
        guestsCount: dto.guestsCount,
        totalPrice,
        currency: listing.currency,
        status: BookingStatus.PENDING,
        priceBreakdown,
      },
      include: { listing: true },
    });

    try {
      const conv = await this.chatsService.findOrCreateByListing(guestId, listing.id);
      return { booking, conversationId: conv.id };
    } catch {
      return { booking, conversationId: null };
    }
  }

  async confirm(id: string, hostId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.hostId !== hostId) throw new ForbiddenException("Only host can confirm");

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
      include: { listing: true },
    });
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException("No access");
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELED },
      include: { listing: true },
    });
  }
}

