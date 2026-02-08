import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ListingStatus, UserRoleEnum } from '@prisma/client';
import { ROOT_ADMIN_EMAIL } from '../auth/constants';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Get dashboard stats
   */
  async getStats() {
    const [
      totalUsers,
      totalListings,
      pendingListings,
      publishedListings,
      totalBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING_REVIEW } }),
      this.prisma.listing.count({ where: { status: ListingStatus.PUBLISHED } }),
      this.prisma.booking.count(),
    ]);

    return {
      users: { total: totalUsers },
      listings: { total: totalListings, pending: pendingListings, published: publishedListings },
      bookings: { total: totalBookings },
    };
  }

  /**
   * Get listings pending moderation
   */
  async getPendingListings(limit = 50) {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.PENDING_REVIEW },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        owner: { select: { id: true, email: true } },
        photos: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  /**
   * Get all listings for admin (any status)
   */
  async getAllListings(params: { status?: ListingStatus; limit?: number } = {}) {
    const { status, limit = 50 } = params;
    return this.prisma.listing.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        owner: { select: { id: true, email: true } },
        photos: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  /**
   * Approve a listing (move from PENDING_REVIEW to PUBLISHED)
   */
  async approveListing(listingId: string, adminId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.PUBLISHED,
        moderatedById: adminId,
        moderationComment: null,
      },
    });

    this.notifications
      .create(listing.ownerId, NotificationType.LISTING_APPROVED, 'Объявление опубликовано', null)
      .catch(() => {});

    return updated;
  }

  /**
   * Reject a listing (move from PENDING_REVIEW to REJECTED)
   */
  async rejectListing(listingId: string, adminId: string, reason?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.REJECTED,
        moderatedById: adminId,
        moderationComment: reason ?? null,
      },
    });

    this.notifications
      .create(listing.ownerId, NotificationType.LISTING_REJECTED, 'Объявление отклонено', reason ?? undefined)
      .catch(() => {});

    return updated;
  }

  /**
   * Block a listing
   */
  async blockListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.BLOCKED },
    });
  }

  /**
   * Get all bookings (admin)
   */
  async getBookings(limit = 50) {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        listing: { select: { id: true, title: true } },
        guest: { select: { id: true, email: true } },
        host: { select: { id: true, email: true } },
      },
    });
  }

  /**
   * Get all conversations (admin) for support
   */
  async getConversations(limit = 50) {
    return this.prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        listing: { select: { id: true, title: true } },
        host: { select: { id: true, email: true } },
        guest: { select: { id: true, email: true } },
        _count: { select: { messages: true } },
      },
    });
  }

  /**
   * Get all users
   */
  async getAllUsers(limit = 50) {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        _count: { select: { listings: true, bookingsAsGuest: true } },
      },
    });
  }

  /**
   * Отправить уведомление всем пользователям (админ-пуш).
   */
  async pushToAll(title: string, body?: string) {
    return this.notifications.createForAllUsers('ADMIN_PUSH', title, body ?? null);
  }

  /**
   * Set user appRole (root admin only). Root cannot be demoted. Manager cannot change roles (only root can call this).
   */
  async setUserRole(userId: string, appRole: UserRoleEnum) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const isRootUser = (user.email ?? '').trim().toLowerCase() === ROOT_ADMIN_EMAIL.trim().toLowerCase();
    if (isRootUser) {
      throw new ForbiddenException('Root admin role cannot be changed');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { appRole },
    });
    return { userId, appRole };
  }
}
