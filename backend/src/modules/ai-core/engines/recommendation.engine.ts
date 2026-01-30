import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * RecommendationEngine — рекомендации для пользователей
 */
@Injectable()
export class RecommendationEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить рекомендованные объявления для пользователя
   */
  async getRecommendedListings(params: {
    city?: string;
    maxPrice?: number;
    guests?: number;
    limit?: number;
  }) {
    const { city, maxPrice, guests, limit = 10 } = params;

    const where: any = { status: 'PUBLISHED' };
    if (city) where.city = city;
    if (maxPrice) where.basePrice = { lte: maxPrice };
    if (guests) where.capacityGuests = { gte: guests };

    // Получаем объявления с данными для scoring
    const listings = await this.prisma.listing.findMany({
      where,
      include: {
        photos: { take: 1 },
        reviews: { select: { rating: true } },
        amenities: { select: { amenityId: true } },
      },
      take: 50,
    });

    // Scoring для сортировки по "полезности"
    const scored = listings.map(listing => {
      let score = 0;

      // Фото
      score += Math.min(20, (listing.photos?.length ?? 0) * 4);

      // Описание
      score += Math.min(15, Math.floor(listing.description.length / 30));

      // Отзывы
      if (listing.reviews.length > 0) {
        const avgRating = listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length;
        score += avgRating * 4;
      }

      // Удобства
      score += Math.min(15, (listing.amenities?.length ?? 0) * 2);

      // Цена (бонус за низкую цену)
      if (listing.basePrice < 3000) score += 10;
      else if (listing.basePrice < 5000) score += 5;

      return { listing, score };
    });

    // Сортировка по score (не по цене!)
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(({ listing, score }) => ({
      id: listing.id,
      title: listing.title,
      city: listing.city,
      price: listing.basePrice,
      photo: listing.photos[0]?.url,
      score: Math.min(100, Math.round(score)),
      reason: this.getRecommendationReason(score),
    }));
  }

  private getRecommendationReason(score: number): string {
    if (score >= 70) return 'Отличный вариант по всем параметрам';
    if (score >= 50) return 'Хорошее соотношение цены и качества';
    return 'Подходящий вариант';
  }
}
