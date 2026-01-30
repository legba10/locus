import { Module } from '@nestjs/common';
import { AiBrainModule } from './ai-brain/ai-brain.module';
import { ProductIntelligenceModule } from './product-intelligence/product-intelligence.module';
import { EventsModule } from './events/events.module';

/**
 * AI Module — центральный модуль AI-функциональности LOCUS.
 * 
 * Включает:
 * - AI Brain (decision engine со стратегиями)
 * - Product Intelligence (AI профили объявлений)
 * - Events (event-driven архитектура)
 */
@Module({
  imports: [
    AiBrainModule,
    ProductIntelligenceModule,
    EventsModule,
  ],
  exports: [
    AiBrainModule,
    ProductIntelligenceModule,
    EventsModule,
  ],
})
export class AiModule {}
