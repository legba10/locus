import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { RequireLandlord } from "../auth/decorators/require-landlord.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequireTariff } from "../auth/decorators/require-tariff.decorator";
import { TariffGuard } from "../auth/guards/tariff.guard";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
@RequireLandlord()
@RequireTariff("landlord_basic", "landlord_pro")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get("host/overview")
  async hostOverview(@Req() req: any) {
    return this.analytics.hostOverview(req.user.id);
  }
}

