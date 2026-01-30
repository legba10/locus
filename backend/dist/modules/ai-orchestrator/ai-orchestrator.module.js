"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiOrchestratorModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./ai.controller");
const ai_orchestrator_service_1 = require("./ai-orchestrator.service");
const ai_search_service_1 = require("./services/ai-search.service");
const ai_quality_service_1 = require("./services/ai-quality.service");
const ai_pricing_service_1 = require("./services/ai-pricing.service");
const ai_risk_service_1 = require("./services/ai-risk.service");
const ai_assistant_service_1 = require("./services/ai-assistant.service");
let AiOrchestratorModule = class AiOrchestratorModule {
};
exports.AiOrchestratorModule = AiOrchestratorModule;
exports.AiOrchestratorModule = AiOrchestratorModule = __decorate([
    (0, common_1.Module)({
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_orchestrator_service_1.AiOrchestratorService,
            ai_search_service_1.AiSearchService,
            ai_quality_service_1.AiQualityService,
            ai_pricing_service_1.AiPricingService,
            ai_risk_service_1.AiRiskService,
            ai_assistant_service_1.AiAssistantService,
        ],
        exports: [
            ai_orchestrator_service_1.AiOrchestratorService,
            ai_search_service_1.AiSearchService,
            ai_quality_service_1.AiQualityService,
            ai_pricing_service_1.AiPricingService,
            ai_risk_service_1.AiRiskService,
            ai_assistant_service_1.AiAssistantService,
        ],
    })
], AiOrchestratorModule);
