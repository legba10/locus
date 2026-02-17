import { Controller, Get, Post, Param, Query, UseGuards, Req, ForbiddenException, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ListingStatus, UserRoleEnum } from '@prisma/client';
import { ModerationGuard } from '../auth/guards/moderation.guard';
import { ROOT_ADMIN_EMAIL } from '../auth/constants';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(SupabaseAuthGuard, ModerationGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** Only root admin (legba086@mail.ru) can set roles. */
  private ensureRootAdmin(req: any) {
    const email = (req.user?.email ?? '').trim().toLowerCase();
    if (email !== ROOT_ADMIN_EMAIL.trim().toLowerCase()) {
      throw new ForbiddenException('Only root admin can set roles');
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats (admin only)' })
  async getStats(@Req() req: any) {
    return this.adminService.getStats();
  }

  @Get('stats/charts')
  @ApiOperation({ summary: 'Get dashboard charts data (admin only)' })
  async getStatsCharts(@Req() req: any, @Query('days') days?: string) {
    return this.adminService.getStatsCharts(days ? parseInt(days, 10) : 30);
  }

  @Get('stats/revenue-chart')
  @ApiOperation({ summary: 'Revenue by day (30 days)' })
  async getRevenueChart(@Req() req: any, @Query('days') days?: string) {
    const charts = await this.adminService.getStatsCharts(days ? parseInt(days, 10) : 30);
    return charts.revenue;
  }

  @Get('stats/users-chart')
  @ApiOperation({ summary: 'New users by day (30 days)' })
  async getUsersChart(@Req() req: any, @Query('days') days?: string) {
    const charts = await this.adminService.getStatsCharts(days ? parseInt(days, 10) : 30);
    return charts.newUsers;
  }

  @Get('stats/bookings-chart')
  @ApiOperation({ summary: 'Bookings by day (30 days)' })
  async getBookingsChart(@Req() req: any, @Query('days') days?: string) {
    const charts = await this.adminService.getStatsCharts(days ? parseInt(days, 10) : 30);
    return charts.bookings;
  }

  @Get('stats/activity')
  @ApiOperation({ summary: 'Last 10 activity events (admin only)' })
  async getActivity(@Req() req: any, @Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(limit ? parseInt(limit, 10) : 10);
  }

  @Get('listings/pending')
  @ApiOperation({ summary: 'Get listings pending moderation (admin only)' })
  async getPendingListings(@Req() req: any, @Query('limit') limit?: string) {
    return this.adminService.getPendingListings(limit ? parseInt(limit, 10) : 50);
  }

  /** Alias for GET /admin/listings/pending (API contract: GET /admin/moderation) */
  @Get('moderation')
  @ApiOperation({ summary: 'Get moderation queue (same as listings/pending)' })
  async getModeration(@Req() req: any, @Query('limit') limit?: string) {
    return this.adminService.getPendingListings(limit ? parseInt(limit, 10) : 50);
  }

  @Get('listings')
  @ApiOperation({ summary: 'Get all listings (admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ListingStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllListings(
    @Req() req: any,
    @Query('status') status?: ListingStatus,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllListings({
      status,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post('listings/:id/approve')
  @ApiOperation({ summary: 'Approve a listing (admin/manager)' })
  async approveListing(@Req() req: any, @Param('id') id: string) {
    const listing = await this.adminService.approveListing(id, req.user.id);
    return { ok: true, listing };
  }

  @Post('listings/:id/reject')
  @ApiOperation({ summary: 'Reject a listing (admin/manager)' })
  async rejectListing(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const listing = await this.adminService.rejectListing(id, req.user.id, reason);
    return { ok: true, listing };
  }

  /** Alias: POST /admin/moderation/:id/approve */
  @Post('moderation/:id/approve')
  @ApiOperation({ summary: 'Approve listing (moderation)' })
  async moderationApprove(@Req() req: any, @Param('id') id: string) {
    const listing = await this.adminService.approveListing(id, req.user.id);
    return { ok: true, listing };
  }

  /** Alias: POST /admin/moderation/:id/reject */
  @Post('moderation/:id/reject')
  @ApiOperation({ summary: 'Reject listing (moderation)' })
  async moderationReject(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const listing = await this.adminService.rejectListing(id, req.user.id, reason);
    return { ok: true, listing };
  }

  @Post('listings/:id/block')
  @ApiOperation({ summary: 'Block a listing (admin only)' })
  async blockListing(@Req() req: any, @Param('id') id: string) {
    const listing = await this.adminService.blockListing(id);
    return { ok: true, listing };
  }

  @Post('listings/:id/delete')
  @ApiOperation({ summary: 'Delete a listing (admin only)' })
  async deleteListing(@Req() req: any, @Param('id') id: string) {
    await this.adminService.deleteListing(id);
    return { ok: true, deleted: id };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async getAllUsers(@Req() req: any, @Query('limit') limit?: string) {
    return this.adminService.getAllUsers(limit ? parseInt(limit, 10) : 50);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings (admin only)' })
  async getBookings(@Req() req: any, @Query('limit') limit?: string) {
    return this.adminService.getBookings(limit ? parseInt(limit, 10) : 50);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get all conversations (admin only)' })
  async getChats(@Req() req: any, @Query('limit') limit?: string) {
    return this.adminService.getConversations(limit ? parseInt(limit, 10) : 50);
  }

  @Post('push')
  @ApiOperation({ summary: 'Send notification to all users (admin push)' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, body: { type: 'string' }, link: { type: 'string' } }, required: ['title'] } })
  async pushToAll(@Req() req: any, @Body('title') title: string, @Body('body') body?: string, @Body('link') link?: string) {
    const text = [body, link ? `Ссылка: ${link}` : ''].filter(Boolean).join('\n');
    return this.adminService.pushToAll(title || 'Уведомление', text || undefined);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user (admin only)' })
  async banUser(@Req() req: any, @Param('id') id: string) {
    await this.adminService.banUser(id);
    return { ok: true, userId: id };
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Unban user (admin only)' })
  async unbanUser(@Req() req: any, @Param('id') id: string) {
    await this.adminService.unbanUser(id);
    return { ok: true, userId: id };
  }

  @Post('set-role')
  @ApiOperation({ summary: 'Set user role (root admin only). Role: admin | manager | moderator | user' })
  @ApiBody({ schema: { type: 'object', properties: { userId: { type: 'string' }, role: { type: 'string', enum: ['admin', 'manager', 'moderator', 'user'] } }, required: ['userId', 'role'] } })
  async setRole(@Req() req: any, @Body('userId') userId: string, @Body('role') role: string) {
    this.ensureRootAdmin(req);
    if (!userId || !role) {
      throw new ForbiddenException('userId and role are required');
    }
    const r = role.toLowerCase();
    if (r === 'root') {
      throw new ForbiddenException('Cannot assign ROOT via API');
    }
    const appRole =
      r === 'admin' ? UserRoleEnum.ADMIN
      : r === 'manager' ? UserRoleEnum.MANAGER
      : r === 'moderator' ? UserRoleEnum.MODERATOR
      : UserRoleEnum.USER;
    await this.adminService.setUserRole(userId, appRole);
    return { ok: true, userId, role: appRole };
  }
}
