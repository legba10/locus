"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBrainModule = void 0;
const common_1 = require("@nestjs/common");
const ai_brain_service_1 = require("./ai-brain.service");
const quality_strategy_1 = require("./strategies/quality.strategy");
const pricing_strategy_1 = require("./strategies/pricing.strategy");
const risk_strategy_1 = require("./strategies/risk.strategy");
const demand_strategy_1 = require("./strategies/demand.strategy");
const search_strategy_1 = require("./strategies/search.strategy");
const explanation_generator_1 = require("./explainers/explanation.generator");
let AiBrainModule = class AiBrainModule {
};
exports.AiBrainModule = AiBrainModule;
exports.AiBrainModule = AiBrainModule = __decorate([
    (0, common_1.Module)({
        providers: [
            ai_brain_service_1.AiBrainService,
            quality_strategy_1.QualityStrategy,
            pricing_strategy_1.PricingStrategy,
            risk_strategy_1.RiskStrategy,
            demand_strategy_1.DemandStrategy,
            search_strategy_1.SearchStrategy,
            explanation_generator_1.ExplanationGenerator,
        ],
        exports: [
            ai_brain_service_1.AiBrainService,
            quality_strategy_1.QualityStrategy,
            pricing_strategy_1.PricingStrategy,
            risk_strategy_1.RiskStrategy,
            demand_strategy_1.DemandStrategy,
            search_strategy_1.SearchStrategy,
            explanation_generator_1.ExplanationGenerator,
        ],
    })
], AiBrainModule);
//# sourceMappingURL=ai-brain.module.js.map