import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { ListingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { supabase } from "../../shared/lib/supabase";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAuth: SupabaseAuthService
  ) {}

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

  /** Public profile view with aggregates for listings, reviews and reputation (ТЗ-7). */
  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        reputation: true,
        listings: {
          where: { status: ListingStatus.PUBLISHED },
          orderBy: { createdAt: "desc" },
          include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    });
    if (!user) throw new NotFoundException("User not found");

    const byRating = await this.prisma.review.groupBy({
      where: { listing: { ownerId: userId } },
      by: ["rating"],
      _count: { _all: true },
    });

    const totalReviews = byRating.reduce((acc, row) => acc + row._count._all, 0);
    const avgRating =
      totalReviews > 0
        ? byRating.reduce((sum, row) => sum + row.rating * row._count._all, 0) / totalReviews
        : null;
    const hostScore = user.reputation?.hostScore ?? (avgRating != null ? avgRating * 20 : null);

    const listings = user.listings.map((l) => ({
      id: l.id,
      title: l.title,
      city: l.city,
      basePrice: l.basePrice,
      imageUrl: l.photos[0]?.url ?? null,
    }));

    return {
      id: user.id,
      name: user.profile?.name || "Пользователь",
      avatar: user.profile?.avatarUrl ?? null,
      rating_avg: avgRating,
      host_score: hostScore,
      guest_score: user.reputation?.guestScore ?? null,
      trust_score: user.reputation?.trustScore ?? null,
      reviews_count: totalReviews,
      response_rate: null as number | null,
      last_seen: null as string | null,
      created_at: user.createdAt.toISOString(),
      listingsCount: listings.length,
      listings,
    };
  }

  /** Upload avatar to Supabase Storage and persist public URL in profile. */
  async updateAvatar(userId: string, file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException("Avatar file is required");
    }
    await this.getById(userId);

    if (!supabase) {
      throw new ConflictException("Supabase storage is not configured");
    }

    const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/gi, "") || "jpg";
    const path = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new ConflictException(`Failed to upload avatar: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: { avatarUrl },
      create: { userId, avatarUrl },
    });

    await this.supabaseAuth.updateProfile(userId, { avatar_url: avatarUrl });

    return { avatarUrl: profile.avatarUrl };
  }
}

