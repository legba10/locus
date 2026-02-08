import { BadRequestException, Body, Controller, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@ApiTags("profile")
@Controller("profile")
export class ProfileController {
  constructor(private readonly supabaseAuth: SupabaseAuthService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Patch()
  async update(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const fullName = dto.full_name ?? dto.name ?? undefined;
    const phone = dto.phone ?? undefined;
    const role = dto.role ?? undefined;
    const avatarUrl = dto.avatar_url ?? undefined;

    if (fullName === undefined && phone === undefined && role === undefined && avatarUrl === undefined) {
      throw new BadRequestException("No profile fields provided");
    }

    const profile = await this.supabaseAuth.updateProfile(req.user.id, {
      full_name: fullName,
      phone,
      role,
      avatar_url: avatarUrl,
    });

    return { profile };
  }
}
