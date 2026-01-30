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
exports.InsightController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const insight_service_1 = require("./insight.service");
let InsightController = class InsightController {
    constructor(insight) {
        this.insight = insight;
    }
    async getListingInsight(id) {
        return this.insight.getListingInsight(id);
    }
    async getOwnerDashboard(id, req) {
        const userId = req.user.id;
        const userRoles = req.user.roles || [];
        if (userId !== id && !userRoles.includes('admin')) {
            return this.insight.getOwnerDashboard(userId);
        }
        return this.insight.getOwnerDashboard(id);
    }
    async getMyDashboard(req) {
        return this.insight.getOwnerDashboard(req.user.id);
    }
    async getMarketOverview(city) {
        return this.insight.getMarketOverview(city);
    }
};
exports.InsightController = InsightController;
__decorate([
    (0, common_1.Get)('listings/:id/insight'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить AI-анализ объявления' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID объявления' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InsightController.prototype, "getListingInsight", null);
__decorate([
    (0, common_1.Get)('owners/:id/dashboard'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить данные кабинета владельца' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID владельца' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InsightController.prototype, "getOwnerDashboard", null);
__decorate([
    (0, common_1.Get)('owner/dashboard'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Кабинет владельца жилья (текущий пользователь)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InsightController.prototype, "getMyDashboard", null);
__decorate([
    (0, common_1.Get)('market/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Обзор рынка аренды' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: 'Фильтр по городу' }),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InsightController.prototype, "getMarketOverview", null);
exports.InsightController = InsightController = __decorate([
    (0, swagger_1.ApiTags)('insight'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [insight_service_1.InsightService])
], InsightController);
