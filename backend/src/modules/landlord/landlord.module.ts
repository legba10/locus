import { Module } from '@nestjs/common';
import { LandlordController } from './landlord.controller';
import { LandlordService } from './landlord.service';
import { ProductIntelligenceModule } from '../ai/product-intelligence/product-intelligence.module';

@Module({
  imports: [ProductIntelligenceModule],
  controllers: [LandlordController],
  providers: [LandlordService],
  exports: [LandlordService],
})
export class LandlordModule {}
