import { Injectable } from '@nestjs/common';

export interface SearchIntent {
  city?: string;
  maxPrice?: number;
  minPrice?: number;
  wantsQuiet?: boolean;
  wantsMetro?: boolean;
  wantsParking?: boolean;
  wantsPets?: boolean;
  guestsCount?: number;
  keywords: string[];
}

export interface SearchScoringContext {
  listingId: string;
  title: string;
  description: string;
  city: string;
  basePrice: number;
  qualityScore: number;
  demandScore: number;
  riskScore: number;
  amenities: string[];
}

export interface ScoredListing {
  listingId: string;
  relevanceScore: number;
  matchReasons: string[];
  riskFlags: string[];
}

/**
 * Search Strategy — AI-powered поиск с intent parsing и scoring.
 * 
 * Pipeline:
 * 1. Parse intent (NLP-lite rules)
 * 2. Score each listing against intent
 * 3. Rerank by quality/demand
 * 4. Generate explanations
 */
@Injectable()
export class SearchStrategy {
  
  /**
   * Parse natural language query into structured intent
   */
  parseIntent(query: string, context?: { city?: string }): SearchIntent {
    const q = query.toLowerCase();
    const intent: SearchIntent = {
      keywords: [],
    };

    // City from context or query
    if (context?.city) {
      intent.city = context.city;
    }

    // Price extraction
    const priceMatch = q.match(/до\s*(\d+(?:[.,]\d+)?)\s*(k|к|тыс)?/i);
    if (priceMatch) {
      let price = parseFloat((priceMatch[1] ?? "0").replace(',', '.'));
      if (priceMatch[2]) price *= 1000;
      intent.maxPrice = price;
    }

    const minPriceMatch = q.match(/от\s*(\d+(?:[.,]\d+)?)\s*(k|к|тыс)?/i);
    if (minPriceMatch) {
      let price = parseFloat((minPriceMatch[1] ?? "0").replace(',', '.'));
      if (minPriceMatch[2]) price *= 1000;
      intent.minPrice = price;
    }

    // Preference signals
    if (/(тихо|тишина|спокойн|quiet)/i.test(q)) {
      intent.wantsQuiet = true;
      intent.keywords.push('тихо');
    }

    if (/(метро|metro|подземк)/i.test(q)) {
      intent.wantsMetro = true;
      intent.keywords.push('метро');
    }

    if (/(парковк|parking|машин|авто)/i.test(q)) {
      intent.wantsParking = true;
      intent.keywords.push('парковка');
    }

    if (/(питом|животн|собак|кошк|pet)/i.test(q)) {
      intent.wantsPets = true;
      intent.keywords.push('животные');
    }

    // Guests count
    const guestsMatch = q.match(/(\d+)\s*(чел|гост|person|guest)/i);
    if (guestsMatch?.[1]) {
      intent.guestsCount = parseInt(guestsMatch[1], 10);
    }

    // Extract remaining keywords
    const words = q.split(/\s+/).filter(w => w.length > 2);
    const stopWords = ['для', 'рядом', 'около', 'квартир', 'комнат', 'снять', 'аренд'];
    for (const word of words) {
      if (!stopWords.some(sw => word.includes(sw)) && !intent.keywords.includes(word)) {
        intent.keywords.push(word);
      }
    }

    return intent;
  }

  /**
   * Score a listing against search intent
   */
  scoreListing(listing: SearchScoringContext, intent: SearchIntent): ScoredListing {
    let score = 50; // Base score
    const matchReasons: string[] = [];
    const riskFlags: string[] = [];

    // City match
    if (intent.city && listing.city.toLowerCase() === intent.city.toLowerCase()) {
      score += 15;
      matchReasons.push(`Город: ${listing.city}`);
    }

    // Price match
    if (intent.maxPrice && listing.basePrice <= intent.maxPrice) {
      score += 10;
      matchReasons.push(`Цена в бюджете (до ${intent.maxPrice} ₽)`);
    } else if (intent.maxPrice && listing.basePrice > intent.maxPrice) {
      score -= 20;
      riskFlags.push('Цена выше указанного бюджета');
    }

    // Quality bonus
    score += (listing.qualityScore - 50) / 5; // -10 to +10

    // Demand bonus (popular = relevant)
    score += (listing.demandScore - 50) / 10; // -5 to +5

    // Risk penalty
    if (listing.riskScore >= 60) {
      score -= 15;
      riskFlags.push('Высокий уровень риска');
    } else if (listing.riskScore >= 35) {
      score -= 5;
      riskFlags.push('Средний уровень риска');
    }

    // Preference matching
    const text = `${listing.title} ${listing.description}`.toLowerCase();
    const amenitiesText = listing.amenities.join(' ').toLowerCase();

    if (intent.wantsQuiet) {
      if (/(тихо|тишина|спокойн)/i.test(text)) {
        score += 10;
        matchReasons.push('Тихий район');
      } else {
        riskFlags.push('Нет информации о тишине');
      }
    }

    if (intent.wantsMetro) {
      if (/(метро)/i.test(text)) {
        score += 12;
        matchReasons.push('Рядом с метро');
      } else {
        riskFlags.push('Нет информации о метро');
      }
    }

    if (intent.wantsParking) {
      if (/(парков|parking)/i.test(text) || amenitiesText.includes('parking')) {
        score += 8;
        matchReasons.push('Есть парковка');
      }
    }

    if (intent.wantsPets) {
      if (/(питом|животн|pet)/i.test(text)) {
        score += 8;
        matchReasons.push('Можно с животными');
      }
    }

    // Keyword matching
    for (const kw of intent.keywords.slice(0, 5)) {
      if (text.includes(kw)) {
        score += 3;
      }
    }

    return {
      listingId: listing.listingId,
      relevanceScore: Math.max(0, Math.min(100, Math.round(score))),
      matchReasons,
      riskFlags,
    };
  }

  /**
   * Generate search explanation
   */
  generateExplanation(intent: SearchIntent, resultsCount: number): {
    text: string;
    bullets: string[];
  } {
    const bullets: string[] = [];

    if (intent.city) bullets.push(`Город: ${intent.city}`);
    if (intent.maxPrice) bullets.push(`Бюджет: до ${intent.maxPrice} ₽/ночь`);
    if (intent.wantsQuiet) bullets.push('Приоритет: тишина');
    if (intent.wantsMetro) bullets.push('Приоритет: рядом с метро');
    if (intent.wantsParking) bullets.push('Нужна парковка');
    if (intent.wantsPets) bullets.push('С животными');

    const text = resultsCount > 0
      ? `Найдено ${resultsCount} вариантов по вашим критериям. Результаты отсортированы по релевантности с учётом качества и рисков.`
      : 'По вашему запросу ничего не найдено. Попробуйте изменить критерии поиска.';

    return { text, bullets };
  }
}
