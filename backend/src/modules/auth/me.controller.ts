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
    const profile = await this.supabaseAuth.getProfile(req.user.id);
    if (!profile) {
      throw new InternalServerErrorException("PROFILE_NOT_FOUND");
    }

    const rawProfileRole = profile.role ?? null;
    const role = ((rawProfileRole ?? "user") as string).toLowerCase() === "landlord" ? "landlord" : "user";
    const tariff = (profile.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro";
    const email = profile.email ?? req.user.email ?? null;

    await this.neonUser.ensureUserExists(req.user.id, email);
    const derived = planFromLegacyTariff(tariff);
    const userRow = await this.prisma.user.update({
      where: { id: req.user.id },
      data: { plan: derived.plan, listingLimit: derived.listingLimit },
      select: { plan: true, listingLimit: true },
    });

    return {
      id: profile.id,
      email,
      phone: profile.phone ?? null,
      telegram_id: profile.telegram_id ?? null,
      username: (profile as any).username ?? null,
      avatar_url: (profile as any).avatar_url ?? null,
      full_name: profile.full_name ?? null,
      role,
      profile_role_raw: rawProfileRole,
      needsRoleSelection:
        Boolean(profile.telegram_id) &&
        (!rawProfileRole || rawProfileRole.toLowerCase() === "user"),
      tariff,
      plan: userRow.plan,
      listingLimit: userRow.listingLimit,
    };
  }
}

