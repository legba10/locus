import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { ScoreEngine } from './engines/score.engine';
import { PriceEngine } from './engines/price.engine';
import { ExplanationEngine } from './engines/explanation.engine';
import { RecommendationEngine } from './engines/recommendation.engine';

@Module({
  controllers: [InsightsController],
  providers: [
    InsightsService,
    ScoreEngine,
    PriceEngine,
    ExplanationEngine,
    RecommendationEngine,
  ],
  exports: [InsightsService],
})
export class InsightsModule {}
