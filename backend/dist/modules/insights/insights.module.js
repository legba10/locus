"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightsModule = void 0;
const common_1 = require("@nestjs/common");
const insights_controller_1 = require("./insights.controller");
const insights_service_1 = require("./insights.service");
const score_engine_1 = require("./engines/score.engine");
const price_engine_1 = require("./engines/price.engine");
const explanation_engine_1 = require("./engines/explanation.engine");
const recommendation_engine_1 = require("./engines/recommendation.engine");
let InsightsModule = class InsightsModule {
};
exports.InsightsModule = InsightsModule;
exports.InsightsModule = InsightsModule = __decorate([
    (0, common_1.Module)({
        controllers: [insights_controller_1.InsightsController],
        providers: [
            insights_service_1.InsightsService,
            score_engine_1.ScoreEngine,
            price_engine_1.PriceEngine,
            explanation_engine_1.ExplanationEngine,
            recommendation_engine_1.RecommendationEngine,
        ],
        exports: [insights_service_1.InsightsService],
    })
], InsightsModule);
