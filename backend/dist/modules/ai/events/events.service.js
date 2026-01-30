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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = exports.EVENTS = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
exports.EVENTS = {
    PROPERTY_CREATED: 'property.created',
    PROPERTY_UPDATED: 'property.updated',
    PROPERTY_PUBLISHED: 'property.published',
    BOOKING_CREATED: 'booking.created',
    BOOKING_CONFIRMED: 'booking.confirmed',
    BOOKING_CANCELED: 'booking.canceled',
    REVIEW_ADDED: 'review.added',
    USER_BEHAVIOR: 'user.behavior',
};
let EventsService = EventsService_1 = class EventsService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    emitPropertyCreated(data) {
        const event = { ...data, timestamp: new Date() };
        this.logger.log(`Emitting ${exports.EVENTS.PROPERTY_CREATED}: ${data.listingId}`);
        this.eventEmitter.emit(exports.EVENTS.PROPERTY_CREATED, event);
    }
    emitPropertyUpdated(data) {
        const event = { ...data, timestamp: new Date() };
        this.logger.log(`Emitting ${exports.EVENTS.PROPERTY_UPDATED}: ${data.listingId}`);
        this.eventEmitter.emit(exports.EVENTS.PROPERTY_UPDATED, event);
    }
    emitPropertyPublished(data) {
        const event = { ...data, timestamp: new Date() };
        this.logger.log(`Emitting ${exports.EVENTS.PROPERTY_PUBLISHED}: ${data.listingId}`);
        this.eventEmitter.emit(exports.EVENTS.PROPERTY_PUBLISHED, event);
    }
    emitBookingCreated(data) {
        const event = { ...data, timestamp: new Date() };
        this.logger.log(`Emitting ${exports.EVENTS.BOOKING_CREATED}: ${data.bookingId}`);
        this.eventEmitter.emit(exports.EVENTS.BOOKING_CREATED, event);
    }
    emitBookingConfirmed(data) {
        const event = { ...data, timestamp: new Date() };
        this.logger.log(`Emitting ${exports.EVENTS.BOOKING_CONFIRMED}: ${data.bookingId}`);
        this.eventEmitter.emit(exports.EVENTS.BOOKING_CONFIRMED, event);
    }
    emitBookingCanceled(data) {
        const event = { ...data, timestamp: new Date() };
        this.logger.log(`Emitting ${exports.EVENTS.BOOKING_CANCELED}: ${data.bookingId}`);
        this.eventEmitter.emit(exports.EVENTS.BOOKING_CANCELED, event);
    }
    emitReviewAdded(data) {
        const event = { ...data, timestamp: new Date() };
        this.logger.log(`Emitting ${exports.EVENTS.REVIEW_ADDED}: ${data.reviewId}`);
        this.eventEmitter.emit(exports.EVENTS.REVIEW_ADDED, event);
    }
    emitUserBehavior(data) {
        const event = { ...data, timestamp: new Date() };
        this.eventEmitter.emit(exports.EVENTS.USER_BEHAVIOR, event);
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], EventsService);
