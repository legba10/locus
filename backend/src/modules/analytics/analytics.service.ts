import { Injectable } from "@nestjs/common";
import { BookingStatus, ListingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async hostOverview(hostId: string) {
    const [listingsTotal, listingsPublished] = await Promise.all([
      this.prisma.listing.count({ where: { ownerId: hostId } }),
      this.prisma.listing.count({ where: { ownerId: hostId, status: ListingStatus.PUBLISHED } }),
    ]);

    const [bookingsPending, bookingsConfirmed, revenueConfirmedAgg] = await Promise.all([
      this.prisma.booking.count({ where: { hostId, status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { hostId, status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.aggregate({
        where: { hostId, status: BookingStatus.CONFIRMED },
        _sum: { totalPrice: true },
      }),
    ]);

    // Occupancy next 30 days (rough):
    const from = startOfDayUtc(new Date());
    const to = new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        hostId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        AND: [{ checkIn: { lt: to } }, { checkOut: { gt: from } }],
      },
      select: { checkIn: true, checkOut: true },
    });

    const bookedDays = new Set<string>();
    for (const b of bookings) {
      const start = startOfDayUtc(b.checkIn);
      const end = startOfDayUtc(b.checkOut);
      for (let t = start.getTime(); t < end.getTime(); t += 24 * 60 * 60 * 1000) {
        if (t >= from.getTime() && t < to.getTime()) bookedDays.add(new Date(t).toISOString());
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
}

