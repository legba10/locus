"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightModule = void 0;
const common_1 = require("@nestjs/common");
const insight_controller_1 = require("./insight.controller");
const insight_service_1 = require("./insight.service");
const quality_analyzer_1 = require("./analyzers/quality.analyzer");
const price_advisor_1 = require("./analyzers/price.advisor");
const demand_analyzer_1 = require("./analyzers/demand.analyzer");
const risk_analyzer_1 = require("./analyzers/risk.analyzer");
const tips_generator_1 = require("./analyzers/tips.generator");
let InsightModule = class InsightModule {
};
exports.InsightModule = InsightModule;
exports.InsightModule = InsightModule = __decorate([
    (0, common_1.Module)({
        controllers: [insight_controller_1.InsightController],
        providers: [
            insight_service_1.InsightService,
            quality_analyzer_1.QualityAnalyzer,
            price_advisor_1.PriceAdvisor,
            demand_analyzer_1.DemandAnalyzer,
            risk_analyzer_1.RiskAnalyzer,
            tips_generator_1.TipsGenerator,
        ],
        exports: [insight_service_1.InsightService],
    })
], InsightModule);
//# sourceMappingURL=insight.module.js.map