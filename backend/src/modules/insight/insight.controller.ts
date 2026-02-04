import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InsightService } from './insight.service';

@ApiTags('insight')
@Controller()
export class InsightController {
  constructor(private readonly insight: InsightService) {}

  // ==========================================
  // AI-анализ объявления (публичный)
  // ==========================================

  @Get('listings/:id/insight')
  @ApiOperation({ summary: 'Получить AI-анализ объявления' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async getListingInsight(@Param('id') id: string) {
    return this.insight.getListingInsight(id);
  }

  // ==========================================
  // Кабинет владельца жилья
  // ==========================================

  @Get('owners/:id/dashboard')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('user', 'landlord')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить данные кабинета владельца' })
  @ApiParam({ name: 'id', description: 'ID владельца' })
  async getOwnerDashboard(@Param('id') id: string, @Req() req: any) {
    // Проверяем права: свои данные или админ
    const userId = req.user.id;
    if (userId !== id) {
      return this.insight.getOwnerDashboard(userId);
    }
    
    return this.insight.getOwnerDashboard(id);
  }

  @Get('owner/dashboard')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('user', 'landlord')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Кабинет владельца жилья (текущий пользователь)' })
  async getMyDashboard(@Req() req: any) {
    return this.insight.getOwnerDashboard(req.user.id);
  }

  // ==========================================
  // Обзор рынка (публичный)
  // ==========================================

  @Get('market/overview')
  @ApiOperation({ summary: 'Обзор рынка аренды' })
  @ApiQuery({ name: 'city', required: false, description: 'Фильтр по городу' })
  async getMarketOverview(@Query('city') city?: string) {
    return this.insight.getMarketOverview(city);
  }
}
