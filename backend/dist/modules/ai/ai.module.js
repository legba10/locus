"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_brain_module_1 = require("./ai-brain/ai-brain.module");
const product_intelligence_module_1 = require("./product-intelligence/product-intelligence.module");
const events_module_1 = require("./events/events.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ai_brain_module_1.AiBrainModule,
            product_intelligence_module_1.ProductIntelligenceModule,
            events_module_1.EventsModule,
        ],
        exports: [
            ai_brain_module_1.AiBrainModule,
            product_intelligence_module_1.ProductIntelligenceModule,
            events_module_1.EventsModule,
        ],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map