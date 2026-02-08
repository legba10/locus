import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

const BACKEND_VERSION = process.env.npm_package_version ?? "0.1.0";
const BUILD_DATE = process.env.BUILD_DATE ?? process.env.VERCEL_BUILD_DATE ?? new Date().toISOString();

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: "Health check — version and build date for deploy sync" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  getHealth() {
    return {
      ok: true,
      service: "locus-backend",
      version: BACKEND_VERSION,
      buildDate: BUILD_DATE,
      timestamp: new Date().toISOString(),
    };
  }
}

