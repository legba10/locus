"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_orchestrator_service_1 = require("./ai-orchestrator.service");
const ai_assistant_dto_1 = require("./dto/ai-assistant.dto");
const ai_property_dto_1 = require("./dto/ai-property.dto");
const ai_search_dto_1 = require("./dto/ai-search.dto");
let AiController = class AiController {
    constructor(ai) {
        this.ai = ai;
    }
    async search(dto) {
        return this.ai.search(dto);
    }
    async quality(dto) {
        return this.ai.quality(dto);
    }
    async pricing(dto) {
        return this.ai.pricing(dto);
    }
    async risk(dto) {
        return this.ai.risk(dto);
    }
    async recommendations(dto) {
        return this.ai.recommendations(dto);
    }
    async assistant(dto) {
        return this.ai.assistant(dto);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)("search"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_search_dto_1.AiSearchRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "search", null);
__decorate([
    (0, common_1.Post)("quality"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_property_dto_1.AiPropertyRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "quality", null);
__decorate([
    (0, common_1.Post)("pricing"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_property_dto_1.AiPropertyRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "pricing", null);
__decorate([
    (0, common_1.Post)("risk"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_property_dto_1.AiPropertyRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "risk", null);
__decorate([
    (0, common_1.Post)("recommendations"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_property_dto_1.AiPropertyRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "recommendations", null);
__decorate([
    (0, common_1.Post)("assistant"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_assistant_dto_1.AiAssistantRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "assistant", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)("ai"),
    (0, common_1.Controller)("ai"),
    __metadata("design:paramtypes", [ai_orchestrator_service_1.AiOrchestratorService])
], AiController);
//# sourceMappingURL=ai.controller.js.map