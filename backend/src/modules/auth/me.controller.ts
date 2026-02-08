import { Controller, Get, InternalServerErrorException, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { SupabaseAuthService } from "./supabase-auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { NeonUserService } from "../users/neon-user.service";
import { planFromLegacyTariff } from "./plan";

@ApiTags("auth")
@Controller()
export class MeController {
  constructor(
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly prisma: PrismaService,
    private readonly neonUser: NeonUserService
  ) {}

  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Alias for /auth/me (user + profile + plan)" })
  async me(@Req() req: any) {
    // Prefer profile synced by guard; fallback to fetch; never hard-fail login if profile row is missing.
    let profile = (req.user?.profile as any) ?? null;
    if (!profile) {
      profile = await this.supabaseAuth.getProfile(req.user.id);
    }
    if (!profile) {
      profile = await this.supabaseAuth
        .upsertProfile({ id: req.user.id, email: req.user.email ?? null, phone: req.user.phone ?? null, user_metadata: null })
        .catch(() => null);
    }

    const rawProfileRole = profile?.role ?? null;
    const role = ((rawProfileRole ?? "user") as string).toLowerCase() === "landlord" ? "landlord" : "user";
    const tariff = ((profile?.tariff ?? (profile as any)?.plan ?? "free") as "free" | "landlord_basic" | "landlord_pro");
    const email = profile?.email ?? req.user.email ?? null;

    await this.neonUser.ensureUserExists(req.user.id, email);
    const defaults = await this.supabaseAuth.ensureListingDefaults(req.user.id).catch(() => null);
    const listingLimit = Number((defaults as any)?.listing_limit ?? (profile as any)?.listing_limit ?? 1);
    const listingUsed = Number((defaults as any)?.listing_used ?? (profile as any)?.listing_used ?? 0);
    const planRaw = String((defaults as any)?.plan ?? (profile as any)?.plan ?? tariff ?? "free");

    const isAdmin =
      Boolean((profile as any)?.is_admin) ||
      Boolean((defaults as any)?.is_admin) ||
      (await this.supabaseAuth.ensureAdminFlag({
        id: req.user.id,
        telegram_id: profile?.telegram_id ?? null,
        is_admin: (profile as any)?.is_admin ?? null,
      }).catch(() => false));

    const derived = planFromLegacyTariff(planRaw);
    const userRow = await this.prisma.user.update({
      where: { id: req.user.id },
      data: { plan: derived.plan, listingLimit: listingLimit || derived.listingLimit },
      select: { plan: true, listingLimit: true },
    });

    const roleOut = isAdmin ? "admin" : role;
    const profileCompleted = Boolean((profile?.full_name ?? "").trim()) && Boolean((profile?.phone ?? "").trim());

    return {
      id: req.user.id,
      email: email ?? "",
      role: roleOut,
      plan: userRow.plan,
      listingLimit: userRow.listingLimit,
      listingUsed,
      isAdmin,
      profileCompleted,
      full_name: String(profile?.full_name ?? ""),
      phone: String(profile?.phone ?? req.user.phone ?? ""),
      telegram_id: String(profile?.telegram_id ?? ""),
      avatar_url: String((profile as any)?.avatar_url ?? ""),
      username: String((profile as any)?.username ?? ""),
    };
  }
}

