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
exports.InsightsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const insights_service_1 = require("./insights.service");
let InsightsController = class InsightsController {
    constructor(insightsService) {
        this.insightsService = insightsService;
    }
    async getInsight(id) {
        return this.insightsService.getInsight(id);
    }
    async recalculateInsight(id) {
        return this.insightsService.recalculateInsight(id);
    }
};
exports.InsightsController = InsightsController;
__decorate([
    (0, common_1.Get)('listings/:id/insight'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить AI-анализ объявления' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InsightsController.prototype, "getInsight", null);
__decorate([
    (0, common_1.Post)('listings/:id/insight/recalculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Пересчитать AI-анализ объявления' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InsightsController.prototype, "recalculateInsight", null);
exports.InsightsController = InsightsController = __decorate([
    (0, swagger_1.ApiTags)('insights'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [insights_service_1.InsightsService])
], InsightsController);
//# sourceMappingURL=insights.controller.js.map