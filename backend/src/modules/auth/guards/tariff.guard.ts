import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TARIFF_KEY } from "../decorators/tariff.decorator";

@Injectable()
export class TariffGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTariffs =
      this.reflector.getAllAndOverride<string[]>(TARIFF_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredTariffs.length === 0) return true;

    const req = context.switchToHttp().getRequest<{
      user?: {
        role?: string;
        roles?: string[];
        profile?: { tariff?: string | null } | null;
      };
    }>();
    const user = req.user;
    if (!user) return false;

    const isAdmin =
      user.role?.toLowerCase() === "admin" || (user.roles ?? []).map((r) => r.toLowerCase()).includes("admin");
    if (isAdmin) return true;

    const tariff = user.profile?.tariff?.toLowerCase();
    if (!tariff) return false;

    return requiredTariffs.map((t) => t.toLowerCase()).includes(tariff);
  }
}
