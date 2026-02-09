import { Body, Controller, Get, Post, Param, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

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

  @Get()
  @ApiOperation({ summary: "Get current user notifications" })
  async list(@Req() req: any) {
    const userId = req.user?.id as string;
    return this.notifications.getForUser(userId);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread count" })
  async unreadCount(@Req() req: any) {
    const userId = req.user?.id as string;
    const count = await this.notifications.getUnreadCount(userId);
    return { count };
  }

  @Post(":id/read")
  @ApiOperation({ summary: "Mark one as read" })
  async markRead(@Req() req: any, @Param("id") id: string) {
    const userId = req.user?.id as string;
    await this.notifications.markRead(id, userId);
    return { ok: true };
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all as read" })
  async markAllRead(@Req() req: any) {
    const userId = req.user?.id as string;
    await this.notifications.markAllRead(userId);
    return { ok: true };
  }
}
