import { Injectable } from "@nestjs/common";
import { UserRoleEnum } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";

export const NotificationType = {
  NEW_LISTING_PENDING: "NEW_LISTING_PENDING",
  LISTING_SUBMITTED: "LISTING_SUBMITTED",
  LISTING_APPROVED: "LISTING_APPROVED",
  LISTING_REJECTED: "LISTING_REJECTED",
  NEW_BOOKING: "NEW_BOOKING",
  NEW_MESSAGE: "NEW_MESSAGE",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  /** ТЗ-8: напоминание оставить отзыв после проживания */
  REVIEW_REMINDER: "REVIEW_REMINDER",
} as const;

@Injectable()
export class NotificationsService {
  private readonly onlineUsers = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async create(
    userId: string,
    type: string,
    title: string,
    text?: string | null,
    meta?: Record<string, unknown> | null,
    opts?: { link?: string | null; entityId?: string | null; skipPush?: boolean },
  ) {
    const entityId = opts?.entityId ?? null;
    const dedupSince = new Date(Date.now() - 5000);
    if (entityId) {
      const duplicate = await this.prisma.notification.findFirst({
        where: {
          userId,
          type,
          entityId,
          createdAt: { gte: dedupSince },
        },
        select: { id: true },
      });
      if (duplicate) return duplicate;
    }

    const created = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        text: text ?? null,
        body: text ?? null,
        link: opts?.link ?? null,
        entityId,
        meta: meta ?? undefined,
        isRead: false,
        isSeen: false,
        read: false,
      },
    });

    this.emitNew(userId, created);
    if (!opts?.skipPush && !this.isUserOnline(userId)) {
      await this.sendBrowserPushToUser(userId, title, text ?? undefined);
    }
    return created;
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

  /** Отправить browser push одному пользователю (ТЗ-8: пуш после проживания). */
  async sendBrowserPushToUser(userId: string, title: string, body?: string): Promise<boolean> {
    const subs = await this.prisma.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return false;
    let webPush: typeof import("web-push") | null = null;
    try {
      webPush = require("web-push");
    } catch {
      return false;
    }
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPublic || !vapidPrivate) return false;
    try {
      webPush.setVapidDetails("mailto:admin@locus.app", vapidPublic, vapidPrivate);
    } catch {
      return false;
    }
    for (const s of subs) {
      try {
        await webPush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body: body ?? "" }),
        );
        return true;
      } catch {
        // skip invalid subscription
      }
    }
    return false;
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
    await this.pruneOld(userId);
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isSeen: false },
    });
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true, isRead: true, isSeen: true },
    });
    this.emitRead(userId, id);
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true, isRead: true, isSeen: true },
    });
    this.emitReadAll(userId);
  }

  async markSeenAll(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isSeen: false },
      data: { isSeen: true },
    });
    this.events.emit(`notifications.user.${userId}`, { event: "notification:seen_all" });
  }

  setUserPresence(userId: string, online: boolean) {
    if (!userId) return;
    if (online) {
      this.onlineUsers.set(userId, Date.now());
      return;
    }
    this.onlineUsers.delete(userId);
  }

  touchUserPresence(userId: string) {
    if (!userId) return;
    this.onlineUsers.set(userId, Date.now());
  }

  isUserOnline(userId: string) {
    const ts = this.onlineUsers.get(userId);
    if (!ts) return false;
    const alive = Date.now() - ts < 60_000;
    if (!alive) this.onlineUsers.delete(userId);
    return alive;
  }

  private emitNew(userId: string, n: { id: string; type: string; title: string; text: string | null; link: string | null; createdAt: Date }) {
    this.events.emit(`notifications.user.${userId}`, {
      event: "notification:new",
      payload: {
        id: n.id,
        title: n.title,
        text: n.text ?? "",
        link: n.link ?? null,
        type: n.type,
        createdAt: n.createdAt,
      },
    });
  }

  private emitRead(userId: string, id: string) {
    this.events.emit(`notifications.user.${userId}`, {
      event: "notification:read",
      payload: { id },
    });
  }

  private emitReadAll(userId: string) {
    this.events.emit(`notifications.user.${userId}`, {
      event: "notification:read_all",
      payload: {},
    });
  }

  private async pruneOld(userId: string) {
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.prisma.notification.deleteMany({
      where: {
        userId,
        createdAt: { lt: threshold },
      },
    });
  }

  /** ТЗ-8: создать уведомление «Оставьте отзыв» и отправить пуш после проживания */
  async createReviewReminder(userId: string, listingTitle?: string, listingId?: string): Promise<void> {
    const title = "Как прошло проживание?";
    const body = listingTitle
      ? `Оставьте отзыв по «${listingTitle.slice(0, 40)}${listingTitle.length > 40 ? "…" : ""}»`
      : "Оставьте отзыв — это поможет другим выбрать жильё";
    await this.create(userId, NotificationType.REVIEW_REMINDER, title, body, listingId ? { listingId } : null, {
      entityId: listingId ?? null,
    });
  }

  /** ТЗ-8: отправить пуши «Оставьте отзыв» гостям с завершённым проживанием (вызывать по крону, например раз в день) */
  async sendReviewRemindersForPastBookings(): Promise<{ sent: number }> {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        checkOut: { lt: twoDaysAgo, gte: fourteenDaysAgo },
      },
      include: {
        listing: { select: { id: true, title: true } },
      },
    });

    let sent = 0;
    for (const b of bookings) {
      const hasReview = await this.prisma.review.findUnique({
        where: { listingId_authorId: { listingId: b.listingId, authorId: b.guestId } },
      });
      if (hasReview) continue;

      const alreadySent = await this.prisma.notification.findFirst({
        where: {
          userId: b.guestId,
          type: NotificationType.REVIEW_REMINDER,
          createdAt: { gte: sevenDaysAgo },
          meta: { equals: { listingId: b.listingId } },
        },
      });
      if (alreadySent) continue;

      await this.createReviewReminder(b.guestId, b.listing.title, b.listing.id);
      sent++;
    }
    return { sent };
  }
}
