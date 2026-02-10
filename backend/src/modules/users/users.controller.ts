import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const user = await this.users.register({
      email: dto.email,
      password: dto.password,
      role: dto.role ?? "user",
      name: dto.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        roles: user.roles.map((r) => r.role.name),
        profile: user.profile,
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Get("me")
  async me(@Req() req: any) {
    const user = await this.users.getById(req.user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        roles: user.roles.map((r) => r.role.name),
        profile: user.profile,
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Patch("me")
  async updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const profile = await this.users.updateMyProfile(req.user.id, dto);
    return { profile };
  }

  /**
   * Public profile with aggregates for listings and reviews.
   */
  @Get(":id/public")
  async getPublic(@Param("id") id: string) {
    const profile = await this.users.getPublicProfile(id);
    return { profile };
  }

  /**
   * Upload avatar for current user.
   */
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Post("avatar")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: any) {
    const result = await this.users.updateAvatar(req.user.id, file);
    return result;
  }
}

