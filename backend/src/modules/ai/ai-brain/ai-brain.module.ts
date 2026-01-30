import { Module } from '@nestjs/common';
import { AiBrainService } from './ai-brain.service';
import { QualityStrategy } from './strategies/quality.strategy';
import { PricingStrategy } from './strategies/pricing.strategy';
import { RiskStrategy } from './strategies/risk.strategy';
import { DemandStrategy } from './strategies/demand.strategy';
import { SearchStrategy } from './strategies/search.strategy';
import { ExplanationGenerator } from './explainers/explanation.generator';

@Module({
  providers: [
    AiBrainService,
    QualityStrategy,
    PricingStrategy,
    RiskStrategy,
    DemandStrategy,
    SearchStrategy,
    ExplanationGenerator,
  ],
  exports: [
    AiBrainService,
    QualityStrategy,
    PricingStrategy,
    RiskStrategy,
    DemandStrategy,
    SearchStrategy,
    ExplanationGenerator,
  ],
})
export class AiBrainModule {}

