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
exports.HostController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const host_service_1 = require("./host.service");
let HostController = class HostController {
    constructor(hostService) {
        this.hostService = hostService;
    }
    async getIntelligence(req) {
        const userId = req.user.id;
        return this.hostService.getHostIntelligence(userId);
    }
    async recalculateIntelligence(req) {
        const userId = req.user.id;
        await this.hostService.recalculateAll(userId);
        return { success: true, message: 'Intelligence recalculated for all properties' };
    }
    async getOverview(req) {
        const userId = req.user.id;
        return this.hostService.getOverview(userId);
    }
};
exports.HostController = HostController;
__decorate([
    (0, common_1.Get)('intelligence'),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get host intelligence dashboard data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Host intelligence summary with property profiles and recommendations',
        schema: {
            type: 'object',
            properties: {
                summary: {
                    type: 'object',
                    properties: {
                        totalListings: { type: 'number' },
                        revenueForecast: { type: 'number' },
                        occupancyForecast: { type: 'number' },
                        riskLevel: { type: 'string' },
                        overallHealth: { type: 'string' },
                    },
                },
                properties: { type: 'array' },
                recommendations: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getIntelligence", null);
__decorate([
    (0, common_1.Post)('intelligence/recalculate'),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Recalculate AI profiles for all host properties' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recalculation completed' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "recalculateIntelligence", null);
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)('guest', 'host', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get host dashboard overview' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostController.prototype, "getOverview", null);
exports.HostController = HostController = __decorate([
    (0, swagger_1.ApiTags)('host'),
    (0, common_1.Controller)('host'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [host_service_1.HostService])
], HostController);
