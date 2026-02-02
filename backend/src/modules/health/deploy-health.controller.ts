import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class DeployHealthController {
  @Get()
  health() {
    return {
      ok: true,
      status: "ok",
      service: "locus-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
