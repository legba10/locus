import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true, roles: { include: { role: true } } },
    });
  }

  async ensureRole(name: "user" | "landlord") {
    return this.prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }

  async register(params: { email: string; password: string; role: "user" | "landlord"; name?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: params.email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(params.password, 10);
    const role = await this.ensureRole(params.role);

    const user = await this.prisma.user.create({
      data: {
        email: params.email,
        passwordHash,
        profile: params.name ? { create: { name: params.name } } : undefined,
        roles: { create: { roleId: role.id } },
      },
      include: { profile: true, roles: { include: { role: true } } },
    });

    return user;
  }

  async updateMyProfile(userId: string, patch: { name?: string; avatarUrl?: string }) {
    await this.getById(userId);
    return this.prisma.profile.upsert({
      where: { userId },
      update: { ...patch },
      create: { userId, ...patch },
    });
  }
}

