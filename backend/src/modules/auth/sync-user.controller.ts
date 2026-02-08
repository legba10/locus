import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { SupabaseAuthService } from "./supabase-auth.service";
import { NeonUserService } from "../users/neon-user.service";
import { PrismaService } from "../prisma/prisma.service";
import { planFromLegacyTariff } from "./plan";

@ApiTags("auth")
@Controller()
export class SyncUserController {
  constructor(
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly neonUser: NeonUserService,
    private readonly prisma: PrismaService
  ) {}

  @Post("sync-user")
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Force sync Supabase profile -> Neon user (plan/limits/admin defaults)" })
  async sync(@Req() req: any) {
    const userId = req.user.id as string;
    const email = (req.user.email ?? null) as string | null;

    // Ensure profile exists
    let profile = (req.user.profile as any) ?? (await this.supabaseAuth.getProfile(userId));
    if (!profile) {
      profile = await this.supabaseAuth.upsertProfile({ id: userId, email, phone: req.user.phone ?? null, user_metadata: null });
    }

    // Ensure listing defaults
    const defaults = await this.supabaseAuth.ensureListingDefaults(userId).catch(() => null);
    const listingLimit = Number((defaults as any)?.listing_limit ?? (profile as any)?.listing_limit ?? 1);
    const planRaw = String((defaults as any)?.plan ?? (profile as any)?.plan ?? (profile as any)?.tariff ?? "free");

    // Ensure Neon user first (sets appRole ADMIN for root email)
    await this.neonUser.ensureUserExists(userId, email);
    const derived = planFromLegacyTariff(planRaw);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: derived.plan,
        listingLimit: listingLimit || derived.listingLimit,
      },
    }).catch(() => undefined);

    const neonUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { appRole: true },
    });
    const profileAdmin = await this.supabaseAuth.ensureAdminFlag({
      id: userId,
      email: email ?? undefined,
      telegram_id: profile?.telegram_id ?? null,
      is_admin: (profile as any)?.is_admin ?? null,
    }).catch(() => false);
    const isAdmin = neonUser?.appRole === "ADMIN" || profileAdmin;

    return { ok: true, id: userId, isAdmin };
  }
}

