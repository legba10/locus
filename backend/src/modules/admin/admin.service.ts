import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BookingStatus, ListingStatus, UserRoleEnum, UserStatus } from '@prisma/client';
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
   * Get dashboard stats + economy. ТЗ-5: flat shape + last 7 days + backward compat.
   */
  async getStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalListings,
      pendingListings,
      publishedListings,
      totalBookings,
      confirmedBookings,
      canceledBookings,
      gmvResult,
      totalViews,
      messagesCount,
      revenueResult,
      usersLast7,
      listingsLast7,
      bookingsLast7,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING_REVIEW } }),
      this.prisma.listing.count({ where: { status: ListingStatus.PUBLISHED } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { status: BookingStatus.CANCELED } }),
      this.prisma.booking.aggregate({
        where: { status: BookingStatus.CONFIRMED },
        _sum: { totalPrice: true },
      }),
      this.prisma.listing.aggregate({
        _sum: { viewsCount: true },
      }),
      this.prisma.message.count(),
      (async () => {
        try {
          const r = await this.prisma.payment.aggregate({ where: { status: 'SUCCEEDED' }, _sum: { amount: true } });
          return r._sum?.amount ?? 0;
        } catch {
          return 0;
        }
      })(),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.listing.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    const gmv = gmvResult._sum?.totalPrice ?? 0;
    const views = totalViews._sum?.viewsCount ?? 0;
    const conversion = views > 0 ? (confirmedBookings / views) * 100 : 0;
    const revenue = typeof revenueResult === 'number' ? revenueResult : 0;
    const commission = revenue;
    const averageOrder = confirmedBookings > 0 ? Math.round(gmv / confirmedBookings) : 0;

    return {
      users_total: totalUsers,
      users_active: activeUsers,
      listings_total: totalListings,
      listings_active: publishedListings,
      bookings_total: totalBookings,
      bookings_confirmed: confirmedBookings,
      revenue_total: revenue,
      gmv_total: gmv,
      avg_check: averageOrder,
      users_last_7_days: usersLast7,
      listings_last_7_days: listingsLast7,
      bookings_last_7_days: bookingsLast7,
      users: { total: totalUsers, active: activeUsers },
      listings: { total: totalListings, pending: pendingListings, published: publishedListings },
      bookings: { total: totalBookings, confirmed: confirmedBookings, canceled: canceledBookings },
      economy: {
        gmv,
        revenue,
        commission,
        averageOrder,
        totalViews: views,
        conversion: Math.round(conversion * 100) / 100,
        messagesCount,
      },
    };
  }

  /**
   * Последние действия: 10 последних событий (новый пользователь, объявление, бронь).
   */
  async getRecentActivity(limit = 10) {
    const [recentUsers, recentListings, recentBookings] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, createdAt: true, email: true },
      }),
      this.prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, createdAt: true, title: true },
      }),
      this.prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, createdAt: true },
      }),
    ]);

    const events: { type: 'user' | 'listing' | 'booking'; id: string; date: string; label: string }[] = [];
    recentUsers.forEach((u) => {
      events.push({
        type: 'user',
        id: u.id,
        date: u.createdAt.toISOString(),
        label: u.email || 'Новый пользователь',
      });
    });
    recentListings.forEach((l) => {
      events.push({
        type: 'listing',
        id: l.id,
        date: l.createdAt.toISOString(),
        label: l.title || 'Новое объявление',
      });
    });
    recentBookings.forEach((b) => {
      events.push({
        type: 'booking',
        id: b.id,
        date: b.createdAt.toISOString(),
        label: 'Новая бронь',
      });
    });
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events.slice(0, limit);
  }

  /**
   * Time-series for dashboard charts (last 30 days): revenue, bookings count, new users count per day.
   */
  async getStatsCharts(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const [payments, bookings, newUsers] = await Promise.all([
      this.prisma.payment.findMany({
        where: { status: 'SUCCEEDED', createdAt: { gte: from } },
        select: { amount: true, createdAt: true },
      }).catch(() => []),
      this.prisma.booking.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true },
      }).catch(() => []),
      this.prisma.user.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true },
      }).catch(() => []),
    ]);

    const toDayKey = (d: Date) => d.toISOString().slice(0, 10);
    const revenueByDay: Record<string, number> = {};
    const bookingsByDay: Record<string, number> = {};
    const newUsersByDay: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const key = toDayKey(d);
      revenueByDay[key] = 0;
      bookingsByDay[key] = 0;
      newUsersByDay[key] = 0;
    }

    payments.forEach((p) => {
      const key = toDayKey(p.createdAt);
      if (revenueByDay[key] !== undefined) revenueByDay[key] += p.amount;
    });
    bookings.forEach((b) => {
      const key = toDayKey(b.createdAt);
      if (bookingsByDay[key] !== undefined) bookingsByDay[key] += 1;
    });
    newUsers.forEach((u) => {
      const key = toDayKey(u.createdAt);
      if (newUsersByDay[key] !== undefined) newUsersByDay[key] += 1;
    });

    return {
      revenue: Object.entries(revenueByDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({ date, value })),
      bookings: Object.entries(bookingsByDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })),
      newUsers: Object.entries(newUsersByDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })),
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
        photos: { orderBy: { sortOrder: 'asc' }, take: 5 },
        amenities: { include: { amenity: { select: { key: true } } } },
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

  /**
   * Ban user (set status BLOCKED). Root cannot be banned.
   */
  async banUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const isRootUser = (user.email ?? '').trim().toLowerCase() === ROOT_ADMIN_EMAIL.trim().toLowerCase();
    if (isRootUser) throw new ForbiddenException('Root admin cannot be banned');
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BLOCKED },
    });
    return { userId, status: 'BLOCKED' };
  }

  /**
   * Unban user (set status ACTIVE).
   */
  async unbanUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
    });
    return { userId, status: 'ACTIVE' };
  }

  /**
   * Delete listing (admin only, any owner).
   */
  async deleteListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    await this.prisma.listing.delete({ where: { id: listingId } });
    return { deleted: listingId };
  }
}
