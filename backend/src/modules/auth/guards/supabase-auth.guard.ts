import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { supabase } from "../../../shared/lib/supabase";
import { SupabaseAuthService } from "../supabase-auth.service";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseAuth: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"] as string | undefined;

    if (!authHeader) throw new UnauthorizedException("No token");

    // eslint-disable-next-line no-console
    console.log("AUTH HEADER", authHeader);
    const [scheme, rawToken] = authHeader.split(" ");
    const token = scheme?.toLowerCase() === "bearer" ? rawToken : undefined;
    if (!token) throw new UnauthorizedException("Invalid token");

    if (!supabase) throw new UnauthorizedException("Supabase not configured");
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) throw new UnauthorizedException("Invalid token");

    // eslint-disable-next-line no-console
    console.log("SUPABASE USER", data.user);
    const prismaUser = await this.supabaseAuth.syncUser({
      id: data.user.id,
      email: data.user.email ?? null,
      user_metadata: data.user.user_metadata,
      app_metadata: data.user.app_metadata,
    });

    const roleNames = prismaUser.roles.map((r) => r.role.name);
    const primaryRole = roleNames.includes("admin")
      ? "admin"
      : roleNames.includes("host")
        ? "host"
        : "guest";

    req.user = {
      id: prismaUser.id,
      supabaseId: data.user.id,
      email: data.user.email ?? prismaUser.email ?? "",
      role: primaryRole,
      roles: roleNames.length > 0 ? roleNames : [primaryRole],
    };

    return true;
  }
}
