import { Controller, Get, Req, UseGuards } from "@nestjs/common";
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
  me(
    @Req()
    req: {
      user: {
        id: string;
        supabaseId: string;
        email: string;
        role: "guest" | "host" | "admin";
        roles: string[];
      };
    },
  ) {
    return req.user;
  }
}
