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
exports.AssistantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const assistant_service_1 = require("./assistant.service");
let AssistantController = class AssistantController {
    constructor(assistant) {
        this.assistant = assistant;
    }
    async getListingAnalysis(id) {
        return this.assistant.analyzeListing(id);
    }
    async getListingRecommendations(id) {
        return this.assistant.suggestImprovements(id);
    }
    async getPriceAdvice(id) {
        return this.assistant.recommendPrice(id);
    }
    async getExplanation(id) {
        return this.assistant.explainListingScore(id);
    }
    async getLandlordInsights(id, req) {
        const userId = req.user.id;
        const userRoles = req.user.roles || [];
        if (userId !== id && !userRoles.includes('admin')) {
            return this.assistant.getLandlordInsights(userId);
        }
        return this.assistant.getLandlordInsights(id);
    }
    async getMyInsights(req) {
        return this.assistant.getLandlordInsights(req.user.id);
    }
    async getMarketOverview(city) {
        return this.assistant.getMarketOverview(city);
    }
};
exports.AssistantController = AssistantController;
__decorate([
    (0, common_1.Get)('listings/:id/analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить полный анализ объявления' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getListingAnalysis", null);
__decorate([
    (0, common_1.Get)('listings/:id/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить рекомендации по улучшению объявления' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getListingRecommendations", null);
__decorate([
    (0, common_1.Get)('listings/:id/price-advice'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить рекомендацию по цене' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getPriceAdvice", null);
__decorate([
    (0, common_1.Get)('listings/:id/explanation'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить объяснение оценки LOCUS' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getExplanation", null);
__decorate([
    (0, common_1.Get)('landlords/:id/insights'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить аналитику арендодателя' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID арендодателя' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getLandlordInsights", null);
__decorate([
    (0, common_1.Get)('landlord/insights'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить аналитику текущего арендодателя' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getMyInsights", null);
__decorate([
    (0, common_1.Get)('market/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить обзор рынка' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: 'Фильтр по городу' }),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getMarketOverview", null);
exports.AssistantController = AssistantController = __decorate([
    (0, swagger_1.ApiTags)('assistant'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [assistant_service_1.AssistantService])
], AssistantController);
//# sourceMappingURL=assistant.controller.js.map