import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ROOT_ADMIN_EMAIL } from "../auth/constants";
import { UserRoleEnum } from "@prisma/client";

/**
 * NeonUserService — manages minimal User records in Neon for FK purposes
 * 
 * Architecture:
 * - Auth/Profiles/Roles: Supabase (source of truth)
 * - Neon User: Minimal record ONLY for FK relationships (listings, bookings)
 * - ROOT ADMIN: email === ROOT_ADMIN_EMAIL always gets appRole ADMIN (hardcoded in backend)
 * 
 * This service ensures a Neon User exists when needed, using
 * Supabase user ID as the Neon User ID for consistency.
 */
@Injectable()
export class NeonUserService {
  private readonly logger = new Logger(NeonUserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensure a minimal User record exists in Neon for FK purposes.
   * Uses Supabase user ID as the Neon User ID.
   * Root admin (legba086@mail.ru) always gets appRole ADMIN and cannot lose it.
   *
   * @param supabaseId - Supabase auth.uid()
   * @param email - User's email (optional, for reference; used for root admin rule)
   */
  async ensureUserExists(supabaseId: string, email?: string | null): Promise<string> {
    const isRoot = email != null && email.trim().toLowerCase() === ROOT_ADMIN_EMAIL.trim().toLowerCase();
    const upserted = await this.prisma.user.upsert({
      where: { id: supabaseId },
      update: {
        supabaseId,
        supabaseUuid: supabaseId,
        ...(email != null ? { email } : {}),
        ...(isRoot ? { appRole: UserRoleEnum.ADMIN } : {}),
      },
      create: {
        id: supabaseId,
        supabaseId,
        supabaseUuid: supabaseId,
        email: email ?? null,
        appRole: isRoot ? UserRoleEnum.ADMIN : UserRoleEnum.USER,
      },
      select: { id: true },
    }).catch(async (error: any) => {
      // Handle rare race / legacy rows
      if (error.code === "P2002") {
        const found = await this.prisma.user.findUnique({ where: { id: supabaseId }, select: { id: true } });
        if (found) return found;
      }
      this.logger.error(`Failed to upsert Neon user: ${error.message}`);
      throw error;
    });

    return upserted.id;
  }

  /**
   * Get Neon User ID from Supabase ID
   * Returns null if not found (doesn't create)
   */
  async getNeonUserId(supabaseId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: supabaseId },
      select: { id: true },
    });
    return user?.id ?? null;
  }
}
