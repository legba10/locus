import { ForbiddenException, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { ListingStatus, ListingType, Prisma, UserRoleEnum } from "@prisma/client";
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
import { CanonicalListingStatus, fromCanonicalListingStatus, toCanonicalListingStatus } from "./listing-status.util";
import { ROOT_ADMIN_EMAIL } from "../auth/constants";

type ListingStatsMetric = "views" | "favorites" | "messages" | "bookings";

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

  private async isPrivilegedUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { appRole: true, email: true },
    });
    if (!user) return false;
    const emailNorm = (user.email ?? "").trim().toLowerCase();
    const isRootByEmail = emailNorm === ROOT_ADMIN_EMAIL.trim().toLowerCase();
    return (
      isRootByEmail ||
      user.appRole === UserRoleEnum.ROOT ||
      user.appRole === UserRoleEnum.ADMIN ||
      user.appRole === UserRoleEnum.MANAGER
    );
  }

  private shouldReModerateOnListingPatch(
    listing: { type: ListingType; city: string; addressLine: string | null; lat: number | null; lng: number | null },
    dto: UpdateListingDto
  ): boolean {
    const typeChanged = dto.type !== undefined && dto.type !== listing.type;
    const cityChanged = dto.city !== undefined && dto.city !== listing.city;
    const addressChanged = dto.addressLine !== undefined && dto.addressLine !== (listing.addressLine ?? null);
    const latChanged = dto.lat !== undefined && dto.lat !== (listing.lat ?? null);
    const lngChanged = dto.lng !== undefined && dto.lng !== (listing.lng ?? null);
    return typeChanged || cityChanged || addressChanged || latChanged || lngChanged;
  }

  private normalizeListingForUi<T extends Record<string, any>>(listing: T): T & {
    statusCanonical: CanonicalListingStatus;
    moderation_note: string | null;
    published_at: Date | null;
    rejected_at: Date | null;
  } {
    return {
      ...listing,
      statusCanonical: toCanonicalListingStatus(listing.status),
      moderation_note: (listing.moderationNote ?? listing.moderationComment ?? null) as string | null,
      published_at: (listing.publishedAt ?? null) as Date | null,
      rejected_at: (listing.rejectedAt ?? null) as Date | null,
    };
  }

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
    return { items: items.map((item) => this.normalizeListingForUi(item)), total };
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
    const enriched = items.map((x: any) => this.normalizeListingForUi({
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
      return this.normalizeListingForUi({
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
      });
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

    return this.normalizeListingForUi({
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
    });
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
    const isPrivileged = await this.isPrivilegedUser(ownerId);

    // TZ-47: admin — размещает бесплатно (без лимита), moderation_skip в publish()
    // FINAL LOGIC: limit is tracked in Supabase profile (listing_used/listing_limit).
    // Fallback: if Supabase is unavailable/misconfigured, use Neon limits + listing count.
    if (!isPrivileged) {
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
        basePrice: isPrivileged ? 0 : dto.basePrice,
        currency: dto.currency ?? "RUB",
        capacityGuests: dto.capacityGuests ?? 2,
        bedrooms: dto.bedrooms ?? 1,
        beds: dto.beds ?? 1,
        bathrooms: dto.bathrooms ?? 1,
        type: (dto.type as ListingType | undefined) ?? ListingType.APARTMENT,
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

    return this.getById(listing.id);
  }

  async update(ownerId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    const isPrivileged = await this.isPrivilegedUser(ownerId);
    if (listing.ownerId !== ownerId && !isPrivileged) throw new ForbiddenException("Not your listing");

    const { amenityKeys: _, ...listingFields } = dto;
    const data: any = { ...listingFields, houseRules: toJsonValue(dto.houseRules) };
    if (listing.status === ListingStatus.REJECTED) {
      data.status = ListingStatus.PENDING_REVIEW;
      data.moderationComment = null;
      data.moderationNote = null;
      data.rejectedAt = null;
    } else if (
      !isPrivileged &&
      listing.status === ListingStatus.PUBLISHED &&
      this.shouldReModerateOnListingPatch(listing, dto)
    ) {
      data.status = ListingStatus.PENDING_REVIEW;
      data.moderationComment = null;
      data.moderationNote = null;
      data.rejectedAt = null;
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
    const isPrivileged = await this.isPrivilegedUser(ownerId);
    if (listing.ownerId !== ownerId && !isPrivileged) throw new ForbiddenException("Not your listing");
    if (listing.status !== ListingStatus.DRAFT && listing.status !== ListingStatus.REJECTED) {
      throw new ForbiddenException("Listing can be submitted only from draft/rejected status");
    }

    const photosCount = await this.prisma.listingPhoto.count({ where: { listingId: id } });
    if (photosCount === 0) {
      throw new ForbiddenException("Listing must have at least one photo before publish");
    }

    const data: Prisma.ListingUpdateInput = isPrivileged
      ? {
          status: ListingStatus.PUBLISHED,
          publishedAt: new Date(),
          moderationComment: null,
          moderationNote: null,
          rejectedAt: null,
          moderatedBy: { connect: { id: ownerId } },
        }
      : {
          status: ListingStatus.PENDING_REVIEW,
          moderationComment: null,
          moderationNote: null,
          rejectedAt: null,
        };

    await this.prisma.listing.update({
      where: { id },
      data,
    });
    if (!isPrivileged) {
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
    }
    return this.getById(id);
  }

  async unpublish(ownerId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId !== ownerId) throw new ForbiddenException("Not your listing");

    const nextStatus = listing.status === ListingStatus.PUBLISHED ? ListingStatus.ARCHIVED : ListingStatus.DRAFT;
    await this.prisma.listing.update({ where: { id }, data: { status: nextStatus } });
    return this.getById(id);
  }

  async updateStatusByAdmin(
    adminId: string,
    id: string,
    nextStatus: CanonicalListingStatus,
    moderationNote?: string | null
  ) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException("Listing not found");

    const current = toCanonicalListingStatus(listing.status);
    const allowed =
      (current === "moderation" && (nextStatus === "published" || nextStatus === "rejected")) ||
      (current === "published" && nextStatus === "archived");

    if (!allowed) {
      throw new ForbiddenException(`Invalid transition: ${current} -> ${nextStatus}`);
    }

    const target = fromCanonicalListingStatus(nextStatus);
    const now = new Date();
    const data: Prisma.ListingUpdateInput = {
      status: target,
      moderatedBy: { connect: { id: adminId } },
    };

    if (nextStatus === "published") {
      data.publishedAt = now;
      data.rejectedAt = null;
      data.moderationNote = null;
      data.moderationComment = null;
    } else if (nextStatus === "rejected") {
      data.rejectedAt = now;
      data.moderationNote = moderationNote ?? null;
      data.moderationComment = moderationNote ?? null;
    }

    await this.prisma.listing.update({
      where: { id },
      data,
    });

    return this.getById(id);
  }

  private async ensureListingStatsRow(listingId: string) {
    return this.prisma.listingStats.upsert({
      where: { listingId },
      create: { listingId },
      update: {},
    });
  }

  private buildActivitySeries(base: { views: number; favorites: number; messages: number }, days: number) {
    const start = startOfDayUtc(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
    const rows: Array<{ date: string; views: number; clicks: number; favorites: number }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const date = d.toISOString().slice(0, 10);
      const spread = i + 1;
      const sum = (days * (days + 1)) / 2;
      rows.push({
        date,
        views: Math.max(0, Math.round((base.views * spread) / sum)),
        clicks: Math.max(0, Math.round((base.messages * spread) / sum)),
        favorites: Math.max(0, Math.round((base.favorites * spread) / sum)),
      });
    }
    return rows;
  }

  private async ensureCanViewListingAnalytics(listingId: string, userId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { ownerId: true },
    });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId === userId) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { appRole: true, email: true },
    });
    const emailNorm = (user?.email ?? "").trim().toLowerCase();
    const isRoot = emailNorm === ROOT_ADMIN_EMAIL.trim().toLowerCase();
    const isAdmin =
      isRoot ||
      user?.appRole === UserRoleEnum.ROOT ||
      user?.appRole === UserRoleEnum.ADMIN ||
      user?.appRole === UserRoleEnum.MANAGER;
    if (!isAdmin) {
      throw new ForbiddenException("Only owner or admin can view listing analytics");
    }
  }

  async getListingStatsForOwnerOrAdmin(listingId: string, userId: string, days = 30) {
    await this.ensureCanViewListingAnalytics(listingId, userId);
    const row = await this.ensureListingStatsRow(listingId);
    const activityDays = days === 7 ? 7 : 30;
    return {
      listing_id: listingId,
      views: row.views,
      favorites: row.favorites,
      messages: row.messages,
      bookings: row.bookings,
      updated_at: row.updatedAt,
      activity: this.buildActivitySeries(
        {
          views: row.views,
          favorites: row.favorites,
          messages: row.messages,
        },
        activityDays
      ),
      sources: [
        { key: "search", label: "Поиск", value: 42 },
        { key: "home", label: "Главная", value: 27 },
        { key: "ai", label: "AI подбор", value: 21 },
        { key: "favorites", label: "Избранное", value: 10 },
      ],
    };
  }

  async incrementListingStatsMetric(listingId: string, metric: ListingStatsMetric) {
    await this.prisma.listing.findUniqueOrThrow({ where: { id: listingId }, select: { id: true } });
    const updated = await this.prisma.listingStats.upsert({
      where: { listingId },
      create: {
        listingId,
        [metric]: 1,
      },
      update: {
        [metric]: { increment: 1 },
      },
    });
    return { ok: true, metric, value: updated[metric] };
  }

  async resetListingStatsByAdmin(listingId: string) {
    await this.prisma.listing.findUniqueOrThrow({ where: { id: listingId }, select: { id: true } });
    const updated = await this.prisma.listingStats.upsert({
      where: { listingId },
      create: { listingId, views: 0, favorites: 0, messages: 0, bookings: 0 },
      update: { views: 0, favorites: 0, messages: 0, bookings: 0 },
    });
    return { ok: true, stats: updated };
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

