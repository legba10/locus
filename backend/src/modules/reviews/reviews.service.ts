import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type ListingMetricAgg, type Review } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NeonUserService } from "../users/neon-user.service";
import { CreateReviewDto } from "./dto/create-review.dto";

/** Параметры формулы честного рейтинга (ТЗ-3): вес новых, проверенных и длинных отзывов выше */
const RECENCY_HALF_DAYS = 180;
const VERIFIED_WEIGHT = 1.2;
const LENGTH_FULL_CHARS = 300;
const LENGTH_WEIGHT_MIN = 0.5;
const LENGTH_WEIGHT_MAX = 1.0;

/** ТЗ-7: веса для ai_weight */
const AI_WEIGHT_NEW_USER = 0.7;
const AI_WEIGHT_CONFIRMED_STAY = 1.2;
const AI_WEIGHT_FREQUENT = 1.1;
const AI_WEIGHT_SPAM = 0.3;
const FREQUENT_REVIEWS_COUNT = 5;
const SPAM_LAST_N = 5;

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
      select: { id: true, ownerId: true },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    const bookingForStay = await this.findBookingForReview(userId, dto.listingId);
    const aiWeight = await this.calculateWeight(userId, !!bookingForStay);
    const visitType = bookingForStay ? (bookingForStay.stayDays > 7 ? "long" : bookingForStay.stayDays <= 1 ? "short" : "night") : null;
    const stayDays = bookingForStay?.stayDays ?? null;
    const metricsJson = dto.metrics.length
      ? (Object.fromEntries(dto.metrics.map((m) => [m.metricKey.trim(), m.value])) as Record<string, number>)
      : null;

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
            bookingId: bookingForStay?.id ?? null,
            rating: dto.rating,
            text: dto.text?.trim() || null,
            metricsJson: metricsJson ?? undefined,
            aiWeight,
            visitType: visitType ?? undefined,
            stayDays: stayDays ?? undefined,
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

        // Структурированные метрики для AI (cleanliness, location, noise, owner, value, checkin, safety)
        const keyMap: Record<string, "cleanliness" | "location" | "noise" | "owner" | "value" | "checkin" | "safety"> = {
          cleanliness: "cleanliness",
          location: "location",
          noise: "noise",
          owner: "owner",
          communication: "owner",
          value: "value",
          checkin: "checkin",
          safety: "safety",
        };
        const structured: Record<string, number> = {};
        for (const m of metrics) {
          const key = m.metricKey.trim().toLowerCase();
          const field = keyMap[key];
          if (field) structured[field] = m.value;
        }
        if (Object.keys(structured).length > 0) {
          await tx.reviewMetrics.create({
            data: {
              reviewId: review.id,
              ...(structured.cleanliness != null && { cleanliness: structured.cleanliness }),
              ...(structured.location != null && { location: structured.location }),
              ...(structured.noise != null && { noise: structured.noise }),
              ...(structured.owner != null && { owner: structured.owner }),
              ...(structured.value != null && { value: structured.value }),
              ...(structured.checkin != null && { checkin: structured.checkin }),
              ...(structured.safety != null && { safety: structured.safety }),
            },
          });
        }
      }

      // Теги отзыва (для AI и фильтров)
      const tags = (dto.tags ?? [])
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      const uniqueTags = [...new Set(tags)].slice(0, 20);
      if (uniqueTags.length > 0) {
        await tx.reviewTag.createMany({
          data: uniqueTags.map((tag) => ({ reviewId: review.id, tag })),
          skipDuplicates: true,
        });
      }

      return { reviewId: review.id, listingOwnerId: listing!.ownerId };
    }).then(async (out) => {
      await this.updateRatingCache(dto.listingId);
      const summary = await this.getListingRatingSummary(dto.listingId);
      const ownerId = (out as { listingOwnerId?: string }).listingOwnerId;
      if (ownerId) await this.recalcHostReputation(ownerId);
      return {
        reviewId: (out as { reviewId: string }).reviewId,
        avg: summary.avg ?? null,
        weightedAvg: summary.weightedAvg ?? null,
        count: summary.count,
        distribution: summary.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        percent: summary.percent ?? null,
      };
    });
  }

  /** ТЗ-7: вес отзыва (новый 0.7, подтверждённое проживание 1.2, частый 1.1, спам-подозрение 0.3) */
  async calculateWeight(userId: string, hasConfirmedBooking: boolean): Promise<number> {
    const totalByUser = await this.prisma.review.count({ where: { authorId: userId } });
    const lastReviews = await this.prisma.review.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: SPAM_LAST_N,
      select: { rating: true },
    });
    const allFive = lastReviews.length === SPAM_LAST_N && lastReviews.every((r) => r.rating === 5);
    if (allFive) return AI_WEIGHT_SPAM;
    if (hasConfirmedBooking) return AI_WEIGHT_CONFIRMED_STAY;
    if (totalByUser >= FREQUENT_REVIEWS_COUNT) return AI_WEIGHT_FREQUENT;
    if (totalByUser <= 1) return AI_WEIGHT_NEW_USER;
    return 1.0;
  }

  /** Найти бронь для связи с отзывом (подтверждённая, выезд прошёл, без отзыва) */
  private async findBookingForReview(
    guestId: string,
    listingId: string
  ): Promise<{ id: string; stayDays: number } | null> {
    const now = new Date();
    const booking = await this.prisma.booking.findFirst({
      where: {
        listingId,
        guestId,
        status: "CONFIRMED",
        checkOut: { lt: now },
      },
      include: { review: true },
      orderBy: { checkOut: "desc" },
    });
    if (!booking || booking.review) return null;
    const stayDays = Math.max(
      1,
      Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / (24 * 60 * 60 * 1000))
    );
    return { id: booking.id, stayDays };
  }

  /** ТЗ-8: обновить кэш рейтинга объявления (weighted_rating, avg_cleanliness, avg_noise, avg_location) */
  async updateRatingCache(listingId: string): Promise<void> {
    const reviews = await this.prisma.review.findMany({
      where: { listingId },
      select: {
        rating: true,
        aiWeight: true,
        structuredMetrics: { select: { cleanliness: true, noise: true, location: true } },
      },
    });
    let sumW = 0,
      sumRw = 0;
    let sumClean = 0,
      countClean = 0,
      sumNoise = 0,
      countNoise = 0,
      sumLoc = 0,
      countLoc = 0;
    let positive = 0;
    for (const r of reviews) {
      const w = r.aiWeight ?? 1;
      sumW += w;
      sumRw += r.rating * w;
      if (r.rating >= 4) positive++;
      const sm = r.structuredMetrics;
      if (sm?.cleanliness != null) {
        sumClean += sm.cleanliness;
        countClean++;
      }
      if (sm?.noise != null) {
        sumNoise += sm.noise;
        countNoise++;
      }
      if (sm?.location != null) {
        sumLoc += sm.location;
        countLoc++;
      }
    }
    const rating = sumW > 0 ? Math.round((sumRw / sumW) * 10) / 10 : null;
    const cleanliness = countClean > 0 ? Math.round(sumClean / countClean) : null;
    const noise = countNoise > 0 ? Math.round(sumNoise / countNoise) : null;
    const location = countLoc > 0 ? Math.round(sumLoc / countLoc) : null;
    const reviewCount = reviews.length;
    const positiveRatio = reviewCount > 0 ? Math.round((positive / reviewCount) * 100) / 100 : null;
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        ratingCache: {
          rating,
          cleanliness: cleanliness ?? undefined,
          noise: noise ?? undefined,
          location: location ?? undefined,
          reviews: reviewCount,
          positive_ratio: positiveRatio ?? undefined,
        },
      },
    });
  }

  /** ТЗ-10: аналитика отзывов для AI (из кэша или расчёт) */
  async getReviewAnalytics(listingId: string): Promise<{
    rating: number | null;
    metrics: { cleanliness?: number; noise?: number; comfort?: number; location?: number };
    review_count: number;
    positive_ratio: number | null;
  }> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { ratingCache: true },
    });
    const cache = listing?.ratingCache as Record<string, unknown> | null | undefined;
    if (cache && typeof cache.rating === "number") {
      return {
        rating: cache.rating as number,
        metrics: {
          cleanliness: (cache.cleanliness as number) ?? undefined,
          noise: (cache.noise as number) ?? undefined,
          comfort: (cache as Record<string, unknown>).comfort as number | undefined,
          location: (cache.location as number) ?? undefined,
        },
        review_count: (cache.reviews as number) ?? 0,
        positive_ratio: (cache.positive_ratio as number) ?? null,
      };
    }
    await this.updateRatingCache(listingId);
    const updated = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { ratingCache: true },
    });
    const c = (updated?.ratingCache ?? {}) as Record<string, unknown>;
    return {
      rating: (c.rating as number) ?? null,
      metrics: {
        cleanliness: c.cleanliness as number | undefined,
        noise: c.noise as number | undefined,
        comfort: c.comfort as number | undefined,
        location: c.location as number | undefined,
      },
      review_count: (c.reviews as number) ?? 0,
      positive_ratio: (c.positive_ratio as number) ?? null,
    };
  }

  /** ТЗ-9: случайные вопросы для формы отзыва (count из активных) */
  async getRandomQuestions(count: number = 5): Promise<{ id: string; key: string; label: string }[]> {
    const all = await this.prisma.reviewQuestion.findMany({
      where: { active: true },
      select: { id: true, key: true, label: true },
    });
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /** Пересчёт репутации владельца (host_score, trust) по отзывам на его объявлениях (ТЗ-7) */
  async recalcHostReputation(hostId: string): Promise<void> {
    const agg = await this.prisma.review.aggregate({
      where: { listing: { ownerId: hostId } },
      _avg: { rating: true },
      _count: { id: true },
    });
    const avg = agg._avg.rating ?? null;
    const score = avg != null ? Math.round(avg * 20) : null; // 1–5 → 20–100
    await this.prisma.userReputation.upsert({
      where: { userId: hostId },
      create: {
        userId: hostId,
        hostScore: score,
        trustScore: score,
      },
      update: {
        hostScore: score,
        trustScore: score,
      },
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
      structuredMetrics?: {
        cleanliness?: number | null;
        location?: number | null;
        noise?: number | null;
        owner?: number | null;
        value?: number | null;
        checkin?: number | null;
        safety?: number | null;
      } | null;
      tags?: Array<{ tag: string }>;
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
        structuredMetrics: {
          select: {
            cleanliness: true,
            location: true,
            noise: true,
            owner: true,
            value: true,
            checkin: true,
            safety: true,
          },
        },
        tags: { select: { tag: true } },
      },
    }) as any;
  }

  /**
   * Вес одного отзыва для честного рейтинга (ТЗ-3):
   * - новизна: новые отзывы весят выше (экспоненциальный спад по времени)
   * - проверенность: отзыв с bookingId (после реального бронирования) весит выше
   * - длина: длинный текст весит выше
   */
  private getReviewWeight(review: {
    rating: number;
    text: string | null;
    createdAt: Date;
    bookingId: string | null;
  }): number {
    const now = Date.now();
    const daysAgo = (now - new Date(review.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    const recency = 0.5 + 0.5 * Math.exp(-daysAgo / RECENCY_HALF_DAYS);

    const verified = review.bookingId != null ? VERIFIED_WEIGHT : 1.0;

    const len = (review.text?.length ?? 0);
    const lengthFactor =
      len >= LENGTH_FULL_CHARS
        ? LENGTH_WEIGHT_MAX
        : LENGTH_WEIGHT_MIN + (len / LENGTH_FULL_CHARS) * (LENGTH_WEIGHT_MAX - LENGTH_WEIGHT_MIN);

    return recency * verified * lengthFactor;
  }

  /**
   * Сводка рейтинга с честным взвешенным средним (ТЗ-3).
   * Возвращает avg (простое среднее), weightedAvg (по весам), count, distribution, percent.
   */
  private buildWeightedSummary(
    reviews: Array<{ rating: number; text: string | null; createdAt: Date; bookingId: string | null }>
  ): {
    avg: number | null;
    weightedAvg: number | null;
    count: number;
    distribution: Record<number, number>;
    percent: number | null;
  } {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;
    let sumWeight = 0;
    let sumWeightedRating = 0;

    for (const r of reviews) {
      if (r.rating < 1 || r.rating > 5) continue;
      const w = this.getReviewWeight(r);
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
      sumRating += r.rating;
      sumWeight += w;
      sumWeightedRating += r.rating * w;
    }

    const count = reviews.length;
    const avg = count > 0 ? sumRating / count : null;
    const weightedAvg = sumWeight > 0 ? sumWeightedRating / sumWeight : avg;
    const positive =
      count > 0 ? ((distribution[4] ?? 0) + (distribution[5] ?? 0)) / count : 0;
    const percent = count > 0 ? Math.round(positive * 100) : null;

    return {
      avg,
      weightedAvg: weightedAvg != null ? Math.round(weightedAvg * 10) / 10 : null,
      count,
      distribution,
      percent,
    };
  }

  /**
   * Aggregate rating summary for a listing (with weighted honest rating).
   */
  async getListingRatingSummary(listingId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { listingId },
      select: { rating: true, text: true, createdAt: true, bookingId: true },
    });
    return this.buildWeightedSummary(reviews);
  }

  /**
   * Aggregate rating summary for a host (owner of listings) (with weighted honest rating).
   */
  async getUserRatingSummary(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { listing: { ownerId: userId } },
      select: { rating: true, text: true, createdAt: true, bookingId: true },
    });
    return this.buildWeightedSummary(reviews);
  }
}

