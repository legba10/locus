import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { HostService, HostIntelligenceResponse } from './host.service';

@ApiTags('host')
@Controller('host')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Get('intelligence')
  @Roles('landlord')
  @ApiOperation({ summary: 'Get host intelligence dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Host intelligence summary with property profiles and recommendations',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalListings: { type: 'number' },
            revenueForecast: { type: 'number' },
            occupancyForecast: { type: 'number' },
            riskLevel: { type: 'string' },
            overallHealth: { type: 'string' },
          },
        },
        properties: { type: 'array' },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getIntelligence(@Req() req: any): Promise<HostIntelligenceResponse> {
    const userId = req.user.id;
    return this.hostService.getHostIntelligence(userId);
  }

  @Post('intelligence/recalculate')
  @Roles('landlord')
  @ApiOperation({ summary: 'Recalculate AI profiles for all host properties' })
  @ApiResponse({ status: 200, description: 'Recalculation completed' })
  async recalculateIntelligence(@Req() req: any): Promise<{ success: boolean; message: string }> {
    const userId = req.user.id;
    await this.hostService.recalculateAll(userId);
    return { success: true, message: 'Intelligence recalculated for all properties' };
  }

  @Get('overview')
  @Roles('landlord')
  @ApiOperation({ summary: 'Get host dashboard overview' })
  async getOverview(@Req() req: any) {
    const userId = req.user.id;
    return this.hostService.getOverview(userId);
  }
}
