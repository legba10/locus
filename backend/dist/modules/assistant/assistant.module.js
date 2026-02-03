"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantModule = void 0;
const common_1 = require("@nestjs/common");
const assistant_controller_1 = require("./assistant.controller");
const assistant_service_1 = require("./assistant.service");
const analysis_service_1 = require("./services/analysis.service");
const price_advisor_service_1 = require("./services/price-advisor.service");
const improvement_service_1 = require("./services/improvement.service");
let AssistantModule = class AssistantModule {
};
exports.AssistantModule = AssistantModule;
exports.AssistantModule = AssistantModule = __decorate([
    (0, common_1.Module)({
        controllers: [assistant_controller_1.AssistantController],
        providers: [
            assistant_service_1.AssistantService,
            analysis_service_1.AnalysisService,
            price_advisor_service_1.PriceAdvisorService,
            improvement_service_1.ImprovementService,
        ],
        exports: [assistant_service_1.AssistantService, analysis_service_1.AnalysisService],
    })
], AssistantModule);
//# sourceMappingURL=assistant.module.js.map