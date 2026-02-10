import { ForbiddenException, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { ListingStatus, ListingType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NeonUserService } from "../users/neon-user.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { AiPricingService } from "../ai-orchestrator/services/ai-pricing.service";
import { AiQualityService } from "../ai-orchestrator/services/ai-quality.service";
import { AiRiskService } from "../ai-orchestrator/services/ai-risk.service";
import { ListingsPhotosService } from "./listings-photos.service";
import { NotificationsService } from "../notifications/notifications.service";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { NotificationType } from "../notifications/notifications.service";

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
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly aiQuality: AiQualityService,
    private readonly aiPricing: AiPricingService,
    private readonly aiRisk: AiRiskService,
    private readonly photosService: ListingsPhotosService,
    private readonly notifications: NotificationsService,
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

  async getMine(ownerId: string) {
    const items = await this.prisma.listing.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      include: {
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        amenities: { include: { amenity: true } },
        aiScores: true,
        intelligence: true,
        _count: {
          select: {
            bookings: true,
            favoritedBy: true,
          },
        },
      },
    });
    const enriched = items.map((x: any) => ({
      ...x,
      bookingsCount: x?._count?.bookings ?? 0,
      favoritesCount: x?._count?.favoritedBy ?? 0,
    }));
    return { items: enriched, total: enriched.length };
  }

  async getById(id: string, view?: { sessionId?: string; userId?: string }) {
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

    if (view?.sessionId) {
      this.trackView(id, view.sessionId, view.userId).catch((err) =>
        this.logger.warn(`Failed to track view for ${id}: ${err}`)
      );
    }

    const listingWithRelations = listing as typeof listing & { owner: any; reviews: { rating: number }[] };
    const owner = listingWithRelations.owner;
    const reviews = listingWithRelations.reviews || [];
    const avgRating =
      reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
    const reviewsCount = reviews.length;

    if (!owner) {
      return {
        ...listingWithRelations,
        owner: {
          id: "",
          name: "Пользователь",
          avatar: null,
          rating: null,
          rating_avg: null,
          reviews_count: 0,
          listingsCount: 0,
        },
      };
    }

    const rawEmail = owner.email ?? "";
    const isTelegramPlaceholder =
      /^telegram_\d+@/i.test(rawEmail) || rawEmail.endsWith("@locus.app");
    const displayName =
      (owner.profile?.name ?? "").trim() ||
      (isTelegramPlaceholder ? "Гость" : rawEmail || "Пользователь");

    const listingsCount = await this.prisma.listing.count({
      where: { ownerId: owner.id },
    });

    return {
      ...listingWithRelations,
      owner: {
        id: owner.id,
        name: displayName,
        avatar: owner.profile?.avatarUrl ?? null,
        rating: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
        rating_avg: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
        reviews_count: reviewsCount,
        listingsCount,
      },
    };
  }

  private async trackView(listingId: string, sessionId: string, userId?: string | null) {
    const debounceMs = 10 * 60 * 1000;
    const now = new Date();

    const existing = await this.prisma.listingView.findUnique({
      where: { listingId_sessionId: { listingId, sessionId } },
    });

    if (!existing) {
      await this.prisma.$transaction([
        this.prisma.listingView.create({
          data: {
            listingId,
            sessionId,
            userId: userId ?? null,
            lastViewedAt: now,
          },
        }),
        this.prisma.listing.update({
          where: { id: listingId },
          data: { viewsCount: { increment: 1 } },
        }),
      ]);
      return;
    }

    if (now.getTime() - existing.lastViewedAt.getTime() < debounceMs) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.listingView.update({
        where: { listingId_sessionId: { listingId, sessionId } },
        data: { lastViewedAt: now, userId: userId ?? existing.userId },
      }),
      this.prisma.listing.update({
        where: { id: listingId },
        data: { viewsCount: { increment: 1 } },
      }),
    ]);
  }

  async create(
    ownerId: string,
    dto: CreateListingDto,
    ctx?: {
      email?: string | null;
      profile?: { listing_limit?: number | null; listing_used?: number | null; plan?: string | null; tariff?: string | null } | null;
    }
  ) {
    // Ensure Neon User exists for FK (ownerId = Supabase ID)
    await this.neonUser.ensureUserExists(ownerId, ctx?.email ?? null);
    this.logger.debug(`Creating listing for owner: ${ownerId}`);

    // FINAL LOGIC: limit is tracked in Supabase profile (listing_used/listing_limit).
    // Fallback: if Supabase is unavailable/misconfigured, use Neon limits + listing count.
    const reserve = await this.supabaseAuth.reserveListingSlot(ownerId).catch(() => null);
    if (reserve) {
      if (reserve.usedBefore >= reserve.limit) {
        throw new ForbiddenException({
          code: "LIMIT_REACHED",
          message: "Лимит объявлений на вашем тарифе исчерпан",
          plan: "FREE",
          used: reserve.usedBefore,
          limit: reserve.limit,
        });
      }
    } else {
      const userRow = await this.prisma.user.findUnique({
        where: { id: ownerId },
        select: { plan: true, listingLimit: true },
      });
      const limit = userRow?.listingLimit ?? 1;
      const used = await this.prisma.listing.count({
        where: { ownerId, status: { not: ListingStatus.ARCHIVED } },
      });
      if (used >= limit) {
        throw new ForbiddenException({
          code: "LIMIT_REACHED",
          message: "Лимит объявлений на вашем тарифе исчерпан",
          plan: userRow?.plan ?? "FREE",
          used,
          limit,
        });
      }
    }

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
        type: (dto.type as ListingType | undefined) ?? ListingType.APARTMENT,
        houseRules: toJsonValue(dto.houseRules),
        status: ListingStatus.PENDING_REVIEW,
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
      const keys = Array.from(
        new Set(dto.amenityKeys.map((k) => k.trim()).filter(Boolean))
      );
      const amenities = await Promise.all(
        keys.map((key) =>
          this.prisma.amenity.upsert({
            where: { key },
            update: {},
            create: { key, label: key },
          })
        )
      );
      await this.prisma.listingAmenity.createMany({
        data: amenities.map((a) => ({ listingId: listing.id, amenityId: a.id })),
        skipDuplicates: true,
      });
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

    this.notifications
      .createForAdmins(NotificationType.NEW_LISTING_PENDING, "Новое объявление на модерацию", dto.title || listing.id)
      .catch((err) => this.logger.warn(`Failed to notify admins: ${err?.message}`));

    return this.getById(listing.id);
  }

  async update(ownerId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    const { amenityKeys: _, ...listingFields } = dto;
    const data: any = { ...listingFields, houseRules: toJsonValue(dto.houseRules) };
    if (listing.status === ListingStatus.REJECTED) {
      data.status = ListingStatus.PENDING_REVIEW;
      data.moderationComment = null;
    }

    await this.prisma.listing.update({
      where: { id },
      data,
    });

    if (dto.amenityKeys) {
      // Replace amenities set (simple MVP behavior)
      await this.prisma.listingAmenity.deleteMany({ where: { listingId: id } });
      const keys = Array.from(
        new Set(dto.amenityKeys.map((k) => k.trim()).filter(Boolean))
      );
      const amenities = await Promise.all(
        keys.map((key) =>
          this.prisma.amenity.upsert({
            where: { key },
            update: {},
            create: { key, label: key },
          })
        )
      );
      await this.prisma.listingAmenity.createMany({
        data: amenities.map((a) => ({ listingId: id, amenityId: a.id })),
        skipDuplicates: true,
      });
    }

    // Recompute AI signals after update
    await Promise.all([
      this.aiQuality.quality({ listingId: id }),
      this.aiPricing.pricing({ listingId: id }),
      this.aiRisk.risk({ listingId: id }),
    ]);

    return this.getById(id);
  }

  /**
   * Submit for moderation: listing goes to PENDING_REVIEW. Admin approves → PUBLISHED.
   */
  async publish(ownerId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    const photosCount = await this.prisma.listingPhoto.count({ where: { listingId: id } });
    if (photosCount === 0) {
      throw new ForbiddenException("Listing must have at least one photo before publish");
    }

    await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.PENDING_REVIEW, moderationComment: null },
    });
    this.notifications
      .create(ownerId, NotificationType.LISTING_SUBMITTED, "Объявление отправлено на модерацию", null)
      .catch(() => {});
    this.notifications
      .createForAdmins(
        NotificationType.NEW_LISTING_PENDING,
        "Новое объявление на модерации",
        listing.title
      )
      .catch(() => {});
    return this.getById(id);
  }

  async unpublish(ownerId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    await this.prisma.listing.update({ where: { id }, data: { status: ListingStatus.DRAFT } });
    return this.getById(id);
  }

  async delete(ownerId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    await this.photosService.deleteAllForListing(id, ownerId);
    await this.prisma.listing.delete({ where: { id } });
    return { success: true };
  }
}

