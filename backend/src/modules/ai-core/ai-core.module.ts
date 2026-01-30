import { Module } from '@nestjs/common';
import { AiCoreController } from './ai-core.controller';
import { InsightEngine } from './engines/insight.engine';
import { RecommendationEngine } from './engines/recommendation.engine';
import { MarketEngine } from './engines/market.engine';
import { ExplanationEngine } from './engines/explanation.engine';

@Module({
  controllers: [AiCoreController],
  providers: [
    InsightEngine,
    RecommendationEngine,
    MarketEngine,
    ExplanationEngine,
  ],
  exports: [InsightEngine, RecommendationEngine, MarketEngine],
})
export class AiCoreModule {}
