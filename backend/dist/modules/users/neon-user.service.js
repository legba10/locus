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
var NeonUserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonUserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NeonUserService = NeonUserService_1 = class NeonUserService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NeonUserService_1.name);
    }
    async ensureUserExists(supabaseId, email) {
        const existing = await this.prisma.user.findUnique({
            where: { supabaseId },
            select: { id: true },
        });
        if (existing) {
            return existing.id;
        }
        try {
            const created = await this.prisma.user.create({
                data: {
                    id: supabaseId,
                    supabaseId,
                    email: email ?? null,
                },
                select: { id: true },
            });
            this.logger.debug(`Created Neon user for Supabase ID: ${supabaseId}`);
            return created.id;
        }
        catch (error) {
            if (error.code === "P2002") {
                const found = await this.prisma.user.findUnique({
                    where: { supabaseId },
                    select: { id: true },
                });
                if (found) {
                    return found.id;
                }
            }
            this.logger.error(`Failed to create Neon user: ${error.message}`);
            throw error;
        }
    }
    async getNeonUserId(supabaseId) {
        const user = await this.prisma.user.findUnique({
            where: { supabaseId },
            select: { id: true },
        });
        return user?.id ?? null;
    }
};
exports.NeonUserService = NeonUserService;
exports.NeonUserService = NeonUserService = NeonUserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NeonUserService);
//# sourceMappingURL=neon-user.service.js.map