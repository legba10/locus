import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DecisionService } from './decision.service';

@ApiTags('decision')
@Controller()
export class DecisionController {
  constructor(private readonly decisionService: DecisionService) {}

  /**
   * GET /api/listings/:id/insight
   * Получить упрощённый insight
   */
  @Get('listings/:id/insight')
  @ApiOperation({ summary: 'Получить анализ объявления' })
  async getInsight(@Param('id') id: string) {
    return this.decisionService.getInsight(id);
  }
}
