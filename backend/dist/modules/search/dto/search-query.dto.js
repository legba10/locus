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
exports.SearchBodyDto = exports.SearchQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SearchQueryDto {
}
exports.SearchQueryDto = SearchQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Moscow" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "тихо метро" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Минимальная цена за ночь", example: 2000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined ? undefined : Number(value))),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "priceMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Максимальная цена за ночь", example: 5000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined ? undefined : Number(value))),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "priceMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Количество гостей", example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined ? undefined : Number(value))),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "guests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "amenities keys csv", example: "wifi,parking" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ["newest", "price_asc", "price_desc"], default: "newest" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["newest", "price_asc", "price_desc"]),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Use AI search reranking", example: "1" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["0", "1"]),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "ai", void 0);
class SearchBodyDto {
}
exports.SearchBodyDto = SearchBodyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Москва" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchBodyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchBodyDto.prototype, "priceMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchBodyDto.prototype, "priceMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchBodyDto.prototype, "guests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "тихая квартира у метро" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchBodyDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchBodyDto.prototype, "useAi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ["wifi", "parking"] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SearchBodyDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ["relevance", "price_asc", "price_desc", "rating", "ai_score"], default: "relevance" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["relevance", "price_asc", "price_desc", "rating", "ai_score"]),
    __metadata("design:type", String)
], SearchBodyDto.prototype, "sort", void 0);
