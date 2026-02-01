import { Module } from "@nestjs/common";
import { AiOrchestratorModule } from "../ai-orchestrator/ai-orchestrator.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";
import { ListingsPhotosService } from "./listings-photos.service";

@Module({
  imports: [AiOrchestratorModule, AuthModule, UsersModule],
  controllers: [ListingsController],
  providers: [ListingsService, ListingsPhotosService],
  exports: [ListingsService, ListingsPhotosService],
})
export class ListingsModule {}
