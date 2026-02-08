import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { UserRoleEnum } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * AdminGuard — допускает только пользователей с appRole === ADMIN в Neon.
 * Должен использоваться после SupabaseAuthGuard (req.user.id уже установлен).
 * Root admin (legba086@mail.ru) всегда имеет appRole ADMIN после ensureUserExists.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id as string | undefined;
    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { appRole: true },
    });
    if (!user || user.appRole !== UserRoleEnum.ADMIN) {
      this.logger.warn(`Admin access denied for user ${userId}`);
      throw new ForbiddenException("Admin access required");
    }
    req.user.isAdmin = true;
    req.user.role = "admin";
    return true;
  }
}
