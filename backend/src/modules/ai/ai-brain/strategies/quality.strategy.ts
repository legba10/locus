import { Injectable } from '@nestjs/common';
import type { ListingContext } from '../ai-brain.service';

/**
 * Quality Strategy — оценка качества объявления.
 * 
 * Формула:
 * score = rating * 20 + photosCount * 2 + descriptionLength * 0.1 + completeness_bonuses
 */
@Injectable()
export class QualityStrategy {
  calculate(context: ListingContext): number {
    let score = 0;

    // 1. Rating (max 20 points from rating * 20, assuming rating 0-5)
    const ratingScore = Math.min(20, (context.avgRating || 0) * 4);
    score += ratingScore;

    // 2. Photos (max 20 points, 2 per photo up to 10)
    const photosScore = Math.min(20, context.photosCount * 2);
    score += photosScore;

    // 3. Description length (max 20 points)
    const descLen = context.description?.length ?? 0;
    const descScore = Math.min(20, descLen * 0.1);
    score += descScore;

    // 4. Description quality signals (max 15 points)
    const descQuality = this.analyzeDescriptionQuality(context.description);
    score += descQuality;

    // 5. Completeness bonuses (max 25 points)
    if (context.hasCoordinates) score += 10;
    if (context.amenitiesCount >= 3) score += 10;
    if (context.title && context.title.length >= 20) score += 5;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private analyzeDescriptionQuality(description?: string): number {
    if (!description) return 0;
    
    const text = description.toLowerCase();
    let bonus = 0;

    // Transport accessibility
    if (/(метро|транспорт|пешком|минут|остановк)/i.test(text)) bonus += 3;

    // Quietness/comfort
    if (/(тихо|тишина|спокойн|уютн|комфорт)/i.test(text)) bonus += 3;

    // Internet/work
    if (/(интернет|wi-?fi|рабоч|работа)/i.test(text)) bonus += 2;

    // Rules transparency
    if (/(правила|курени|животн|дети|вечерин)/i.test(text)) bonus += 2;

    // Location details
    if (/(центр|район|рядом|близко|парк|магазин)/i.test(text)) bonus += 2;

    // Kitchen/amenities
    if (/(кухня|холодильник|стир|посуд)/i.test(text)) bonus += 2;

    // Specific room info
    if (/(спальн|кроват|диван|балкон|терраса)/i.test(text)) bonus += 1;

    return Math.min(15, bonus);
  }
}
