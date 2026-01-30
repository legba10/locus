import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InsightEngine } from './engines/insight.engine';
import { MarketEngine } from './engines/market.engine';
import { RecommendationEngine } from './engines/recommendation.engine';

@ApiTags('ai')
@Controller()
export class AiCoreController {
  constructor(
    private readonly insight: InsightEngine,
    private readonly market: MarketEngine,
    private readonly recommendations: RecommendationEngine,
  ) {}

  // ==========================================
  // Insight для объявления (публичный)
  // ==========================================

  @Get('listings/:id/insight')
  @ApiOperation({ summary: 'AI-анализ объявления' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async getListingInsight(@Param('id') id: string) {
    return this.insight.getListingInsight(id);
  }

  // ==========================================
  // Insight для владельца
  // ==========================================

  @Get('owners/:id/insight')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('guest', 'host', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI-анализ объявлений владельца' })
  @ApiParam({ name: 'id', description: 'ID владельца' })
  async getOwnerInsight(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const userRoles = req.user.roles || [];
    
    // Проверка прав: свои данные или админ
    if (userId !== id && !userRoles.includes('admin')) {
      return this.insight.getOwnerInsight(userId);
    }
    
    return this.insight.getOwnerInsight(id);
  }

  @Get('owner/insight')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('guest', 'host', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI-анализ для текущего владельца' })
  async getMyInsight(@Req() req: any) {
    return this.insight.getOwnerInsight(req.user.id);
  }

  // ==========================================
  // Обзор рынка
  // ==========================================

  @Get('market/insight')
  @ApiOperation({ summary: 'AI-обзор рынка' })
  @ApiQuery({ name: 'city', required: false, description: 'Фильтр по городу' })
  async getMarketInsight(@Query('city') city?: string) {
    return this.market.getMarketInsight(city);
  }

  // ==========================================
  // Рекомендации
  // ==========================================

  @Get('recommendations')
  @ApiOperation({ summary: 'Рекомендованные объявления' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'guests', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendations(
    @Query('city') city?: string,
    @Query('maxPrice') maxPrice?: number,
    @Query('guests') guests?: number,
    @Query('limit') limit?: number,
  ) {
    return this.recommendations.getRecommendedListings({
      city,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      guests: guests ? Number(guests) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
