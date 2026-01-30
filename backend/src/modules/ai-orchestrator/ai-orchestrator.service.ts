import { Injectable } from "@nestjs/common";
import { AiEventType, AiExplanationType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiAssistantRequestDto } from "./dto/ai-assistant.dto";
import { AiPropertyRequestDto } from "./dto/ai-property.dto";
import { AiSearchRequestDto } from "./dto/ai-search.dto";
import { AiAssistantService } from "./services/ai-assistant.service";
import { AiPricingService } from "./services/ai-pricing.service";
import { AiQualityService } from "./services/ai-quality.service";
import { AiRiskService } from "./services/ai-risk.service";
import { AiSearchService } from "./services/ai-search.service";

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchSvc: AiSearchService,
    private readonly qualitySvc: AiQualityService,
    private readonly pricingSvc: AiPricingService,
    private readonly riskSvc: AiRiskService,
    private readonly assistantSvc: AiAssistantService,
  ) {}

  private toJson(value: unknown): Prisma.InputJsonValue {
    // Ensure DTO instances / Dates / unknown objects become JSON-safe plain values.
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  async search(dto: AiSearchRequestDto) {
    const result = await this.searchSvc.search(dto);
    await this.prisma.aiEvent.create({
      data: {
        type: AiEventType.AI_SEARCH,
        userId: dto.context?.userId,
        payload: this.toJson({
          query: dto.query,
          context: dto.context ? { userId: dto.context.userId, city: dto.context.city } : null,
          resultsCount: result.results.length,
          explanation: result.explanation,
        }),
      },
    });
    return result;
  }

  async quality(dto: AiPropertyRequestDto) {
    const result = await this.qualitySvc.quality(dto);
    await this.prisma.aiEvent.create({
      data: {
        type: AiEventType.AI_QUALITY,
        listingId: dto.listingId,
        payload: this.toJson(result),
      },
    });
    return result;
  }

  async pricing(dto: AiPropertyRequestDto) {
    const result = await this.pricingSvc.pricing(dto);
    await this.prisma.aiEvent.create({
      data: {
        type: AiEventType.AI_PRICING,
        listingId: dto.listingId,
        payload: this.toJson(result),
      },
    });
    return result;
  }

  async risk(dto: AiPropertyRequestDto) {
    const result = await this.riskSvc.risk(dto);
    await this.prisma.aiEvent.create({
      data: {
        type: AiEventType.AI_RISK,
        listingId: dto.listingId,
        payload: this.toJson(result),
      },
    });
    return result;
  }

  async recommendations(dto: AiPropertyRequestDto) {
    // MVP: re-use quality+pricing+risk signals as "next actions"
    const [quality, pricing, risk] = await Promise.all([
      this.qualitySvc.quality(dto),
      this.pricingSvc.pricing(dto),
      this.riskSvc.risk(dto),
    ]);

    const actions: Array<{
      key: string;
      title: string;
      impact: "low" | "medium" | "high";
      explanation: { type: AiExplanationType; text: string; bullets: string[] };
    }> = [];

    if (quality.qualityScore !== null && quality.qualityScore < 80) {
      actions.push({
        key: "improve_listing_quality",
        title: "Улучшить качество объявления",
        impact: "high",
        explanation: {
          type: AiExplanationType.QUALITY_EXPLANATION,
          text: "Качество объявления напрямую влияет на конверсию в бронь.",
          bullets: quality.suggestions,
        },
      });
    }

    if (pricing.deltaPct !== null && Math.abs(pricing.deltaPct) >= 5) {
      actions.push({
        key: "adjust_price",
        title: "Оптимизировать цену",
        impact: "high",
        explanation: {
          type: AiExplanationType.PRICING_EXPLANATION,
          text: "Цена — ключевой фактор спроса и конверсии.",
          bullets: [
            `Текущая цена: ${pricing.currentPrice} ${pricing.currency}/мес`,
            `Рекомендация: ${pricing.recommendedPrice} ${pricing.currency}/мес`,
            ...(pricing.rationale ?? []),
          ],
        },
      });
    }

    if (risk.riskLevel !== "low") {
      actions.push({
        key: "reduce_risk",
        title: "Снизить риск",
        impact: "medium",
        explanation: {
          type: AiExplanationType.RISK_EXPLANATION,
          text: "Чем выше риск, тем чаще отмены/проблемы и тем ниже доверие.",
          bullets: risk.reasons,
        },
      });
    }

    const result = {
      listingId: dto.listingId,
      actions,
      signals: {
        quality,
        pricing,
        risk,
      },
    };

    await this.prisma.aiEvent.create({
      data: {
        type: AiEventType.AI_RECOMMENDATIONS,
        listingId: dto.listingId,
        payload: this.toJson(result),
      },
    });

    return result;
  }

  async assistant(dto: AiAssistantRequestDto) {
    const result = await this.assistantSvc.reply(dto);
    await this.prisma.aiEvent.create({
      data: {
        type: AiEventType.AI_ASSISTANT,
        userId: dto.context?.userId,
        payload: this.toJson({
          role: dto.role,
          message: dto.message,
          context: dto.context ? { userId: dto.context.userId, city: dto.context.city } : null,
          extra: dto.extra ?? null,
          result,
        }),
      },
    });
    return result;
  }
}

