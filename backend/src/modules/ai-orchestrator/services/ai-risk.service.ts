import { Injectable, NotFoundException } from "@nestjs/common";
import { AiExplanationType, ListingStatus, UserStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AiPropertyRequestDto } from "../dto/ai-property.dto";

@Injectable()
export class AiRiskService {
  constructor(private readonly prisma: PrismaService) {}

  async risk(dto: AiPropertyRequestDto) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: dto.listingId },
      include: { owner: true },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    const reasons: string[] = [];
    let riskScore = 20;

    if (listing.owner.status !== UserStatus.ACTIVE) {
      riskScore += 50;
      reasons.push("Владелец не в статусе ACTIVE.");
    } else {
      reasons.push("Владелец в статусе ACTIVE.");
    }

    if (!listing.description || listing.description.trim().length < 60) {
      riskScore += 15;
      reasons.push("Короткое описание повышает риск недопонимания условий.");
    }

    if (listing.lat == null || listing.lng == null) {
      riskScore += 10;
      reasons.push("Нет координат — сложнее верифицировать локацию.");
    }

    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
    const riskLevel: "low" | "medium" | "high" =
      riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";

    const explanation = await this.prisma.aiExplanation.create({
      data: {
        type: AiExplanationType.RISK_EXPLANATION,
        text: "Risk Score — вероятность проблем (споры, отмены, жалобы). В MVP считаем по простым сигналам; позже подключим антифрод и поведенческие кластеры.",
        bullets: [`Risk Score: ${riskScore}/100`, `Risk Level: ${riskLevel}`],
        meta: { reasons },
      },
    });

    await this.prisma.aiListingScore.upsert({
      where: { listingId: listing.id },
      update: { riskScore, explanationId: explanation.id },
      create: { listingId: listing.id, riskScore, explanationId: explanation.id },
    });

    return {
      listingId: listing.id,
      riskScore,
      riskLevel,
      reasons,
      mitigations: [
        "Добавьте координаты и более детальное описание условий.",
        "Уточните шум/правила дома, чтобы снизить риск жалоб.",
      ],
      explanation: {
        text: "Я оценил риск по статусу владельца и полноте данных объявления.",
        bullets: [`Уровень риска: ${riskLevel}`, ...reasons.slice(0, 3)],
      },
    };
  }
}

