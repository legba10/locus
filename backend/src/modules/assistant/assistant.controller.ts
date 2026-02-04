import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssistantService } from './assistant.service';

@ApiTags('assistant')
@Controller()
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  // ==========================================
  // Listing Analysis Endpoints
  // ==========================================

  @Get('listings/:id/analysis')
  @ApiOperation({ summary: 'Получить полный анализ объявления' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async getListingAnalysis(@Param('id') id: string) {
    return this.assistant.analyzeListing(id);
  }

  @Get('listings/:id/recommendations')
  @ApiOperation({ summary: 'Получить рекомендации по улучшению объявления' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async getListingRecommendations(@Param('id') id: string) {
    return this.assistant.suggestImprovements(id);
  }

  @Get('listings/:id/price-advice')
  @ApiOperation({ summary: 'Получить рекомендацию по цене' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async getPriceAdvice(@Param('id') id: string) {
    return this.assistant.recommendPrice(id);
  }

  @Get('listings/:id/explanation')
  @ApiOperation({ summary: 'Получить объяснение оценки LOCUS' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async getExplanation(@Param('id') id: string) {
    return this.assistant.explainListingScore(id);
  }

  // ==========================================
  // Landlord Insights Endpoints
  // ==========================================

  @Get('landlords/:id/insights')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('user', 'landlord')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить аналитику арендодателя' })
  @ApiParam({ name: 'id', description: 'ID арендодателя' })
  async getLandlordInsights(@Param('id') id: string, @Req() req: any) {
    // Проверяем, что пользователь запрашивает свои данные или является админом
    const userId = req.user.id;
    if (userId !== id) {
      return this.assistant.getLandlordInsights(userId);
    }

    return this.assistant.getLandlordInsights(id);
  }

  @Get('landlord/insights')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('user', 'landlord')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить аналитику текущего арендодателя' })
  async getMyInsights(@Req() req: any) {
    return this.assistant.getLandlordInsights(req.user.id);
  }

  // ==========================================
  // Market Overview Endpoints
  // ==========================================

  @Get('market/overview')
  @ApiOperation({ summary: 'Получить обзор рынка' })
  @ApiQuery({ name: 'city', required: false, description: 'Фильтр по городу' })
  async getMarketOverview(@Query('city') city?: string) {
    return this.assistant.getMarketOverview(city);
  }
}
