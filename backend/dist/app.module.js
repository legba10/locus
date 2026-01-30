"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const health_module_1 = require("./modules/health/health.module");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const ai_orchestrator_module_1 = require("./modules/ai-orchestrator/ai-orchestrator.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const listings_module_1 = require("./modules/listings/listings.module");
const search_module_1 = require("./modules/search/search.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const availability_module_1 = require("./modules/availability/availability.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const system_module_1 = require("./modules/system/system.module");
const host_module_1 = require("./modules/host/host.module");
const landlord_module_1 = require("./modules/landlord/landlord.module");
const ai_module_1 = require("./modules/ai/ai.module");
const favorites_module_1 = require("./modules/favorites/favorites.module");
const assistant_module_1 = require("./modules/assistant/assistant.module");
const insight_module_1 = require("./modules/insight/insight.module");
const ai_core_module_1 = require("./modules/ai-core/ai-core.module");
const insights_module_1 = require("./modules/insights/insights.module");
const decision_module_1 = require("./modules/decision/decision.module");
const debug_module_1 = require("./debug/debug.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: ".",
                maxListeners: 20,
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            listings_module_1.ListingsModule,
            search_module_1.SearchModule,
            bookings_module_1.BookingsModule,
            availability_module_1.AvailabilityModule,
            analytics_module_1.AnalyticsModule,
            favorites_module_1.FavoritesModule,
            ai_core_module_1.AiCoreModule,
            decision_module_1.DecisionModule,
            insights_module_1.InsightsModule,
            insight_module_1.InsightModule,
            ai_module_1.AiModule,
            ai_orchestrator_module_1.AiOrchestratorModule,
            assistant_module_1.AssistantModule,
            landlord_module_1.LandlordModule,
            host_module_1.HostModule,
            system_module_1.SystemModule,
            debug_module_1.DebugModule,
        ],
    })
], AppModule);
