import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { DeployHealthController } from "./deploy-health.controller";

@Module({
  controllers: [HealthController, DeployHealthController],
})
export class HealthModule {}

