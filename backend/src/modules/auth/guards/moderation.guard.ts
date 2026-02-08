import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { UserRoleEnum } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ROOT_ADMIN_EMAIL } from "../constants";

/**
 * ModerationGuard — допускает ROOT (по email), ADMIN, MANAGER.
 * Для set-role только root — проверяется в контроллере через ensureRootAdmin.
 */
@Injectable()
export class ModerationGuard implements CanActivate {
  private readonly logger = new Logger(ModerationGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id as string | undefined;
    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { appRole: true, email: true },
    });
    const emailNorm = (user?.email ?? "").trim().toLowerCase();
    const isRoot = emailNorm === ROOT_ADMIN_EMAIL.trim().toLowerCase();
    const allowed =
      isRoot ||
      user?.appRole === UserRoleEnum.ROOT ||
      user?.appRole === UserRoleEnum.ADMIN ||
      user?.appRole === UserRoleEnum.MANAGER;
    if (!allowed) {
      this.logger.warn(`Moderation access denied for user ${userId}`);
      throw new ForbiddenException("Admin or manager access required");
    }
    req.user.isAdmin = isRoot || user!.appRole === UserRoleEnum.ROOT || user!.appRole === UserRoleEnum.ADMIN;
    req.user.role = isRoot || user!.appRole === UserRoleEnum.ROOT ? "root" : user!.appRole === UserRoleEnum.ADMIN ? "admin" : "manager";
    return true;
  }
}
