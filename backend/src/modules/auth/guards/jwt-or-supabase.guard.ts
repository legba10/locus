import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { JwtAuthService } from "../jwt-auth.service";
import { SupabaseAuthGuard } from "./supabase-auth.guard";

/**
 * Guard for /me: accept either our backend JWT (email login) or Supabase JWT (Telegram, session).
 * Tries our JWT first; if valid, loads user from Prisma and attaches to request.
 * Otherwise delegates to SupabaseAuthGuard.
 */
@Injectable()
export class JwtOrSupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtAuth: JwtAuthService,
    private readonly supabaseAuthGuard: SupabaseAuthGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"] as string | undefined;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException("No authorization header");
    }

    if (this.jwtAuth.isOurToken(token)) {
      const payload = this.jwtAuth.verify(token);
      if (payload.type !== "access") {
        throw new UnauthorizedException("Invalid token type");
      }
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true, roles: { include: { role: true } } },
      });
      if (!user) {
        throw new UnauthorizedException("User not found");
      }
      const roleName = user.roles?.[0]?.role?.name ?? "user";
      const role = roleName === "landlord" ? "landlord" : "user";
      req.user = {
        id: user.id,
        supabaseId: user.supabaseId ?? user.id,
        email: user.email ?? "",
        phone: user.phone ?? null,
        role: role as "user" | "landlord",
        roles: [role],
        profile: user.profile
          ? {
              full_name: user.profile.name ?? null,
              phone: user.profile.phone ?? null,
              telegram_id: null,
              role: role,
              tariff: null,
              email: user.profile.email ?? user.email,
            }
          : null,
      };
      (req.user as any).fromPrisma = true;
      return true;
    }

    return this.supabaseAuthGuard.canActivate(context);
  }
}
