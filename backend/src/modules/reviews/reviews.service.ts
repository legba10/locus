import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type ListingMetricAgg, type Review } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NeonUserService } from "../users/neon-user.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly neonUser: NeonUserService
  ) {}

  async createReview(userId: string, email: string | null | undefined, dto: CreateReviewDto) {
    // Ensure Neon user exists for FK constraints
    await this.neonUser.ensureUserExists(userId, email);

    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    const metrics = dto.metrics
      .map((m) => ({ metricKey: m.metricKey.trim(), value: m.value }))
      .filter((m) => m.metricKey.length > 0);

    return this.prisma.$transaction(async (tx) => {
      let review: Review;
      try {
        review = await tx.review.create({
          data: {
            listingId: dto.listingId,
            authorId: userId,
            rating: dto.rating,
            text: dto.text?.trim() || null,
          },
        });
      } catch (e: any) {
        // Unique constraint on (listingId, authorId)
        if (e?.code === "P2002") {
          throw new ConflictException({ code: "REVIEW_ALREADY_EXISTS", message: "Вы уже оставили отзыв" });
        }
        throw e;
      }

      if (metrics.length) {
        await tx.reviewMetric.createMany({
          data: metrics.map((m) => ({
            reviewId: review.id,
            metricKey: m.metricKey,
            value: m.value,
          })),
          skipDuplicates: true,
        });

        // Atomic aggregate updates (avg + count) using INSERT..ON CONFLICT.
        for (const m of metrics) {
          await tx.$executeRaw(
            Prisma.sql`
              INSERT INTO "ListingMetricAgg" ("listingId","metricKey","avgValue","count","updatedAt")
              VALUES (${dto.listingId}, ${m.metricKey}, ${m.value}::double precision, 1, NOW())
              ON CONFLICT ("listingId","metricKey") DO UPDATE SET
                "avgValue" = (("ListingMetricAgg"."avgValue" * "ListingMetricAgg"."count") + EXCLUDED."avgValue") / ("ListingMetricAgg"."count" + 1),
                "count" = "ListingMetricAgg"."count" + 1,
                "updatedAt" = NOW();
            `
          );
        }
      }

      return { reviewId: review.id };
    }).then(async (out) => {
      const summary = await this.getListingRatingSummary(dto.listingId);
      const distribution = summary.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const total = summary.count ?? 0;
      const positive = total > 0 ? ((distribution[4] ?? 0) + (distribution[5] ?? 0)) / total : 0;
      const percent = Math.round(positive * 100);
      return {
        ...out,
        avg: summary.avg ?? null,
        count: total,
        distribution,
        percent,
      };
    });
  }

  async getListingMetrics(listingId: string): Promise<ListingMetricAgg[]> {
    return this.prisma.listingMetricAgg.findMany({
      where: { listingId },
      orderBy: [{ count: "desc" }, { metricKey: "asc" }],
    });
  }

  async getListingReviews(
    listingId: string,
    limit = 10,
    skip = 0
  ): Promise<
    Array<{
      id: string;
      authorId: string;
      rating: number;
      text: string | null;
      createdAt: Date;
      author?: { id: string; profile?: { name: string | null; avatarUrl: string | null } | null };
      metrics?: Array<{ metricKey: string; value: number }>;
    }>
  > {
    return this.prisma.review.findMany({
      where: { listingId },
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit, 1), 50),
      skip: Math.max(0, skip),
      select: {
        id: true,
        authorId: true,
        rating: true,
        text: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
        metrics: { select: { metricKey: true, value: true } },
      },
    }) as any;
  }

  private buildRatingSummary(rows: Array<{ rating: number; _count: { _all: number } }>) {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let weighted = 0;

    for (const row of rows) {
      const r = row.rating;
      const c = row._count._all;
      if (r >= 1 && r <= 5) {
        distribution[r] = (distribution[r] ?? 0) + c;
      }
      total += c;
      weighted += r * c;
    }

    const avg = total > 0 ? weighted / total : null;

    return { avg, count: total, distribution };
  }

  /**
   * Aggregate rating summary for a listing.
   */
  async getListingRatingSummary(listingId: string) {
    const rows = await this.prisma.review.groupBy({
      by: ["rating"],
      where: { listingId },
      _count: { _all: true },
    });
    return this.buildRatingSummary(rows);
  }

  /**
   * Aggregate rating summary for a host (owner of listings).
   */
  async getUserRatingSummary(userId: string) {
    const rows = await this.prisma.review.groupBy({
      by: ["rating"],
      where: { listing: { ownerId: userId } },
      _count: { _all: true },
    });
    return this.buildRatingSummary(rows);
  }
}

