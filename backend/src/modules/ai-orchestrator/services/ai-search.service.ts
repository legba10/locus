import { Injectable } from "@nestjs/common";
import { ListingStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AiSearchRequestDto } from "../dto/ai-search.dto";
import { parseIntent } from "./text-intent";

export type AiSearchResultItem = {
  listingId: string;
  title: string;
  city: string;
  basePrice: number;
  currency: string;
  score: number;
  reasons: string[];
  riskFlags: string[];
};

export type AiSearchResponse = {
  intent: ReturnType<typeof parseIntent>;
  results: AiSearchResultItem[];
  explanation: { text: string; bullets: string[] };
  alternatives: Array<{ query: string; reason: string }>;
  risks: Array<{ listingId: string; flag: string }>;
};

@Injectable()
export class AiSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: AiSearchRequestDto): Promise<AiSearchResponse> {
    const intent = parseIntent(dto.query, { city: dto.context?.city });
    const q = dto.query.toLowerCase();

    const listings = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.PUBLISHED,
        ...(intent.city ? { city: intent.city } : {}),
        ...(intent.maxMonthlyPrice ? { basePrice: { lte: intent.maxMonthlyPrice } } : {}),
      },
      take: 50,
      orderBy: { updatedAt: "desc" },
      include: {
        aiScores: true,
        metricAggs: true,
      },
    });

    const getMetric = (agg: { metricKey: string; avgValue: number }[] | undefined, key: string): number | null => {
      const row = agg?.find((a) => a.metricKey === key);
      return row ? Math.round(row.avgValue) : null;
    };

    const scored: AiSearchResultItem[] = listings.map((p) => {
      let score = 0;
      const reasons: string[] = [];
      const riskFlags: string[] = [];

      const noiseScore = getMetric(p.metricAggs, "noise");
      const cleanScore = getMetric(p.metricAggs, "cleanliness");
      const ownerScore = getMetric(p.metricAggs, "communication") ?? getMetric(p.metricAggs, "owner");
      const valueScore = getMetric(p.metricAggs, "value");
      const locationScore = getMetric(p.metricAggs, "location");

      // Budget fit
      if (intent.maxMonthlyPrice) {
        const diff = intent.maxMonthlyPrice - p.basePrice;
        score += Math.max(-20, Math.min(20, diff / 1000));
        reasons.push(`Вписывается в бюджет до ${intent.maxMonthlyPrice} ₽/мес`);
      }

      // Quietness — приоритет: noise_score из отзывов, иначе описание (ТЗ-6)
      if (intent.wantsQuiet) {
        if (noiseScore != null) {
          score += (noiseScore - 50) / 2.5;
          if (noiseScore >= 70) reasons.push("Гости отмечают тишину");
          else if (noiseScore < 50) riskFlags.push("В отзывах жалуются на шум");
        } else {
          const quietKeywords = ["тихо", "тихий", "спокойн", "уютн"];
          const desc = `${p.title} ${p.description}`.toLowerCase();
          const hasQuietSignal = quietKeywords.some((kw) => desc.includes(kw));
          const quietScore = hasQuietSignal ? 70 : 40;
          score += (quietScore - 50) / 2;
          if (hasQuietSignal) reasons.push("Тихий вариант (по описанию)");
          else riskFlags.push("Может быть шумно для вашего запроса");
        }
      }

      // Чистота и хозяева — бонус по отзывам для ранжирования
      if (cleanScore != null && cleanScore >= 80) score += 5;
      if (ownerScore != null && ownerScore >= 80) score += 5;
      if (valueScore != null && valueScore >= 75) score += 3;
      if (locationScore != null && locationScore >= 80) reasons.push("Гости хвалят район");

      // Metro (proxy: presence of keyword in title/description)
      if (intent.wantsMetro) {
        const hasMetro = `${p.title} ${p.description}`.toLowerCase().includes("метро");
        score += hasMetro ? 18 : -8;
        if (hasMetro) reasons.push("Есть упоминание близости к метро");
        else riskFlags.push("Нет явного сигнала близости к метро");
      }

      // Keyword overlap boost
      const keywords = ["тихо", "метро", "парк", "центр", "студ", "спальн"];
      for (const kw of keywords) {
        if (q.includes(kw) && `${p.title} ${p.description}`.toLowerCase().includes(kw)) score += 3;
      }

      return {
        listingId: p.id,
        title: p.title,
        city: p.city,
        basePrice: p.basePrice,
        currency: p.currency,
        score,
        reasons,
        riskFlags,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, 5);

    const bullets: string[] = [];
    if (intent.city) bullets.push(`Город: ${intent.city}`);
    if (intent.maxMonthlyPrice) bullets.push(`Бюджет: до ${intent.maxMonthlyPrice} ₽/мес`);
    if (intent.wantsQuiet) bullets.push("Приоритет: тишина");
    if (intent.wantsMetro) bullets.push("Приоритет: рядом с метро");

    const alternatives: Array<{ query: string; reason: string }> = [];
    if (intent.wantsMetro && results.every((r) => r.riskFlags.includes("Нет явного сигнала близости к метро"))) {
      alternatives.push({
        query: `${dto.query} (расширить радиус от метро)`,
        reason: "В данных объявлениях нет явного сигнала про метро — можно расширить критерий.",
      });
    }
    if (intent.maxMonthlyPrice && results.length === 0) {
      alternatives.push({
        query: dto.query.replace(/до\s+\d+(?:[.,]\d+)?\s*(k|к)?/i, "до 60k"),
        reason: "По заданному бюджету нет вариантов — попробуйте увеличить потолок.",
      });
    }

    const risks = results
      .flatMap((r) => r.riskFlags.map((f) => ({ listingId: r.listingId, flag: f })))
      .slice(0, 10);

    return {
      intent,
      results,
      explanation: {
        text: "Я интерпретировал запрос как набор ограничений и приоритетов, затем ранжировал варианты по соответствию.",
        bullets,
      },
      alternatives,
      risks,
    };
  }
}

