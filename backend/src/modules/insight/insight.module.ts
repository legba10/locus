import { Module } from '@nestjs/common';
import { InsightController } from './insight.controller';
import { InsightService } from './insight.service';
import { QualityAnalyzer } from './analyzers/quality.analyzer';
import { PriceAdvisor } from './analyzers/price.advisor';
import { DemandAnalyzer } from './analyzers/demand.analyzer';
import { RiskAnalyzer } from './analyzers/risk.analyzer';
import { TipsGenerator } from './analyzers/tips.generator';

@Module({
  controllers: [InsightController],
  providers: [
    InsightService,
    QualityAnalyzer,
    PriceAdvisor,
    DemandAnalyzer,
    RiskAnalyzer,
    TipsGenerator,
  ],
  exports: [InsightService],
})
export class InsightModule {}
