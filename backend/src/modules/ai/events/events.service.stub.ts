import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Local copies of event constants and payload types, extracted from the
// archived implementation in archive/backend-legacy/ai/events.service.ts.
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
 * Lightweight stub of EventsService that preserves the public API
 * so that modules and handlers compile, but keeps behavior minimal.
 *
 * The full legacy implementation now lives in archive/backend-legacy/ai/events.service.ts.
 */
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitPropertyCreated(data: any): void {
    this.logger.debug(`emitPropertyCreated stub called for listing ${data?.listingId ?? ''}`);
  }

  emitPropertyUpdated(data: any): void {
    this.logger.debug(`emitPropertyUpdated stub called for listing ${data?.listingId ?? ''}`);
  }

  emitPropertyPublished(data: any): void {
    this.logger.debug(`emitPropertyPublished stub called for listing ${data?.listingId ?? ''}`);
  }

  emitBookingCreated(data: any): void {
    this.logger.debug(`emitBookingCreated stub called for booking ${data?.bookingId ?? ''}`);
  }

  emitBookingConfirmed(data: any): void {
    this.logger.debug(`emitBookingConfirmed stub called for booking ${data?.bookingId ?? ''}`);
  }

  emitBookingCanceled(data: any): void {
    this.logger.debug(`emitBookingCanceled stub called for booking ${data?.bookingId ?? ''}`);
  }

  emitReviewAdded(data: any): void {
    this.logger.debug(`emitReviewAdded stub called for review ${data?.reviewId ?? ''}`);
  }

  emitUserBehavior(data: any): void {
    this.logger.debug(`emitUserBehavior stub called for user ${data?.userId ?? ''}`);
  }
}

