import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TariffGuard } from '../auth/guards/tariff.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Tariffs } from '../auth/decorators/tariff.decorator';
import { LandlordService, LandlordDashboardResponse } from './landlord.service';

@ApiTags('landlord')
@Controller('landlord')
@UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
@ApiBearerAuth()
export class LandlordController {
  constructor(private readonly landlord: LandlordService) {}

  @Get('dashboard')
  @Roles('host', 'admin')
  @Tariffs('landlord_basic', 'landlord_pro')
  @ApiOperation({ summary: 'Получить данные дашборда арендодателя' })
  @ApiResponse({
    status: 200,
    description: 'Данные дашборда с аналитикой LOCUS',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalListings: { type: 'number' },
            publishedListings: { type: 'number' },
            avgLocusRating: { type: 'number' },
            revenue30d: { type: 'number' },
            pendingBookings: { type: 'number' },
            riskLevel: { type: 'string' },
          },
        },
        properties: { type: 'array' },
        recommendations: { type: 'array', items: { type: 'string' } },
        recentBookings: { type: 'array' },
      },
    },
  })
  async getDashboard(@Req() req: any): Promise<LandlordDashboardResponse> {
    return this.landlord.getDashboard(req.user.id);
  }

  @Post('dashboard/refresh')
  @Roles('host', 'admin')
  @Tariffs('landlord_basic', 'landlord_pro')
  @ApiOperation({ summary: 'Пересчитать аналитику LOCUS для всех объектов' })
  @ApiResponse({ status: 200, description: 'Аналитика обновлена' })
  async refreshAnalytics(@Req() req: any): Promise<{ success: boolean; message: string }> {
    await this.landlord.recalculateAnalytics(req.user.id);
    return { success: true, message: 'Аналитика обновлена' };
  }

  // Алиасы для совместимости с host endpoint
  @Get('intelligence')
  @Roles('host', 'admin')
  @Tariffs('landlord_basic', 'landlord_pro')
  @ApiOperation({ summary: 'Алиас для dashboard (совместимость)' })
  async getIntelligence(@Req() req: any): Promise<LandlordDashboardResponse> {
    return this.landlord.getDashboard(req.user.id);
  }
}
