import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

type PrismaUserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

type BusinessRole = "guest" | "host" | "admin";

@Injectable()
export class SupabaseAuthService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeRole(value: unknown): BusinessRole | null {
    if (!value) return null;
    const role = String(value).toLowerCase();
    if (role === "guest" || role === "host" || role === "admin") return role;
    return null;
  }

  private resolveRole(supabaseUser: SupabaseUser): BusinessRole {
    const metaRole =
      this.normalizeRole(supabaseUser.user_metadata?.role) ??
      this.normalizeRole(supabaseUser.app_metadata?.role) ??
      this.normalizeRole(supabaseUser.user_metadata?.app_role) ??
      this.normalizeRole(supabaseUser.app_metadata?.app_role);
    return metaRole ?? "guest";
  }

  private async ensureRole(name: BusinessRole) {
    return this.prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }

  private async attachDefaultRole(userId: string, roleName: BusinessRole) {
    const role = await this.ensureRole(roleName);
    await this.prisma.userRole.create({
      data: { userId, roleId: role.id },
    });
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
  }

  /**
   * Синхронизирует пользователя Supabase с Prisma User.
   * Если записи нет — создаёт, если есть — возвращает существующую.
   */
  async syncUser(supabaseUser: SupabaseUser): Promise<PrismaUserWithRoles> {
    const email = supabaseUser.email ?? undefined;
    const emailUpdate = email ? { email } : {};
    const defaultRole = this.resolveRole(supabaseUser);

    const existingBySupabase = await this.prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: { roles: { include: { role: true } } },
    });

    if (existingBySupabase) {
      if (email && existingBySupabase.email !== email) {
        const updated = await this.prisma.user.update({
          where: { id: existingBySupabase.id },
          data: { ...emailUpdate },
          include: { roles: { include: { role: true } } },
        });
        if (updated.roles.length > 0) return updated;
        const withRole = await this.attachDefaultRole(updated.id, defaultRole);
        return withRole ?? updated;
      }
      if (existingBySupabase.roles.length > 0) return existingBySupabase;
      const withRole = await this.attachDefaultRole(existingBySupabase.id, defaultRole);
      return withRole ?? existingBySupabase;
    }

    if (email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email },
        include: { roles: { include: { role: true } } },
      });
      if (existingByEmail) {
        const updated = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { supabaseId: supabaseUser.id },
          include: { roles: { include: { role: true } } },
        });
        if (updated.roles.length > 0) return updated;
        const withRole = await this.attachDefaultRole(updated.id, defaultRole);
        return withRole ?? updated;
      }
    }

    const created = await this.prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email: email ?? null,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: defaultRole },
                create: { name: defaultRole, description: `${defaultRole} role` },
              },
            },
          },
        },
      },
      include: { roles: { include: { role: true } } },
    });
    return created;
  }
}

