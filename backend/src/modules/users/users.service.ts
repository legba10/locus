import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { ListingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true, roles: { include: { role: true } } },
    });
  }

  async ensureRole(name: "user" | "landlord") {
    return this.prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }

  async register(params: { email: string; password: string; role: "user" | "landlord"; name?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: params.email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(params.password, 10);
    const role = await this.ensureRole(params.role);

    const user = await this.prisma.user.create({
      data: {
        email: params.email,
        passwordHash,
        profile: params.name ? { create: { name: params.name } } : undefined,
        roles: { create: { roleId: role.id } },
      },
      include: { profile: true, roles: { include: { role: true } } },
    });

    return user;
  }

  async updateMyProfile(userId: string, patch: { name?: string; avatarUrl?: string }) {
    await this.getById(userId);
    return this.prisma.profile.upsert({
      where: { userId },
      update: { ...patch },
      create: { userId, ...patch },
    });
  }

  /**
   * Public profile for /user/:id (owner card link).
   * Returns name, avatar, published listings, rating from reviews on owner's listings.
   */
  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: { select: { name: true, avatarUrl: true } },
      },
    });
    if (!user) return null;

    const [listings, reviewsAgg] = await Promise.all([
      this.prisma.listing.findMany({
        where: { ownerId: userId, status: ListingStatus.PUBLISHED },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          city: true,
          basePrice: true,
          photos: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
        },
      }),
      this.prisma.review.aggregate({
        where: { listing: { ownerId: userId } },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    const name = user.profile?.name ?? user.email ?? "Владелец";
    const avatarUrl = user.profile?.avatarUrl ?? null;
    const rating =
      reviewsAgg._count > 0 && reviewsAgg._avg?.rating != null
        ? Math.round(reviewsAgg._avg.rating * 10) / 10
        : null;

    return {
      id: user.id,
      name,
      avatarUrl,
      email: user.email,
      createdAt: user.createdAt,
      listingsCount: listings.length,
      rating,
      reviewsCount: reviewsAgg._count,
      listings: listings.map((l) => ({
        id: l.id,
        title: l.title,
        city: l.city,
        basePrice: l.basePrice,
        imageUrl: l.photos[0]?.url ?? null,
      })),
    };
  }
}

