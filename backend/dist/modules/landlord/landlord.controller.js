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
exports.LandlordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const landlord_service_1 = require("./landlord.service");
let LandlordController = class LandlordController {
    constructor(landlord) {
        this.landlord = landlord;
    }
    async getDashboard(req) {
        return this.landlord.getDashboard(req.user.id);
    }
    async refreshAnalytics(req) {
        await this.landlord.recalculateAnalytics(req.user.id);
        return { success: true, message: 'Аналитика обновлена' };
    }
    async getIntelligence(req) {
        return this.landlord.getDashboard(req.user.id);
    }
};
exports.LandlordController = LandlordController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить данные дашборда арендодателя' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Данные дашборда с аналитикой LOCUS',
        schema: {
            type: 'object',
            properties: {
                summary: {
                    type: 'object',
                    properties: {
                        totalListings: { type: 'number' },
                        publishedListings: { type: 'number' },
                        avgLocusRating: { type: 'number' },
                        revenue30d: { type: 'number' },
                        pendingBookings: { type: 'number' },
                        riskLevel: { type: 'string' },
                    },
                },
                properties: { type: 'array' },
                recommendations: { type: 'array', items: { type: 'string' } },
                recentBookings: { type: 'array' },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LandlordController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('dashboard/refresh'),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Пересчитать аналитику LOCUS для всех объектов' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Аналитика обновлена' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LandlordController.prototype, "refreshAnalytics", null);
__decorate([
    (0, common_1.Get)('intelligence'),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Алиас для dashboard (совместимость)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LandlordController.prototype, "getIntelligence", null);
exports.LandlordController = LandlordController = __decorate([
    (0, swagger_1.ApiTags)('landlord'),
    (0, common_1.Controller)('landlord'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [landlord_service_1.LandlordService])
], LandlordController);
