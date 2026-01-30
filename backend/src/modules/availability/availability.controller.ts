import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AiPricingService } from "../ai-orchestrator/services/ai-pricing.service";
import { AvailabilityService } from "./availability.service";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";

@ApiTags("availability")
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles("guest", "host", "admin")
@Controller("availability")
export class AvailabilityController {
  constructor(
    private readonly availability: AvailabilityService,
    private readonly aiPricing: AiPricingService,
  ) {}

  @Get(":listingId")
  async list(
    @Req() req: any,
    @Param("listingId") listingId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return {
      items: await this.availability.list(
        req.user.id,
        listingId,
        from ? new Date(from) : undefined,
        to ? new Date(to) : undefined,
      ),
    };
  }

  @Put(":listingId")
  async update(@Req() req: any, @Param("listingId") listingId: string, @Body() dto: UpdateAvailabilityDto) {
    return { items: await this.availability.update(req.user.id, listingId, dto) };
  }

  @Get(":listingId/ai-pricing")
  async aiPricingSuggestion(@Param("listingId") listingId: string) {
    // returns recommendation + persists AiListingScore via aiPricing service
    return this.aiPricing.pricing({ listingId });
  }
}

