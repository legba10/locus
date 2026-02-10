import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service.stub';
import { IntelligenceEventHandler } from './handlers/intelligence.handler';
import { ProductIntelligenceModule } from '../product-intelligence/product-intelligence.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    ProductIntelligenceModule,
  ],
  providers: [EventsService, IntelligenceEventHandler],
  exports: [EventsService],
})
export class EventsModule {}
