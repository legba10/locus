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
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const update_listing_dto_1 = require("./dto/update-listing.dto");
const listings_service_1 = require("./listings.service");
const listings_photos_service_1 = require("./listings-photos.service");
let ListingsController = class ListingsController {
    constructor(listings, photosService) {
        this.listings = listings;
        this.photosService = photosService;
    }
    async getAll(city, limit) {
        const items = await this.listings.getAll({
            city,
            limit: limit ? Number(limit) : undefined,
        });
        return { items };
    }
    async getOne(id) {
        return { item: await this.listings.getById(id) };
    }
    async create(req, dto) {
        return { item: await this.listings.create(req.user.id, dto) };
    }
    async update(req, id, dto) {
        return { item: await this.listings.update(req.user.id, id, dto) };
    }
    async publish(req, id) {
        return { item: await this.listings.publish(req.user.id, id) };
    }
    async unpublish(req, id) {
        return { item: await this.listings.unpublish(req.user.id, id) };
    }
    async getPhotos(id) {
        return { photos: await this.photosService.getPhotos(id) };
    }
    async uploadPhoto(req, id, file, sortOrder) {
        const photo = await this.photosService.uploadPhoto(id, req.user.id, file, sortOrder ? parseInt(sortOrder, 10) : 0);
        return { photo };
    }
    async deletePhoto(req, photoId) {
        return await this.photosService.deletePhoto(photoId, req.user.id);
    }
    async updatePhotoOrder(req, photoId, sortOrder) {
        return { photo: await this.photosService.updatePhotoOrder(photoId, req.user.id, sortOrder) };
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all published listings" }),
    (0, swagger_1.ApiQuery)({ name: "city", required: false }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Query)("city")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_dto_1.CreateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Post)(":id/publish"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "publish", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Post)(":id/unpublish"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Get)(":id/photos"),
    (0, swagger_1.ApiOperation)({ summary: "Get all photos for a listing" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getPhotos", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Post)(":id/photos"),
    (0, swagger_1.ApiOperation)({ summary: "Upload a photo for a listing" }),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
                sortOrder: {
                    type: "number",
                    default: 0,
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
    }))),
    __param(3, (0, common_1.Body)("sortOrder")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "uploadPhoto", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Delete)(":id/photos/:photoId"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a photo from a listing" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("photoId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "deletePhoto", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Patch)(":id/photos/:photoId/order"),
    (0, swagger_1.ApiOperation)({ summary: "Update photo sort order" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("photoId")),
    __param(2, (0, common_1.Body)("sortOrder")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "updatePhotoOrder", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)("listings"),
    (0, common_1.Controller)("listings"),
    __metadata("design:paramtypes", [listings_service_1.ListingsService,
        listings_photos_service_1.ListingsPhotosService])
], ListingsController);
