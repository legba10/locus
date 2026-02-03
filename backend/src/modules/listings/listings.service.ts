import { ForbiddenException, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { ListingStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NeonUserService } from "../users/neon-user.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { AiPricingService } from "../ai-orchestrator/services/ai-pricing.service";
import { AiQualityService } from "../ai-orchestrator/services/ai-quality.service";
import { AiRiskService } from "../ai-orchestrator/services/ai-risk.service";

// Helper to convert DTO JSON fields to Prisma-compatible InputJsonValue
function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return value as Prisma.InputJsonValue;
}

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly neonUser: NeonUserService,
    private readonly aiQuality: AiQualityService,
    private readonly aiPricing: AiPricingService,
    private readonly aiRisk: AiRiskService,
  ) {}

  async getAll(params: { city?: string; limit?: number } = {}) {
    const { city, limit = 50 } = params;
    const where = {
      status: ListingStatus.PUBLISHED,
      ...(city ? { city } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
          amenities: { include: { amenity: true } },
          aiScores: true,
        },
      }),
      this.prisma.listing.count({ where }),
    ]);
    return { items, total };
  }

  async getById(id: string, incrementViews = true) {
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
    if (!listing) throw new NotFoundException("Listing not found");
    
    // Increment views asynchronously (don't block response)
    if (incrementViews) {
      this.prisma.listing.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      }).catch((err) => this.logger.warn(`Failed to increment views for ${id}: ${err}`));
    }
    
    return listing;
  }

  async create(ownerId: string, dto: CreateListingDto, email?: string) {
    // Ensure Neon User exists for FK (ownerId = Supabase ID)
    await this.neonUser.ensureUserExists(ownerId, email);
    this.logger.debug(`Creating listing for owner: ${ownerId}`);

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
        status: ListingStatus.DRAFT,
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

    // Default availability: next 90 days available
    const days: Date[] = [];
    const today = startOfDayUtc(new Date());
    for (let i = 0; i < 90; i++) days.push(new Date(today.getTime() + i * 24 * 60 * 60 * 1000));
    await this.prisma.availabilityDay.createMany({
      data: days.map((date) => ({ listingId: listing.id, date, isAvailable: true })),
      skipDuplicates: true,
    });

    // AI integration (MVP): compute quality/pricing/risk and persist via AI services
    await Promise.all([
      this.aiQuality.quality({ listingId: listing.id }),
      this.aiPricing.pricing({ listingId: listing.id }),
      this.aiRisk.risk({ listingId: listing.id }),
    ]);

    return this.getById(listing.id);
  }

  async update(ownerId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    // Extract only Listing model fields (exclude amenityKeys which is handled separately)
    const { amenityKeys: _, ...listingFields } = dto;

    await this.prisma.listing.update({
      where: { id },
      data: {
        ...listingFields,
        houseRules: toJsonValue(dto.houseRules),
      },
    });

    if (dto.amenityKeys) {
      // Replace amenities set (simple MVP behavior)
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

    // Recompute AI signals after update
    await Promise.all([
      this.aiQuality.quality({ listingId: id }),
      this.aiPricing.pricing({ listingId: id }),
      this.aiRisk.risk({ listingId: id }),
    ]);

    return this.getById(id);
  }

  async publish(ownerId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    await this.prisma.listing.update({ where: { id }, data: { status: ListingStatus.PUBLISHED } });
    return this.getById(id);
  }

  async unpublish(ownerId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    await this.prisma.listing.update({ where: { id }, data: { status: ListingStatus.DRAFT } });
    return this.getById(id);
  }
}

