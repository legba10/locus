import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { supabase } from "../../../shared/lib/supabase";
import { SupabaseAuthService } from "../supabase-auth.service";

/**
 * SupabaseAuthGuard — validates Supabase JWT and syncs profile
 * 
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Validate token with Supabase Auth
 * 3. Upsert profile in Supabase public.profiles
 * 4. Get role from profile
 * 5. Attach user info to request
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  
  constructor(private readonly supabaseAuth: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"] as string | undefined;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token");
    }
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      throw new UnauthorizedException("No token");
    }

    if (!supabase) {
      this.logger.error("Supabase client not configured");
      throw new UnauthorizedException("Auth service unavailable");
    }

    // Validate token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      this.logger.warn(`Token validation failed: ${error?.message ?? "No user"}`);
      throw new UnauthorizedException("Invalid or expired token");
    }

    // Sync user profile in Supabase (upsert + get role)
    const telegramId = data.user.user_metadata?.telegram_id as string | undefined;
    const userInfo = await this.supabaseAuth.syncUser(
      {
        id: data.user.id,
        email: data.user.email ?? null,
        phone: data.user.phone ?? null,
        user_metadata: data.user.user_metadata,
      },
      telegramId
    );

    // Attach user to request
    req.user = {
      id: userInfo.id,
      supabaseId: userInfo.supabaseId,
      email: userInfo.email,
      phone: userInfo.phone,
      role: userInfo.role,
      roles: userInfo.roles,
      profile: userInfo.profile,
    };

    this.logger.debug(`Authenticated user: ${userInfo.email} (role: ${userInfo.role})`);

    return true;
  }
}
