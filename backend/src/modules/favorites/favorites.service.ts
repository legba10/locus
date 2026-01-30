import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async addFavorite(userId: string, listingId: string) {
    // Check if listing exists
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (existing) {
      throw new ConflictException("Listing already in favorites");
    }

    const favorite = await this.prisma.favorite.create({
      data: { userId, listingId },
      include: {
        listing: {
          include: {
            photos: { orderBy: { sortOrder: "asc" }, take: 1 },
            aiScores: true,
          },
        },
      },
    });

    return { success: true, favorite };
  }

  async removeFavorite(userId: string, listingId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (!existing) {
      throw new NotFoundException("Favorite not found");
    }

    await this.prisma.favorite.delete({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    return { success: true };
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            photos: { orderBy: { sortOrder: "asc" }, take: 1 },
            amenities: { include: { amenity: true } },
            aiScores: true,
            reviews: { select: { rating: true } },
          },
        },
      },
    });

    // Transform to listing format with favorite flag
    const items = favorites.map((f) => {
      const avgRating = f.listing.reviews.length > 0
        ? f.listing.reviews.reduce((sum, r) => sum + r.rating, 0) / f.listing.reviews.length
        : 0;

      return {
        ...f.listing,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: f.listing.reviews.length,
        favoritedAt: f.createdAt,
      };
    });

    return { items, total: items.length };
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    return !!favorite;
  }

  async toggleFavorite(userId: string, listingId: string) {
    const isFav = await this.isFavorite(userId, listingId);

    if (isFav) {
      await this.removeFavorite(userId, listingId);
      return { isFavorite: false };
    } else {
      await this.addFavorite(userId, listingId);
      return { isFavorite: true };
    }
  }
}
