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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    checkAdmin(req) {
        if (req.user?.role !== 'admin') {
            throw new common_1.ForbiddenException('Admin access required');
        }
    }
    async getStats(req) {
        this.checkAdmin(req);
        return this.adminService.getStats();
    }
    async getPendingListings(req, limit) {
        this.checkAdmin(req);
        return this.adminService.getPendingListings(limit ? parseInt(limit, 10) : 50);
    }
    async getAllListings(req, status, limit) {
        this.checkAdmin(req);
        return this.adminService.getAllListings({
            status,
            limit: limit ? parseInt(limit, 10) : 50,
        });
    }
    async approveListing(req, id) {
        this.checkAdmin(req);
        const listing = await this.adminService.approveListing(id);
        return { ok: true, listing };
    }
    async rejectListing(req, id, reason) {
        this.checkAdmin(req);
        const listing = await this.adminService.rejectListing(id, reason);
        return { ok: true, listing };
    }
    async blockListing(req, id) {
        this.checkAdmin(req);
        const listing = await this.adminService.blockListing(id);
        return { ok: true, listing };
    }
    async getAllUsers(req, limit) {
        this.checkAdmin(req);
        return this.adminService.getAllUsers(limit ? parseInt(limit, 10) : 50);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard stats (admin only)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('listings/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get listings pending moderation (admin only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingListings", null);
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all listings (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.ListingStatus }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllListings", null);
__decorate([
    (0, common_1.Post)('listings/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a listing (admin only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveListing", null);
__decorate([
    (0, common_1.Post)('listings/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a listing (admin only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectListing", null);
__decorate([
    (0, common_1.Post)('listings/:id/block'),
    (0, swagger_1.ApiOperation)({ summary: 'Block a listing (admin only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "blockListing", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (admin only)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map