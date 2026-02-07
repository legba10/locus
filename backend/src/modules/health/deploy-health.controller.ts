import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

@ApiTags("health")
@Controller("health/deploy")
export class DeployHealthController {
  @Get()
  @SkipThrottle()
  health() {
    return {
      ok: true,
      status: "ok",
      service: "locus-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
