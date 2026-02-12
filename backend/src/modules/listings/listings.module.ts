import { Module } from "@nestjs/common";
import { AiOrchestratorModule } from "../ai-orchestrator/ai-orchestrator.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ReviewsModule } from "../reviews/reviews.module";
import { UsersModule } from "../users/users.module";
import { ListingsController } from "./listings.controller";
import { ListingsPhotosService } from "./listings-photos.service";
import { ListingsService } from "./listings.service";

@Module({
  imports: [AiOrchestratorModule, AuthModule, UsersModule, NotificationsModule, ReviewsModule],
  controllers: [ListingsController],
  providers: [ListingsService, ListingsPhotosService],
  exports: [ListingsService, ListingsPhotosService],
})
export class ListingsModule {}
