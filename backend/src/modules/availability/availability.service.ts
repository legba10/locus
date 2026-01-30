import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, listingId: string, from?: Date, to?: Date) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

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

  async update(ownerId: string, listingId: string, dto: UpdateAvailabilityDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

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
}

