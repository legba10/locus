import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<Array<"user" | "landlord">>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: { role?: string; roles?: string[] } }>();
    const user = req.user;
    if (!user) return false;

    const role = user.role?.toLowerCase();
    const roles = user.roles?.map((r) => r.toLowerCase()) ?? [];
    return requiredRoles.some((r) => role === r || roles.includes(r));
  }
}
