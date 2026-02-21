import { Body, Controller, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { ModerationGuard } from "../auth/guards/moderation.guard";
import { ListingsService } from "./listings.service";
import { UpdateListingStatusDto } from "./dto/update-listing-status.dto";

@ApiTags("listing")
@Controller("listing")
export class ListingStatusController {
  constructor(private readonly listings: ListingsService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, ModerationGuard)
  @Patch(":id/status")
  async updateStatusByAdmin(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateListingStatusDto) {
    return {
      item: await this.listings.updateStatusByAdmin(req.user.id, id, dto.status, dto.moderation_note ?? null),
    };
  }
}
