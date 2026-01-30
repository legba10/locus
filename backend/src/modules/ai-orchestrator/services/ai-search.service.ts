import { Injectable } from "@nestjs/common";
import { ListingStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AiSearchRequestDto } from "../dto/ai-search.dto";
import { parseIntent } from "./text-intent";

type SearchResultItem = {
  listingId: string;
  title: string;
  city: string;
  basePrice: number;
  currency: string;
  score: number;
  reasons: string[];
  riskFlags: string[];
};

@Injectable()
export class AiSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: AiSearchRequestDto) {
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
      },
    });

    const scored: SearchResultItem[] = listings.map((p) => {
      let score = 0;
      const reasons: string[] = [];
      const riskFlags: string[] = [];

      // Budget fit
      if (intent.maxMonthlyPrice) {
        const diff = intent.maxMonthlyPrice - p.basePrice;
        // closer to upper bound is ok, but under budget is better
        score += Math.max(-20, Math.min(20, diff / 1000));
        reasons.push(`Вписывается в бюджет до ${intent.maxMonthlyPrice} ₽/мес`);
      }

      // Quietness - use qualityScore as proxy for quietness (MVP simplification)
      // In production, we'd have a dedicated noiseLevel signal
      if (intent.wantsQuiet) {
        // Use text analysis: check if description mentions "тихо", "спокойн", etc.
        const quietKeywords = ["тихо", "тихий", "спокойн", "уютн"];
        const desc = `${p.title} ${p.description}`.toLowerCase();
        const hasQuietSignal = quietKeywords.some((kw) => desc.includes(kw));
        const quietScore = hasQuietSignal ? 70 : 40;
        score += (quietScore - 50) / 2; // -5..+10 roughly
        if (hasQuietSignal) reasons.push("Тихий вариант (по описанию)");
        else riskFlags.push("Может быть шумно для вашего запроса");
      }

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

