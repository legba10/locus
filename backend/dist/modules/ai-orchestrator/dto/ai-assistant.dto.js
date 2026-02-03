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
exports.AiAssistantRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ai_context_dto_1 = require("./ai-context.dto");
class AiAssistantRequestDto {
}
exports.AiAssistantRequestDto = AiAssistantRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ["guest", "host", "admin"], example: "guest" }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)(["guest", "host", "admin"]),
    __metadata("design:type", String)
], AiAssistantRequestDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Почему это жильё подходит? Какие риски?" }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiAssistantRequestDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ai_context_dto_1.AiContextDto),
    __metadata("design:type", ai_context_dto_1.AiContextDto)
], AiAssistantRequestDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Arbitrary JSON context (listingId, bookingId etc.)" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AiAssistantRequestDto.prototype, "extra", void 0);
//# sourceMappingURL=ai-assistant.dto.js.map