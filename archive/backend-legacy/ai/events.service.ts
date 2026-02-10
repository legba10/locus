import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Event types
export const EVENTS = {
  PROPERTY_CREATED: 'property.created',
  PROPERTY_UPDATED: 'property.updated',
  PROPERTY_PUBLISHED: 'property.published',
  BOOKING_CREATED: 'booking.created',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_CANCELED: 'booking.canceled',
  REVIEW_ADDED: 'review.added',
  USER_BEHAVIOR: 'user.behavior',
} as const;

// Event payloads
export interface PropertyCreatedEvent {
  listingId: string;
  ownerId: string;
  timestamp: Date;
}

export interface PropertyUpdatedEvent {
  listingId: string;
  ownerId: string;
  changes: string[];
  timestamp: Date;
}

export interface PropertyPublishedEvent {
  listingId: string;
  ownerId: string;
  timestamp: Date;
}

export interface BookingCreatedEvent {
  bookingId: string;
  listingId: string;
  guestId: string;
  hostId: string;
  timestamp: Date;
}

export interface BookingConfirmedEvent {
  bookingId: string;
  listingId: string;
  guestId: string;
  hostId: string;
  timestamp: Date;
}

export interface BookingCanceledEvent {
  bookingId: string;
  listingId: string;
  reason?: string;
  timestamp: Date;
}

export interface ReviewAddedEvent {
  reviewId: string;
  listingId: string;
  authorId: string;
  rating: number;
  timestamp: Date;
}

export interface UserBehaviorEvent {
  userId: string;
  action: 'view' | 'search' | 'favorite' | 'contact';
  listingId?: string;
  searchQuery?: string;
  timestamp: Date;
}

/**
 * Events Service — центральный event bus платформы.
 * 
 * Pipeline:
 * event → AI Brain → Intelligence update → DB → notification
 */
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emit property created event
   */
  emitPropertyCreated(data: Omit<PropertyCreatedEvent, 'timestamp'>): void {
    const event: PropertyCreatedEvent = { ...data, timestamp: new Date() };
    this.logger.log(`Emitting ${EVENTS.PROPERTY_CREATED}: ${data.listingId}`);
    this.eventEmitter.emit(EVENTS.PROPERTY_CREATED, event);
  }

  /**
   * Emit property updated event
   */
  emitPropertyUpdated(data: Omit<PropertyUpdatedEvent, 'timestamp'>): void {
    const event: PropertyUpdatedEvent = { ...data, timestamp: new Date() };
    this.logger.log(`Emitting ${EVENTS.PROPERTY_UPDATED}: ${data.listingId}`);
    this.eventEmitter.emit(EVENTS.PROPERTY_UPDATED, event);
  }

  /**
   * Emit property published event
   */
  emitPropertyPublished(data: Omit<PropertyPublishedEvent, 'timestamp'>): void {
    const event: PropertyPublishedEvent = { ...data, timestamp: new Date() };
    this.logger.log(`Emitting ${EVENTS.PROPERTY_PUBLISHED}: ${data.listingId}`);
    this.eventEmitter.emit(EVENTS.PROPERTY_PUBLISHED, event);
  }

  /**
   * Emit booking created event
   */
  emitBookingCreated(data: Omit<BookingCreatedEvent, 'timestamp'>): void {
    const event: BookingCreatedEvent = { ...data, timestamp: new Date() };
    this.logger.log(`Emitting ${EVENTS.BOOKING_CREATED}: ${data.bookingId}`);
    this.eventEmitter.emit(EVENTS.BOOKING_CREATED, event);
  }

  /**
   * Emit booking confirmed event
   */
  emitBookingConfirmed(data: Omit<BookingConfirmedEvent, 'timestamp'>): void {
    const event: BookingConfirmedEvent = { ...data, timestamp: new Date() };
    this.logger.log(`Emitting ${EVENTS.BOOKING_CONFIRMED}: ${data.bookingId}`);
    this.eventEmitter.emit(EVENTS.BOOKING_CONFIRMED, event);
  }

  /**
   * Emit booking canceled event
   */
  emitBookingCanceled(data: Omit<BookingCanceledEvent, 'timestamp'>): void {
    const event: BookingCanceledEvent = { ...data, timestamp: new Date() };
    this.logger.log(`Emitting ${EVENTS.BOOKING_CANCELED}: ${data.bookingId}`);
    this.eventEmitter.emit(EVENTS.BOOKING_CANCELED, event);
  }

  /**
   * Emit review added event
   */
  emitReviewAdded(data: Omit<ReviewAddedEvent, 'timestamp'>): void {
    const event: ReviewAddedEvent = { ...data, timestamp: new Date() };
    this.logger.log(`Emitting ${EVENTS.REVIEW_ADDED}: ${data.reviewId}`);
    this.eventEmitter.emit(EVENTS.REVIEW_ADDED, event);
  }

  /**
   * Emit user behavior event
   */
  emitUserBehavior(data: Omit<UserBehaviorEvent, 'timestamp'>): void {
    const event: UserBehaviorEvent = { ...data, timestamp: new Date() };
    this.eventEmitter.emit(EVENTS.USER_BEHAVIOR, event);
  }
}
