import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AiOrchestratorModule } from "./modules/ai-orchestrator/ai-orchestrator.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ListingsModule } from "./modules/listings/listings.module";
import { SearchModule } from "./modules/search/search.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { AvailabilityModule } from "./modules/availability/availability.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { SystemModule } from "./modules/system/system.module";
import { HostModule } from "./modules/host/host.module";
import { LandlordModule } from "./modules/landlord/landlord.module";
import { AiModule } from "./modules/ai/ai.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { AssistantModule } from "./modules/assistant/assistant.module";
import { InsightModule } from "./modules/insight/insight.module";
import { AiCoreModule } from "./modules/ai-core/ai-core.module";
import { InsightsModule } from "./modules/insights/insights.module";
import { DecisionModule } from "./modules/decision/decision.module";
import { DebugModule } from "./debug/debug.module";

const isProduction = process.env.NODE_ENV === "production";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      maxListeners: 20,
    }),
    PrismaModule,
    HealthModule,
    // Core modules
    AuthModule,
    UsersModule,
    ListingsModule,
    SearchModule,
    BookingsModule,
    AvailabilityModule,
    AnalyticsModule,
    FavoritesModule,
    // AI Core — единый AI движок
    AiCoreModule,
    DecisionModule, // Decision Engine
    InsightsModule, // Legacy insights
    InsightModule, // Legacy compatibility
    // Legacy AI modules (для совместимости)
    AiModule,
    AiOrchestratorModule,
    AssistantModule,
    // Owner dashboards (landlord = новый, host = legacy)
    LandlordModule,
    HostModule,
    SystemModule,
    ...(isProduction ? [] : [DebugModule]),
  ],
})
export class AppModule {}

