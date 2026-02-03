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
var SystemService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SystemService = SystemService_1 = class SystemService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SystemService_1.name);
        this.startTime = Date.now();
        this.version = process.env.npm_package_version || '1.0.0';
    }
    async getStatus() {
        const services = {
            backend: 'ok',
            database: await this.checkDatabase(),
            ai: await this.checkAi(),
            storage: 'unknown',
        };
        const hasError = Object.values(services).some(s => s === 'error');
        const hasDegraded = Object.values(services).some(s => s === 'unknown');
        let status;
        if (hasError) {
            status = 'error';
        }
        else if (hasDegraded) {
            status = 'degraded';
        }
        else {
            status = 'ok';
        }
        let stats;
        try {
            const [users, listings, bookings] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.listing.count(),
                this.prisma.booking.count(),
            ]);
            stats = { users, listings, bookings };
        }
        catch (e) {
            this.logger.warn('Failed to get stats:', e);
        }
        return {
            status,
            timestamp: new Date().toISOString(),
            version: this.version,
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            services,
            stats,
        };
    }
    async checkDatabase() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return 'ok';
        }
        catch (e) {
            this.logger.error('Database check failed:', e);
            return 'error';
        }
    }
    async checkAi() {
        return 'ok';
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = SystemService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemService);
//# sourceMappingURL=system.service.js.map