"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductIntelligenceModule = void 0;
const common_1 = require("@nestjs/common");
const product_intelligence_service_1 = require("./product-intelligence.service");
const ai_brain_module_1 = require("../ai-brain/ai-brain.module");
let ProductIntelligenceModule = class ProductIntelligenceModule {
};
exports.ProductIntelligenceModule = ProductIntelligenceModule;
exports.ProductIntelligenceModule = ProductIntelligenceModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_brain_module_1.AiBrainModule],
        providers: [product_intelligence_service_1.ProductIntelligenceService],
        exports: [product_intelligence_service_1.ProductIntelligenceService],
    })
], ProductIntelligenceModule);
//# sourceMappingURL=product-intelligence.module.js.map