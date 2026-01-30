import { Module } from '@nestjs/common';
import { HostController } from './host.controller';
import { HostService } from './host.service';
import { ProductIntelligenceModule } from '../ai/product-intelligence/product-intelligence.module';

@Module({
  imports: [ProductIntelligenceModule],
  controllers: [HostController],
  providers: [HostService],
  exports: [HostService],
})
export class HostModule {}
