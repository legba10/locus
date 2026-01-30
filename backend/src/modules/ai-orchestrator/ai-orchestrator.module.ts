import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiOrchestratorService } from "./ai-orchestrator.service";
import { AiSearchService } from "./services/ai-search.service";
import { AiQualityService } from "./services/ai-quality.service";
import { AiPricingService } from "./services/ai-pricing.service";
import { AiRiskService } from "./services/ai-risk.service";
import { AiAssistantService } from "./services/ai-assistant.service";

@Module({
  controllers: [AiController],
  providers: [
    AiOrchestratorService,
    AiSearchService,
    AiQualityService,
    AiPricingService,
    AiRiskService,
    AiAssistantService,
  ],
  exports: [
    AiOrchestratorService,
    AiSearchService,
    AiQualityService,
    AiPricingService,
    AiRiskService,
    AiAssistantService,
  ],
})
export class AiOrchestratorModule {}

