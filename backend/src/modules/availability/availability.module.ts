import { Module } from "@nestjs/common";
import { AiOrchestratorModule } from "../ai-orchestrator/ai-orchestrator.module";
import { AvailabilityController } from "./availability.controller";
import { AvailabilityService } from "./availability.service";

@Module({
  imports: [AiOrchestratorModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}

