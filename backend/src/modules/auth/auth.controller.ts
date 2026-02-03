import { BadRequestException, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user. Supabase access_token required." })
  @ApiResponse({ status: 200, description: "Current user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  me(
    @Req()
    req: {
      user: {
        id: string;
        supabaseId: string;
        email: string;
        role: "guest" | "host" | "admin";
        roles: string[];
        profile?: {
          full_name: string | null;
          phone: string | null;
          telegram_id: string | null;
          role: string | null;
          tariff: string | null;
        } | null;
      };
    },
  ) {
    const profile = req.user.profile ?? null;
    const profilePayload = profile
      ? {
          name: profile.full_name ?? undefined,
          fullName: profile.full_name ?? undefined,
          phone: profile.phone ?? undefined,
          telegramId: profile.telegram_id ?? undefined,
          role: profile.role ?? undefined,
          tariff: profile.tariff ?? undefined,
        }
      : undefined;

    return {
      ok: true,
      user: {
        id: req.user.id,
        supabaseId: req.user.supabaseId,
        email: req.user.email,
        role: req.user.role,
        roles: req.user.roles,
        profile: profilePayload,
      },
    };
  }

  @Post("login")
  @ApiOperation({ summary: "Login is via Supabase on frontend; this route returns 400." })
  @ApiResponse({ status: 400, description: "Use Supabase client for login" })
  login() {
    throw new BadRequestException({
      message: "Use Supabase client for login. Backend accepts only Authorization: Bearer <supabase_access_token>.",
    });
  }
}
