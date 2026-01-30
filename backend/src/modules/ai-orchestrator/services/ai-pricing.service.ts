import { Injectable, NotFoundException } from "@nestjs/common";
import { AiExplanationType, ListingStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AiPropertyRequestDto } from "../dto/ai-property.dto";

@Injectable()
export class AiPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async pricing(dto: AiPropertyRequestDto) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: dto.listingId },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    // MVP heuristic:
    // - quiet + metro tends to be more demanded
    // - too low price may reduce perceived quality; too high reduces conversion
    const text = `${listing.title} ${listing.description}`.toLowerCase();
    const hasMetro = text.includes("метро");
    const quiet = /(тихо|тишина|спокойн|двор)/i.test(text);

    let demandScore = 50;
    if (hasMetro) demandScore += 15;
    if (quiet) demandScore += 10;
    demandScore = Math.max(0, Math.min(100, demandScore));

    // Recommended price: +/- based on demand
    const current = listing.basePrice;
    const deltaPctRaw = (demandScore - 50) / 2; // -25..+25
    const deltaPct = Math.round(deltaPctRaw);
    const recommended = Math.max(1000, Math.round(current * (1 + deltaPct / 100)));

    const bookingProbability = Math.max(5, Math.min(95, Math.round(40 + (demandScore - 50) * 0.8)));

    const rationale: string[] = [];
    if (hasMetro) rationale.push("Близость к метро (сигнал из текста объявления) повышает спрос.");
    if (quiet) rationale.push("Сигнал тишины повышает привлекательность для длительной аренды.");
    if (!hasMetro) rationale.push("Нет явного сигнала про метро — спрос может быть ниже.");

    const explanation = await this.prisma.aiExplanation.create({
      data: {
        type: AiExplanationType.PRICING_EXPLANATION,
        text: "Рекомендация цены основана на эвристиках спроса (MVP). Далее подключим прогноз спроса (time-series) и сравнение по рынку.",
        bullets: [
          `Demand Score: ${demandScore}/100`,
          `Ожидаемая вероятность бронирования: ${bookingProbability}%`,
          `Рекомендованный сдвиг: ${deltaPct >= 0 ? "+" : ""}${deltaPct}%`,
        ],
        meta: { rationale },
      },
    });

    const priceScore = Math.max(0, Math.min(100, Math.round(50 + deltaPct)));
    await this.prisma.aiListingScore.upsert({
      where: { listingId: listing.id },
      update: { demandScore, priceScore, explanationId: explanation.id },
      create: { listingId: listing.id, demandScore, priceScore, explanationId: explanation.id },
    });

    return {
      listingId: listing.id,
      currency: listing.currency,
      currentPrice: current,
      recommendedPrice: recommended,
      deltaPct,
      bookingProbability,
      demandScore,
      rationale,
      explanation: {
        text: "Я оценил спрос по сигналам (метро/тишина) и предложил сдвиг цены.",
        bullets: [
          `Спрос: ${demandScore}/100`,
          `Рекоменд. цена: ${recommended} ${listing.currency}/ночь`,
        ],
      },
    };
  }
}

