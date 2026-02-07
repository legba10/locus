import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AiOrchestratorService } from "./ai-orchestrator.service";
import { AiAssistantRequestDto } from "./dto/ai-assistant.dto";
import { AiPropertyRequestDto } from "./dto/ai-property.dto";
import { AiSearchRequestDto } from "./dto/ai-search.dto";
import { AiReviewSummaryDto } from "./dto/ai-review-summary.dto";

@ApiTags("ai")
@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiOrchestratorService) {}

  @Post("search")
  async search(@Body() dto: AiSearchRequestDto) {
    return this.ai.search(dto);
  }

  @Post("quality")
  async quality(@Body() dto: AiPropertyRequestDto) {
    return this.ai.quality(dto);
  }

  @Post("pricing")
  async pricing(@Body() dto: AiPropertyRequestDto) {
    return this.ai.pricing(dto);
  }

  @Post("risk")
  async risk(@Body() dto: AiPropertyRequestDto) {
    return this.ai.risk(dto);
  }

  @Post("recommendations")
  async recommendations(@Body() dto: AiPropertyRequestDto) {
    return this.ai.recommendations(dto);
  }

  @Post("assistant")
  async assistant(@Body() dto: AiAssistantRequestDto) {
    return this.ai.assistant(dto);
  }

  @Post("review-summary")
  async reviewSummary(@Body() dto: AiReviewSummaryDto) {
    // Deterministic "AI-style" summary (fast, no external dependency).
    // Can be replaced by real LLM later without changing the contract.
    const metrics = (dto.metrics ?? []).slice().sort((a, b) => b.avgValue - a.avgValue);
    const top = metrics.slice(0, 3);
    const bottom = metrics.slice(-2).reverse();

    const score =
      metrics.length === 0
        ? null
        : Math.round(metrics.reduce((sum, m) => sum + m.avgValue, 0) / metrics.length);

    const pos = top.map((m) => `${m.metricKey} (${Math.round(m.avgValue)})`).join(", ");
    const neg = bottom.map((m) => `${m.metricKey} (${Math.round(m.avgValue)})`).join(", ");

    const textHints = (dto.texts ?? [])
      .filter(Boolean)
      .slice(0, 8)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const hasTexts = textHints.length > 0;
    const firstText = hasTexts ? textHints[0] : null;
    const summary =
      `Сводка по отзывам: ${score != null ? `общая оценка метрик ~${score}/100. ` : ""}` +
      (top.length ? `Сильные стороны: ${pos}. ` : "") +
      (bottom.length ? `Зоны улучшения: ${neg}. ` : "") +
      (firstText ? `По комментариям гостей: «${firstText.slice(0, 140)}${firstText.length > 140 ? "…" : ""}».` : "");

    return { ok: true, summary, score };
  }
}

