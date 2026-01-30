import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@Controller()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  /**
   * GET /api/listings/:id/insight
   * Получить AI-анализ объявления
   */
  @Get('listings/:id/insight')
  @ApiOperation({ summary: 'Получить AI-анализ объявления' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async getInsight(@Param('id') id: string) {
    return this.insightsService.getInsight(id);
  }

  /**
   * POST /api/listings/:id/insight/recalculate
   * Пересчитать AI-анализ
   */
  @Post('listings/:id/insight/recalculate')
  @ApiOperation({ summary: 'Пересчитать AI-анализ объявления' })
  @ApiParam({ name: 'id', description: 'ID объявления' })
  async recalculateInsight(@Param('id') id: string) {
    return this.insightsService.recalculateInsight(id);
  }
}
