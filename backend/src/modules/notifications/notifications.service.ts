import { Injectable } from "@nestjs/common";
import { UserRoleEnum } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const NotificationType = {
  NEW_LISTING_PENDING: "NEW_LISTING_PENDING",
  LISTING_SUBMITTED: "LISTING_SUBMITTED",
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

  /** Отправить уведомление всем пользователям (админ-пуш): in-app + опционально browser push. */
  async createForAllUsers(type: string, title: string, body?: string | null) {
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });
    const created = await Promise.all(
      users.map((u) => this.create(u.id, type, title, body))
    );
    const browserSent = await this.sendBrowserPushToAll(title, body ?? undefined);
    return { sent: created.length, browserPushSent: browserSent };
  }

  /** Сохранить подписку на браузерные push (Web Push). */
  async registerPushSubscription(
    userId: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  ) {
    const { endpoint, keys } = subscription;
    await this.prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: { userId, endpoint },
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });
    return { ok: true };
  }

  /** Отправить browser push всем подписчикам (требует web-push и VAPID keys в env). */
  async sendBrowserPushToAll(title: string, body?: string): Promise<number> {
    const subs = await this.prisma.pushSubscription.findMany();
    if (subs.length === 0) return 0;
    let webPush: typeof import("web-push") | null = null;
    try {
      webPush = require("web-push");
    } catch {
      return 0;
    }
    if (!webPush) return 0;
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPublic || !vapidPrivate) return 0;
    try {
      webPush.setVapidDetails("mailto:admin@locus.app", vapidPublic, vapidPrivate);
    } catch {
      return 0;
    }
    let sent = 0;
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: s.endpoint,
              keys: { p256dh: s.p256dh, auth: s.auth },
            },
            JSON.stringify({ title, body: body ?? "" }),
          );
          sent++;
        } catch {
          // Subscription may be invalid
        }
      }),
    );
    return sent;
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
