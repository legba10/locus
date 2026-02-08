import { Injectable } from "@nestjs/common";
import { UserRoleEnum } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const NotificationType = {
  NEW_LISTING_PENDING: "NEW_LISTING_PENDING",
  LISTING_APPROVED: "LISTING_APPROVED",
  LISTING_REJECTED: "LISTING_REJECTED",
  NEW_BOOKING: "NEW_BOOKING",
  NEW_MESSAGE: "NEW_MESSAGE",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
} as const;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, type: string, title: string, body?: string | null) {
    return this.prisma.notification.create({
      data: { userId, type, title, body: body ?? null },
    });
  }

  async createForAdmins(type: string, title: string, body?: string | null) {
    const admins = await this.prisma.user.findMany({
      where: { appRole: { in: [UserRoleEnum.ROOT, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] } },
      select: { id: true },
    });
    const created = await Promise.all(
      admins.map((a) => this.create(a.id, type, title, body))
    );
    return created;
  }

  /** Отправить уведомление всем пользователям (админ-пуш). */
  async createForAllUsers(type: string, title: string, body?: string | null) {
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });
    const created = await Promise.all(
      users.map((u) => this.create(u.id, type, title, body))
    );
    return { sent: created.length };
  }

  async getForUser(userId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  }
}
