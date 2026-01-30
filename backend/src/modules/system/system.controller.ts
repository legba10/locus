import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SystemService, SystemStatus } from './system.service';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-01-26T12:00:00Z' },
        version: { type: 'string', example: '1.0.0' },
        services: {
          type: 'object',
          properties: {
            backend: { type: 'string', example: 'ok' },
            database: { type: 'string', example: 'ok' },
            ai: { type: 'string', example: 'ok' },
            storage: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  async getStatus(): Promise<SystemStatus> {
    return this.system.getStatus();
  }

  @Get('health')
  @ApiOperation({ summary: 'Simple health check (for load balancers)' })
  @ApiResponse({ status: 200, description: 'OK' })
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
