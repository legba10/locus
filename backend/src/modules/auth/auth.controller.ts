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
        phone: string | null;
        role: "user" | "landlord";
        roles: string[];
        profile?: {
          full_name: string | null;
          phone: string | null;
          telegram_id: string | null;
          role: string | null;
          tariff: string | null;
          verification_status?: "pending" | "verified" | null;
          email?: string | null;
        } | null;
      };
    },
  ) {
    const profile = req.user.profile ?? null;
    const role = (profile?.role ?? req.user.role ?? "user") as "user" | "landlord";
    const tariff =
      (profile?.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro";
    const verificationStatus =
      (profile?.verification_status ?? "pending") as "pending" | "verified";

    return {
      id: req.user.id,
      email: profile?.email ?? req.user.email ?? "",
      phone: profile?.phone ?? req.user.phone ?? null,
      telegram_id: profile?.telegram_id ?? null,
      full_name: profile?.full_name ?? null,
      role,
      tariff,
      verification_status: verificationStatus,
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
