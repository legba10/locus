import { Module } from '@nestjs/common';
import { ProductIntelligenceService } from './product-intelligence.service';
import { AiBrainModule } from '../ai-brain/ai-brain.module';

@Module({
  imports: [AiBrainModule],
  providers: [ProductIntelligenceService],
  exports: [ProductIntelligenceService],
})
export class ProductIntelligenceModule {}
