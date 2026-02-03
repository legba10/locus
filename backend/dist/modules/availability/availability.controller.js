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
exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const ai_pricing_service_1 = require("../ai-orchestrator/services/ai-pricing.service");
const availability_service_1 = require("./availability.service");
const update_availability_dto_1 = require("./dto/update-availability.dto");
let AvailabilityController = class AvailabilityController {
    constructor(availability, aiPricing) {
        this.availability = availability;
        this.aiPricing = aiPricing;
    }
    async list(req, listingId, from, to) {
        return {
            items: await this.availability.list(req.user.id, listingId, from ? new Date(from) : undefined, to ? new Date(to) : undefined),
        };
    }
    async update(req, listingId, dto) {
        return { items: await this.availability.update(req.user.id, listingId, dto) };
    }
    async aiPricingSuggestion(listingId) {
        return this.aiPricing.pricing({ listingId });
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, common_1.Get)(":listingId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("listingId")),
    __param(2, (0, common_1.Query)("from")),
    __param(3, (0, common_1.Query)("to")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(":listingId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("listingId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_availability_dto_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(":listingId/ai-pricing"),
    __param(0, (0, common_1.Param)("listingId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "aiPricingSuggestion", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, swagger_1.ApiTags)("availability"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("guest", "host", "admin"),
    (0, common_1.Controller)("availability"),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService,
        ai_pricing_service_1.AiPricingService])
], AvailabilityController);
//# sourceMappingURL=availability.controller.js.map