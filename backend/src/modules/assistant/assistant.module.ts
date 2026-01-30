import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AnalysisService } from './services/analysis.service';
import { PriceAdvisorService } from './services/price-advisor.service';
import { ImprovementService } from './services/improvement.service';

@Module({
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AnalysisService,
    PriceAdvisorService,
    ImprovementService,
  ],
  exports: [AssistantService, AnalysisService],
})
export class AssistantModule {}
