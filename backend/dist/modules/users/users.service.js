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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { profile: true, roles: { include: { role: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { profile: true, roles: { include: { role: true } } },
        });
    }
    async ensureRole(name) {
        return this.prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `${name} role` },
        });
    }
    async register(params) {
        const existing = await this.prisma.user.findUnique({ where: { email: params.email } });
        if (existing)
            throw new common_1.ConflictException("Email already registered");
        const passwordHash = await bcryptjs_1.default.hash(params.password, 10);
        const role = await this.ensureRole(params.role);
        const user = await this.prisma.user.create({
            data: {
                email: params.email,
                passwordHash,
                profile: params.name ? { create: { name: params.name } } : undefined,
                roles: { create: { roleId: role.id } },
            },
            include: { profile: true, roles: { include: { role: true } } },
        });
        return user;
    }
    async updateMyProfile(userId, patch) {
        await this.getById(userId);
        return this.prisma.profile.upsert({
            where: { userId },
            update: { ...patch },
            create: { userId, ...patch },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map