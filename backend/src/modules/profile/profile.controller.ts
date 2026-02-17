import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { ProfileService } from "./profile.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@ApiTags("profile")
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Get()
  async get(@Req() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  async update(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const fullName = dto.full_name ?? dto.name ?? undefined;
    const phone = dto.phone ?? undefined;
    const role = dto.role ?? undefined;
    const avatarUrl = dto.avatar_url ?? undefined;
    const aiParams = dto.ai_params ?? undefined;

    if (fullName === undefined && phone === undefined && role === undefined && avatarUrl === undefined && aiParams === undefined) {
      throw new BadRequestException("No profile fields provided");
    }

    return this.profileService.updateProfile(req.user.id, dto, req.user?.email ?? null);
  }
}
