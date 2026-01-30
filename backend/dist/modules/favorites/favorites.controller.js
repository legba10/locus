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
exports.FavoritesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const favorites_service_1 = require("./favorites.service");
let FavoritesController = class FavoritesController {
    constructor(favorites) {
        this.favorites = favorites;
    }
    async getFavorites(req) {
        const userId = req.user.id;
        return this.favorites.getFavorites(userId);
    }
    async addFavorite(req, listingId) {
        const userId = req.user.id;
        return this.favorites.addFavorite(userId, listingId);
    }
    async removeFavorite(req, listingId) {
        const userId = req.user.id;
        return this.favorites.removeFavorite(userId, listingId);
    }
    async toggleFavorite(req, listingId) {
        const userId = req.user.id;
        return this.favorites.toggleFavorite(userId, listingId);
    }
    async checkFavorite(req, listingId) {
        const userId = req.user.id;
        const isFavorite = await this.favorites.isFavorite(userId, listingId);
        return { isFavorite };
    }
};
exports.FavoritesController = FavoritesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get user's favorite listings" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Post)(":listingId"),
    (0, swagger_1.ApiOperation)({ summary: "Add listing to favorites" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("listingId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.Delete)(":listingId"),
    (0, swagger_1.ApiOperation)({ summary: "Remove listing from favorites" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("listingId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.Post)(":listingId/toggle"),
    (0, swagger_1.ApiOperation)({ summary: "Toggle favorite status" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("listingId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Get)(":listingId/check"),
    (0, swagger_1.ApiOperation)({ summary: "Check if listing is favorited" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("listingId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "checkFavorite", null);
exports.FavoritesController = FavoritesController = __decorate([
    (0, swagger_1.ApiTags)("favorites"),
    (0, common_1.Controller)("favorites"),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [favorites_service_1.FavoritesService])
], FavoritesController);
