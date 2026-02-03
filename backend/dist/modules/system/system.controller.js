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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const system_service_1 = require("./system.service");
let SystemController = class SystemController {
    constructor(system) {
        this.system = system;
    }
    async getStatus() {
        return this.system.getStatus();
    }
    getHealth() {
        return { status: 'ok' };
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System status',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2026-01-26T12:00:00Z' },
                version: { type: 'string', example: '1.0.0' },
                services: {
                    type: 'object',
                    properties: {
                        backend: { type: 'string', example: 'ok' },
                        database: { type: 'string', example: 'ok' },
                        ai: { type: 'string', example: 'ok' },
                        storage: { type: 'string', example: 'ok' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Simple health check (for load balancers)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OK' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], SystemController.prototype, "getHealth", null);
exports.SystemController = SystemController = __decorate([
    (0, swagger_1.ApiTags)('system'),
    (0, common_1.Controller)('system'),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
//# sourceMappingURL=system.controller.js.map