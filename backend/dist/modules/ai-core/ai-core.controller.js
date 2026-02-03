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
exports.AiCoreController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const insight_engine_1 = require("./engines/insight.engine");
const market_engine_1 = require("./engines/market.engine");
const recommendation_engine_1 = require("./engines/recommendation.engine");
let AiCoreController = class AiCoreController {
    constructor(insight, market, recommendations) {
        this.insight = insight;
        this.market = market;
        this.recommendations = recommendations;
    }
    async getListingInsight(id) {
        return this.insight.getListingInsight(id);
    }
    async getOwnerInsight(id, req) {
        const userId = req.user.id;
        const userRoles = req.user.roles || [];
        if (userId !== id && !userRoles.includes('admin')) {
            return this.insight.getOwnerInsight(userId);
        }
        return this.insight.getOwnerInsight(id);
    }
    async getMyInsight(req) {
        return this.insight.getOwnerInsight(req.user.id);
    }
    async getMarketInsight(city) {
        return this.market.getMarketInsight(city);
    }
    async getRecommendations(city, maxPrice, guests, limit) {
        return this.recommendations.getRecommendedListings({
            city,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            guests: guests ? Number(guests) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
};
exports.AiCoreController = AiCoreController;
__decorate([
    (0, common_1.Get)('listings/:id/insight'),
    (0, swagger_1.ApiOperation)({ summary: 'AI-анализ объявления' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiCoreController.prototype, "getListingInsight", null);
__decorate([
    (0, common_1.Get)('owners/:id/insight'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'AI-анализ объявлений владельца' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID владельца' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiCoreController.prototype, "getOwnerInsight", null);
__decorate([
    (0, common_1.Get)('owner/insight'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'AI-анализ для текущего владельца' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiCoreController.prototype, "getMyInsight", null);
__decorate([
    (0, common_1.Get)('market/insight'),
    (0, swagger_1.ApiOperation)({ summary: 'AI-обзор рынка' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: 'Фильтр по городу' }),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiCoreController.prototype, "getMarketInsight", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Рекомендованные объявления' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'guests', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('maxPrice')),
    __param(2, (0, common_1.Query)('guests')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AiCoreController.prototype, "getRecommendations", null);
exports.AiCoreController = AiCoreController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [insight_engine_1.InsightEngine,
        market_engine_1.MarketEngine,
        recommendation_engine_1.RecommendationEngine])
], AiCoreController);
//# sourceMappingURL=ai-core.controller.js.map