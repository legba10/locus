import { Controller, Get, Post, Param, Query, UseGuards, Req, ForbiddenException, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ListingStatus } from '@prisma/client';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Check if user is admin
   */
  private checkAdmin(req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats (admin only)' })
  async getStats(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getStats();
  }

  @Get('listings/pending')
  @ApiOperation({ summary: 'Get listings pending moderation (admin only)' })
  async getPendingListings(@Req() req: any, @Query('limit') limit?: string) {
    this.checkAdmin(req);
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
    this.checkAdmin(req);
    return this.adminService.getAllListings({
      status,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post('listings/:id/approve')
  @ApiOperation({ summary: 'Approve a listing (admin only)' })
  async approveListing(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    const listing = await this.adminService.approveListing(id);
    return { ok: true, listing };
  }

  @Post('listings/:id/reject')
  @ApiOperation({ summary: 'Reject a listing (admin only)' })
  async rejectListing(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    this.checkAdmin(req);
    const listing = await this.adminService.rejectListing(id, reason);
    return { ok: true, listing };
  }

  @Post('listings/:id/block')
  @ApiOperation({ summary: 'Block a listing (admin only)' })
  async blockListing(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    const listing = await this.adminService.blockListing(id);
    return { ok: true, listing };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async getAllUsers(@Req() req: any, @Query('limit') limit?: string) {
    this.checkAdmin(req);
    return this.adminService.getAllUsers(limit ? parseInt(limit, 10) : 50);
  }
}
