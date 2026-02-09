import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
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

  /** Public profile for owner card → /user/:id (no auth). Must be after GET me. */
  @Get(":id/public")
  async getPublicProfile(@Param("id") id: string) {
    const profile = await this.users.getPublicProfile(id);
    if (!profile) return { profile: null };
    return { profile };
  }
}

