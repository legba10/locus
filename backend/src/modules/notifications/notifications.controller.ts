import { Controller, Get, Post, Param, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

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
