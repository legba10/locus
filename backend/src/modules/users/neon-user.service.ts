import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * NeonUserService — manages minimal User records in Neon for FK purposes
 * 
 * Architecture:
 * - Auth/Profiles/Roles: Supabase (source of truth)
 * - Neon User: Minimal record ONLY for FK relationships (listings, bookings)
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
   * 
   * @param supabaseId - Supabase auth.uid()
   * @param email - User's email (optional, for reference)
   */
  async ensureUserExists(supabaseId: string, email?: string | null): Promise<string> {
    // First, try to find by supabaseId
    const existing = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    // Create minimal User record with supabaseId as ID
    // This ensures Neon User ID = Supabase User ID
    try {
      const created = await this.prisma.user.create({
        data: {
          id: supabaseId, // Use Supabase ID as Neon ID
          supabaseId,
          email: email ?? null,
          // default plan = FREE, default listingLimit = 1 (schema defaults)
        },
        select: { id: true },
      });
      
      this.logger.debug(`Created Neon user for Supabase ID: ${supabaseId}`);
      return created.id;
    } catch (error: any) {
      // Handle race condition - user might have been created by another request
      if (error.code === "P2002") {
        const found = await this.prisma.user.findUnique({
          where: { supabaseId },
          select: { id: true },
        });
        if (found) {
          return found.id;
        }
      }
      
      this.logger.error(`Failed to create Neon user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Neon User ID from Supabase ID
   * Returns null if not found (doesn't create)
   */
  async getNeonUserId(supabaseId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });
    return user?.id ?? null;
  }
}
