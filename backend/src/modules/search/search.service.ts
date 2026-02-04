import { Injectable } from "@nestjs/common";
import { ListingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiSearchService } from "../ai-orchestrator/services/ai-search.service";
import { SearchQueryDto, SearchBodyDto } from "./dto/search-query.dto";

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiSearch: AiSearchService,
  ) {}

  async search(dto: SearchQueryDto) {
    const amenityKeys =
      dto.amenities?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

    if (dto.ai === "1" && dto.q) {
      const ai = await this.aiSearch.search({
        query: dto.q,
        context: dto.city ? { city: dto.city } : undefined,
      });

      const ids = ai.results.map((r) => r.listingId);
      const listings = await this.prisma.listing.findMany({
        where: { id: { in: ids }, status: ListingStatus.PUBLISHED, photos: { some: {} } },
        include: {
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
          amenities: { include: { amenity: true } },
          aiScores: true,
          intelligence: true,
        },
      });

      // preserve AI rank order
      const byId = new Map(listings.map((l) => [l.id, l]));
      const items = ids.map((id) => byId.get(id)).filter(Boolean);

      return {
        items,
        ai,
      };
    }

    const orderBy =
      dto.sort === "price_asc"
        ? { basePrice: "asc" as const }
        : dto.sort === "price_desc"
          ? { basePrice: "desc" as const }
          : { createdAt: "desc" as const };

    const where = {
      status: ListingStatus.PUBLISHED,
      ...(dto.city ? { city: dto.city } : {}),
      ...(dto.guests ? { capacityGuests: { gte: dto.guests } } : {}),
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.rooms != null ? { bedrooms: { gte: dto.rooms } } : {}),
      ...(dto.priceMin || dto.priceMax
        ? {
            basePrice: {
              ...(dto.priceMin != null ? { gte: dto.priceMin } : {}),
              ...(dto.priceMax != null ? { lte: dto.priceMax } : {}),
            },
          }
        : {}),
      ...(dto.q
        ? {
            OR: [
              { title: { contains: dto.q, mode: "insensitive" as const } },
              { description: { contains: dto.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(amenityKeys.length
        ? {
            amenities: {
              some: { amenity: { key: { in: amenityKeys } } },
            },
          }
        : {}),
      photos: { some: {} },
    };

    const items = await this.prisma.listing.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        amenities: { include: { amenity: true } },
        aiScores: true,
        intelligence: true,
      },
    });

    return { items };
  }

  // Advanced POST search with AI scoring
  async searchAdvanced(dto: SearchBodyDto) {
    const useAi = dto.useAi !== false;
    
    // Build where clause
    const where: any = {
      status: ListingStatus.PUBLISHED,
    };

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
      where.amenities = {
        some: { amenity: { key: { in: dto.amenities } } },
      };
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
        orderBy = { createdAt: "desc" };
    }

    // Fetch listings
    let items = await this.prisma.listing.findMany({
      where,
      orderBy,
      take: 50,
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
        const aiResult = await this.aiSearch.search({
          query: dto.query,
          context: dto.city ? { city: dto.city } : undefined,
        });
        
        // Rerank items based on AI scores
        const aiScores = new Map(aiResult.results.map(r => [r.listingId, r.score]));
        items = items.sort((a, b) => {
          const scoreA = aiScores.get(a.id) ?? 0;
          const scoreB = aiScores.get(b.id) ?? 0;
          return scoreB - scoreA;
        });

        aiExplanation = {
          intent: aiResult.intent,
          explanation: aiResult.explanation,
          topMatches: aiResult.results.slice(0, 3).map(r => ({
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

