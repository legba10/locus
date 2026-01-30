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
exports.UpdateAvailabilityDto = exports.AvailabilityPatchItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AvailabilityPatchItemDto {
}
exports.AvailabilityPatchItemDto = AvailabilityPatchItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2026-02-01T00:00:00.000Z" }),
    (0, class_validator_1.IsDefined)(),
    (0, class_transformer_1.Transform)(({ value }) => new Date(value)),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AvailabilityPatchItemDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AvailabilityPatchItemDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 4000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], AvailabilityPatchItemDto.prototype, "priceOverride", void 0);
class UpdateAvailabilityDto {
}
exports.UpdateAvailabilityDto = UpdateAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AvailabilityPatchItemDto] }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AvailabilityPatchItemDto),
    __metadata("design:type", Array)
], UpdateAvailabilityDto.prototype, "items", void 0);
