import { Injectable } from "@nestjs/common";
import { ListingStatus, ListingType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiSearchService } from "../ai-orchestrator/services/ai-search.service";
import { SearchQueryDto, SearchBodyDto } from "./dto/search-query.dto";

function withTimeout<T>(promise: Promise<T>, ms: number, label = "timeout"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

type AiResult = Awaited<ReturnType<AiSearchService["search"]>>;
type SearchSort = "popular" | "newest" | "price_asc" | "price_desc";

const CITY_CENTER_COORDS: Record<string, { lat: number; lng: number }> = {
  "Москва": { lat: 55.7558, lng: 37.6176 },
  "Санкт-Петербург": { lat: 59.9343, lng: 30.3351 },
  "Сургут": { lat: 61.254, lng: 73.3962 },
  "Новосибирск": { lat: 55.0084, lng: 82.9357 },
  "Екатеринбург": { lat: 56.8389, lng: 60.6057 },
  "Казань": { lat: 55.7963, lng: 49.1088 },
};

function normalizeTypes(dto: SearchQueryDto): ListingType[] {
  const fromSingle = dto.type ? [dto.type] : [];
  const fromCsv =
    dto.types
      ?.split(",")
      .map((x) => x.trim().toUpperCase())
      .filter((x): x is ListingType => ["APARTMENT", "HOUSE", "ROOM", "STUDIO"].includes(x)) ?? [];
  return Array.from(new Set([...fromSingle, ...fromCsv]));
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildOrderBy(sort: SearchSort): Prisma.ListingOrderByWithRelationInput {
  if (sort === "price_asc") return { basePrice: "asc" };
  if (sort === "price_desc") return { basePrice: "desc" };
  if (sort === "newest") return { createdAt: "desc" };
  return { viewsCount: "desc" };
}

function buildWhere(dto: SearchQueryDto): Prisma.ListingWhereInput {
  const amenityKeys =
    dto.amenities?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const selectedTypes = normalizeTypes(dto);
  const and: Prisma.ListingWhereInput[] = [];

  if (dto.city) and.push({ city: dto.city });
  if (dto.guests) and.push({ capacityGuests: { gte: dto.guests } });
  if (selectedTypes.length > 0) and.push({ type: { in: selectedTypes } });
  if (dto.rooms != null) and.push({ bedrooms: { gte: dto.rooms } });
  if (dto.priceMin != null || dto.priceMax != null) {
    and.push({
      basePrice: {
        ...(dto.priceMin != null ? { gte: dto.priceMin } : {}),
        ...(dto.priceMax != null ? { lte: dto.priceMax } : {}),
      },
    });
  }
  if (dto.q) {
    and.push({
      OR: [
        { title: { contains: dto.q, mode: "insensitive" } },
        { description: { contains: dto.q, mode: "insensitive" } },
      ],
    });
  }
  if (amenityKeys.length > 0) {
    for (const key of amenityKeys) {
      and.push({
        amenities: { some: { amenity: { key } } },
      });
    }
  }

  return {
    status: ListingStatus.PUBLISHED,
    photos: { some: {} },
    ...(and.length ? { AND: and } : {}),
  };
}

function applyRadiusFilterIfNeeded<T extends { lat: number | null; lng: number | null; city: string }>(
  rows: T[],
  city?: string,
  radiusKm?: number
): T[] {
  if (!city || !radiusKm) return rows;
  const center = CITY_CENTER_COORDS[city];
  if (!center) return rows;
  return rows.filter((x) => {
    if (x.lat == null || x.lng == null) return false;
    return distanceKm(center.lat, center.lng, x.lat, x.lng) <= radiusKm;
  });
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiSearch: AiSearchService,
  ) {}

  async search(dto: SearchQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const take = Math.min(Math.max(limit, 1), 20);
    const skip = (page - 1) * take;
    const sort = (dto.sort ?? "popular") as SearchSort;
    const where = buildWhere(dto);
    const include = {
      photos: { orderBy: { sortOrder: "asc" as const }, take: 1 },
      amenities: { include: { amenity: true } },
      aiScores: true,
      intelligence: true,
    };

    if (dto.ai === "1" && dto.q) {
      const ai = await withTimeout<AiResult>(
        this.aiSearch.search({
          query: dto.q,
          context: dto.city ? { city: dto.city } : undefined,
        }),
        5000,
        "AI timeout"
      ).catch(() => null);

      if (ai) {
        const ids = ai.results.map((r) => r.listingId);
        const listingsRaw = await this.prisma.listing.findMany({
          where: { ...where, id: { in: ids } },
          include,
        });
        const listings = applyRadiusFilterIfNeeded(listingsRaw, dto.city, dto.radiusKm);
        const byId = new Map(listings.map((l) => [l.id, l]));
        const ranked = ids
          .map((id) => byId.get(id))
          .filter((x): x is NonNullable<typeof x> => Boolean(x))
          .slice(0, 30);
        const paged = ranked.slice(skip, skip + take);

        return {
          items: paged,
          total: ranked.length,
          page,
          limit: take,
          ai,
        };
      }
    }

    const rows = await this.prisma.listing.findMany({
      where,
      orderBy: buildOrderBy(sort),
      take: dto.radiusKm && dto.city ? 300 : take,
      skip: dto.radiusKm && dto.city ? 0 : skip,
      include,
    });
    const filtered = applyRadiusFilterIfNeeded(rows, dto.city, dto.radiusKm);
    const items = dto.radiusKm && dto.city ? filtered.slice(skip, skip + take) : filtered;
    const total = dto.radiusKm && dto.city ? filtered.length : await this.prisma.listing.count({ where });
    return { items, total, page, limit: take };
  }

  // Advanced POST search with AI scoring
  async searchAdvanced(dto: SearchBodyDto) {
    const useAi = dto.useAi !== false;
    
    const where: any = { status: ListingStatus.PUBLISHED };

    if (dto.city) {
      where.city = dto.city;
    }

    if (dto.guests) {
      where.capacityGuests = { gte: dto.guests };
    }

    if (dto.type) {
      where.type = dto.type;
    }

    if (dto.rooms != null) {
      where.bedrooms = { gte: dto.rooms };
    }

    if (dto.priceMin != null || dto.priceMax != null) {
      where.basePrice = {};
      if (dto.priceMin != null) where.basePrice.gte = dto.priceMin;
      if (dto.priceMax != null) where.basePrice.lte = dto.priceMax;
    }

    if (dto.query) {
      where.OR = [
        { title: { contains: dto.query, mode: "insensitive" } },
        { description: { contains: dto.query, mode: "insensitive" } },
        { city: { contains: dto.query, mode: "insensitive" } },
      ];
    }

    if (dto.amenities && dto.amenities.length > 0) {
      where.AND = [
        ...(where.AND ?? []),
        ...dto.amenities.map((key) => ({ amenities: { some: { amenity: { key } } } })),
      ];
    }

    where.photos = { some: {} };

    // Determine sort
    let orderBy: any;
    switch (dto.sort) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "ai_score":
        orderBy = { intelligence: { qualityScore: "desc" } };
        break;
      default:
        orderBy = { viewsCount: "desc" };
    }

    // Fetch listings
    let items = await this.prisma.listing.findMany({
      where,
      orderBy,
      take: 30,
      include: {
        photos: { orderBy: { sortOrder: "asc" }, take: 3 },
        amenities: { include: { amenity: true } },
        aiScores: true,
        intelligence: true,
        reviews: { select: { rating: true } },
      },
    });

    // AI reranking if enabled and we have a natural language query
    let aiExplanation: any = null;
    if (useAi && dto.query && dto.query.length > 3) {
      try {
        const aiResult = await withTimeout<AiResult>(
          this.aiSearch.search({
            query: dto.query,
            context: dto.city ? { city: dto.city } : undefined,
          }),
          5000,
          "AI timeout"
        );
        
        // Rerank items based on AI scores
        const aiScores = new Map<string, number>(
          aiResult.results.map((r) => [r.listingId, r.score] as const)
        );
        items = items.sort((a, b) => {
          const scoreA = aiScores.get(a.id) ?? 0;
          const scoreB = aiScores.get(b.id) ?? 0;
          return scoreB - scoreA;
        });

        aiExplanation = {
          intent: aiResult.intent,
          explanation: aiResult.explanation,
          topMatches: aiResult.results.slice(0, 3).map((r) => ({
            listingId: r.listingId,
            score: r.score,
            reasons: r.reasons,
          })),
        };
      } catch (error) {
        console.error("AI search error:", error);
        // Continue without AI
      }
    }

    // Calculate average rating for each listing
    const enrichedItems = items.map(item => {
      const avgRating = item.reviews.length > 0
        ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
        : 0;
      
      return {
        ...item,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: item.reviews.length,
      };
    });

    return {
      items: enrichedItems,
      total: enrichedItems.length,
      filters: {
        city: dto.city,
        priceMin: dto.priceMin,
        priceMax: dto.priceMax,
        guests: dto.guests,
        query: dto.query,
      },
      ai: aiExplanation,
    };
  }
}

