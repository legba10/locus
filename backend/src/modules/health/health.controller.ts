import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  getHealth() {
    return {
      ok: true,
      service: "locus-backend",
      timestamp: new Date().toISOString(),
    };
  }
}

