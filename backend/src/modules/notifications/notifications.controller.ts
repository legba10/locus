import { Body, Controller, Get, Post, Param, UseGuards, Req, Sse, MessageEvent } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { NotificationsService } from "./notifications.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { fromEvent, map, Observable } from "rxjs";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly events: EventEmitter2,
  ) {}

  @Post("push-subscribe")
  @ApiOperation({ summary: "Register browser push subscription" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        subscription: {
          type: "object",
          properties: {
            endpoint: { type: "string" },
            keys: { type: "object", properties: { p256dh: { type: "string" }, auth: { type: "string" } } },
          },
        },
      },
      required: ["subscription"],
    },
  })
  async pushSubscribe(@Req() req: any, @Body("subscription") subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    const userId = req.user?.id as string;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return { ok: false, error: "Invalid subscription" };
    }
    await this.notifications.registerPushSubscription(userId, subscription);
    return { ok: true };
  }

  @Post("push/register")
  @ApiOperation({ summary: "Alias: register browser push subscription" })
  async pushRegisterAlias(@Req() req: any, @Body("subscription") subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.pushSubscribe(req, subscription);
  }

  @Get()
  @ApiOperation({ summary: "Get current user notifications" })
  async list(@Req() req: any) {
    const userId = req.user?.id as string;
    const items = await this.notifications.getForUser(userId);
    return items.map((n: any) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      text: n.text ?? n.body ?? null,
      link: n.link ?? null,
      entityId: n.entityId ?? null,
      isRead: Boolean(n.isRead ?? n.read),
      isSeen: Boolean(n.isSeen ?? n.read),
      createdAt: n.createdAt,
    }));
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread count" })
  async unreadCount(@Req() req: any) {
    const userId = req.user?.id as string;
    const count = await this.notifications.getUnreadCount(userId);
    return { count };
  }

  @Get("unread")
  @ApiOperation({ summary: "Alias for unread count" })
  async unreadAlias(@Req() req: any) {
    return this.unreadCount(req);
  }

  @Post(":id/read")
  @ApiOperation({ summary: "Mark one as read" })
  async markRead(@Req() req: any, @Param("id") id: string) {
    const userId = req.user?.id as string;
    await this.notifications.markRead(id, userId);
    return { ok: true };
  }

  @Post("read")
  @ApiOperation({ summary: "Mark one as read by payload id" })
  async markReadByBody(@Req() req: any, @Body("id") id: string) {
    const userId = req.user?.id as string;
    if (!id) return { ok: false };
    await this.notifications.markRead(id, userId);
    return { ok: true };
  }

  @Post("seen-all")
  @ApiOperation({ summary: "Mark all unseen as seen" })
  async markAllSeen(@Req() req: any) {
    const userId = req.user?.id as string;
    await this.notifications.markSeenAll(userId);
    return { ok: true };
  }

  @Post("presence")
  @ApiOperation({ summary: "Update notification presence (online/offline heartbeat)" })
  async setPresence(@Req() req: any, @Body("online") online?: boolean) {
    const userId = req.user?.id as string;
    if (online === false) this.notifications.setUserPresence(userId, false);
    else this.notifications.touchUserPresence(userId);
    return { ok: true };
  }

  @Sse("stream")
  @ApiOperation({ summary: "Realtime notifications stream (SSE)" })
  stream(@Req() req: any): Observable<MessageEvent> {
    const userId = req.user?.id as string;
    this.notifications.setUserPresence(userId, true);
    return fromEvent<any>(this.events, `notifications.user.${userId}`).pipe(
      map((evt) => ({ data: evt }))
    );
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all as read" })
  async markAllRead(@Req() req: any) {
    const userId = req.user?.id as string;
    await this.notifications.markAllRead(userId);
    return { ok: true };
  }

  /** ТЗ-8: отправить пуши «Оставьте отзыв» по завершённым бронированиям (для вызова кроном) */
  @Post("send-review-reminders")
  @ApiOperation({ summary: "Send review reminder push to guests with past stays (cron)" })
  async sendReviewReminders() {
    const result = await this.notifications.sendReviewRemindersForPastBookings();
    return { ok: true, sent: result.sent };
  }
}
