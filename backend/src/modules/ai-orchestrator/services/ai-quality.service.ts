import { Injectable, NotFoundException } from "@nestjs/common";
import { AiExplanationType, ListingStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AiPropertyRequestDto } from "../dto/ai-property.dto";

@Injectable()
export class AiQualityService {
  constructor(private readonly prisma: PrismaService) {}

  private scoreDescription(description: string): { score: number; hints: string[] } {
    const hints: string[] = [];
    const len = description.trim().length;
    let score = 0;

    if (len >= 220) score += 35;
    else if (len >= 120) score += 25;
    else if (len >= 60) score += 15;
    else {
      score += 5;
      hints.push("Сделайте описание подробнее (плюсы района, транспорт, условия, что включено).");
    }

    if (/(метро|пешком|минут)/i.test(description)) score += 10;
    else hints.push("Добавьте транспортную доступность (время до метро/остановки).");

    if (/(тихо|тишина|спокойн|двор)/i.test(description)) score += 10;
    else hints.push("Уточните уровень шума (окна во двор/шумоизоляция).");

    if (/(интернет|wi-?fi|рабоч)/i.test(description)) score += 5;
    if (/(правила|курени|животн|вечерин)/i.test(description)) score += 5;

    return { score, hints };
  }

  async quality(dto: AiPropertyRequestDto) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: dto.listingId },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    let score = 0;
    const suggestions: string[] = [];

    // Basic completeness
    score += 20;
    if (!listing.addressLine) suggestions.push("Укажите адрес/ориентир (без раскрытия точного номера дома до брони).");
    if (listing.lat == null || listing.lng == null) suggestions.push("Добавьте координаты для карты и поиска по району.");

    // Price sanity
    if (listing.basePrice > 0) score += 10;
    else suggestions.push("Цена должна быть > 0.");

    // Description quality
    const desc = this.scoreDescription(listing.description);
    score += desc.score;
    suggestions.push(...desc.hints);

    // Clamp
    const qualityScore = Math.max(0, Math.min(100, Math.round(score)));

    const explanationText =
      "Quality Score отражает полноту и ясность объявления (что важно гостю до бронирования).";
    const bullets = [
      `Описание: +${desc.score}`,
      listing.lat != null && listing.lng != null ? "Есть координаты" : "Нет координат",
    ];

    const explanation = await this.prisma.aiExplanation.create({
      data: {
        type: AiExplanationType.QUALITY_EXPLANATION,
        text: explanationText,
        bullets,
        meta: { suggestions },
      },
    });

    await this.prisma.aiListingScore.upsert({
      where: { listingId: listing.id },
      update: { qualityScore, explanationId: explanation.id },
      create: { listingId: listing.id, qualityScore, explanationId: explanation.id },
    });

    return {
      listingId: listing.id,
      qualityScore,
      suggestions: Array.from(new Set(suggestions)).slice(0, 8),
      explanation: {
        text: explanationText,
        bullets,
      },
    };
  }
}

