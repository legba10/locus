import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductIntelligenceService } from '../../product-intelligence/product-intelligence.service';
import {
  EVENTS,
  PropertyCreatedEvent,
  PropertyUpdatedEvent,
  PropertyPublishedEvent,
  BookingCreatedEvent,
  BookingConfirmedEvent,
  ReviewAddedEvent,
} from '../events.service.stub';

/**
 * Intelligence Event Handler — обработка событий и пересчёт AI профилей.
 * 
 * Pipeline:
 * event → handler → AI Brain → DB update
 */
@Injectable()
export class IntelligenceEventHandler {
  private readonly logger = new Logger(IntelligenceEventHandler.name);

  constructor(
    private readonly intelligence: ProductIntelligenceService,
  ) {}

  @OnEvent(EVENTS.PROPERTY_CREATED)
  async handlePropertyCreated(event: PropertyCreatedEvent): Promise<void> {
    this.logger.log(`Handling property created: ${event.listingId}`);
    try {
      await this.intelligence.calculateAndSave(event.listingId);
    } catch (error) {
      this.logger.error(`Failed to calculate intelligence for ${event.listingId}:`, error);
    }
  }

  @OnEvent(EVENTS.PROPERTY_UPDATED)
  async handlePropertyUpdated(event: PropertyUpdatedEvent): Promise<void> {
    this.logger.log(`Handling property updated: ${event.listingId}, changes: ${event.changes.join(', ')}`);
    try {
      // Пересчитать AI профиль при значимых изменениях
    const significantChanges = ['title', 'description', 'basePrice', 'photos', 'amenities'];
    const hasSignificantChanges = event.changes.some((c: string) => significantChanges.includes(c));
      
      if (hasSignificantChanges) {
        await this.intelligence.calculateAndSave(event.listingId);
      }
    } catch (error) {
      this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
    }
  }

  @OnEvent(EVENTS.PROPERTY_PUBLISHED)
  async handlePropertyPublished(event: PropertyPublishedEvent): Promise<void> {
    this.logger.log(`Handling property published: ${event.listingId}`);
    try {
      // Пересчитать при публикации (может измениться demand score)
      await this.intelligence.calculateAndSave(event.listingId);
    } catch (error) {
      this.logger.error(`Failed to calculate intelligence for ${event.listingId}:`, error);
    }
  }

  @OnEvent(EVENTS.BOOKING_CREATED)
  async handleBookingCreated(event: BookingCreatedEvent): Promise<void> {
    this.logger.log(`Handling booking created for listing: ${event.listingId}`);
    try {
      // Бронирование влияет на demand score
      await this.intelligence.calculateAndSave(event.listingId);
    } catch (error) {
      this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
    }
  }

  @OnEvent(EVENTS.BOOKING_CONFIRMED)
  async handleBookingConfirmed(event: BookingConfirmedEvent): Promise<void> {
    this.logger.log(`Handling booking confirmed for listing: ${event.listingId}`);
    try {
      // Подтверждённое бронирование — положительный сигнал
      await this.intelligence.calculateAndSave(event.listingId);
    } catch (error) {
      this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
    }
  }

  @OnEvent(EVENTS.REVIEW_ADDED)
  async handleReviewAdded(event: ReviewAddedEvent): Promise<void> {
    this.logger.log(`Handling review added for listing: ${event.listingId}`);
    try {
      // Отзыв влияет на quality и risk scores
      await this.intelligence.calculateAndSave(event.listingId);
    } catch (error) {
      this.logger.error(`Failed to recalculate intelligence for ${event.listingId}:`, error);
    }
  }
}
