"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsPhotosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_1 = require("../../shared/lib/supabase");
const crypto = __importStar(require("crypto"));
let ListingsPhotosService = class ListingsPhotosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadPhoto(listingId, userId, file, sortOrder = 0) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            select: { ownerId: true },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Объявление не найдено');
        }
        if (listing.ownerId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этому объявлению');
        }
        if (!supabase_1.supabase) {
            throw new Error('Supabase не настроен. Проверьте переменные окружения.');
        }
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('Размер файла превышает 10MB');
        }
        const fileExt = file.originalname.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        const filePath = `listings/${listingId}/${fileName}`;
        const { data, error } = await supabase_1.supabase.storage
            .from(supabase_1.LISTINGS_BUCKET)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Ошибка загрузки: ${error.message}`);
        }
        const publicUrl = (0, supabase_1.getSupabaseImageUrl)(filePath);
        if (!publicUrl) {
            throw new Error('Не удалось получить URL изображения');
        }
        const photo = await this.prisma.listingPhoto.create({
            data: {
                listingId,
                url: publicUrl,
                sortOrder,
            },
        });
        return photo;
    }
    async deletePhoto(photoId, userId) {
        const photo = await this.prisma.listingPhoto.findUnique({
            where: { id: photoId },
            include: {
                listing: {
                    select: { ownerId: true },
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Фотография не найдена');
        }
        if (photo.listing.ownerId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этой фотографии');
        }
        const url = new URL(photo.url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
        const filePath = pathMatch ? pathMatch[1] : null;
        if (filePath && supabase_1.supabase) {
            const { error } = await supabase_1.supabase.storage
                .from(supabase_1.LISTINGS_BUCKET)
                .remove([filePath]);
            if (error) {
                console.warn('Failed to delete from Supabase Storage:', error);
            }
        }
        await this.prisma.listingPhoto.delete({
            where: { id: photoId },
        });
        return { success: true };
    }
    async getPhotos(listingId) {
        return this.prisma.listingPhoto.findMany({
            where: { listingId },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async updatePhotoOrder(photoId, userId, sortOrder) {
        const photo = await this.prisma.listingPhoto.findUnique({
            where: { id: photoId },
            include: {
                listing: {
                    select: { ownerId: true },
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Фотография не найдена');
        }
        if (photo.listing.ownerId !== userId) {
            throw new common_1.ForbiddenException('Нет доступа к этой фотографии');
        }
        return this.prisma.listingPhoto.update({
            where: { id: photoId },
            data: { sortOrder },
        });
    }
};
exports.ListingsPhotosService = ListingsPhotosService;
exports.ListingsPhotosService = ListingsPhotosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListingsPhotosService);
