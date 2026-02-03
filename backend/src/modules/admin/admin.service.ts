import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
  async approveListing(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.PUBLISHED },
    });
  }

  /**
   * Reject a listing (move from PENDING_REVIEW to REJECTED)
   */
  async rejectListing(listingId: string, reason?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.REJECTED },
    });
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
}
