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
var IntelligenceEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceEventHandler = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const product_intelligence_service_1 = require("../../product-intelligence/product-intelligence.service");
const events_service_1 = require("../events.service");
let IntelligenceEventHandler = IntelligenceEventHandler_1 = class IntelligenceEventHandler {
    constructor(intelligence) {
        this.intelligence = intelligence;
        this.logger = new common_1.Logger(IntelligenceEventHandler_1.name);
    }
    async handlePropertyCreated(event) {
        this.logger.log(`Handling property created: ${event.listingId}`);
        try {
            await this.intelligence.calculateAndSave(event.listingId);
        }
        catch (error) {
            this.logger.error(`Failed to calculate intelligence for ${event.listingId}:`, error);
        }
    }
    async handlePropertyUpdated(event) {
        this.logger.log(`Handling property updated: ${event.listingId}, changes: ${event.changes.join(', ')}`);
        try {
            const significantChanges = ['title', 'description', 'basePrice', 'photos', 'amenities'];
            const hasSignificantChanges = event.changes.some(c => significantChanges.includes(c));
            if (hasSignificantChanges) {
                await this.intelligence.calculateAndSave(event.listingId);
            }
        }
        catch (error) {
            this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
        }
    }
    async handlePropertyPublished(event) {
        this.logger.log(`Handling property published: ${event.listingId}`);
        try {
            await this.intelligence.calculateAndSave(event.listingId);
        }
        catch (error) {
            this.logger.error(`Failed to calculate intelligence for ${event.listingId}:`, error);
        }
    }
    async handleBookingCreated(event) {
        this.logger.log(`Handling booking created for listing: ${event.listingId}`);
        try {
            await this.intelligence.calculateAndSave(event.listingId);
        }
        catch (error) {
            this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
        }
    }
    async handleBookingConfirmed(event) {
        this.logger.log(`Handling booking confirmed for listing: ${event.listingId}`);
        try {
            await this.intelligence.calculateAndSave(event.listingId);
        }
        catch (error) {
            this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
        }
    }
    async handleReviewAdded(event) {
        this.logger.log(`Handling review added for listing: ${event.listingId}`);
        try {
            await this.intelligence.calculateAndSave(event.listingId);
        }
        catch (error) {
            this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
        }
    }
};
exports.IntelligenceEventHandler = IntelligenceEventHandler;
__decorate([
    (0, event_emitter_1.OnEvent)(events_service_1.EVENTS.PROPERTY_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntelligenceEventHandler.prototype, "handlePropertyCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_service_1.EVENTS.PROPERTY_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntelligenceEventHandler.prototype, "handlePropertyUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_service_1.EVENTS.PROPERTY_PUBLISHED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntelligenceEventHandler.prototype, "handlePropertyPublished", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_service_1.EVENTS.BOOKING_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntelligenceEventHandler.prototype, "handleBookingCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_service_1.EVENTS.BOOKING_CONFIRMED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntelligenceEventHandler.prototype, "handleBookingConfirmed", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_service_1.EVENTS.REVIEW_ADDED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntelligenceEventHandler.prototype, "handleReviewAdded", null);
exports.IntelligenceEventHandler = IntelligenceEventHandler = IntelligenceEventHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_intelligence_service_1.ProductIntelligenceService])
], IntelligenceEventHandler);
//# sourceMappingURL=intelligence.handler.js.map