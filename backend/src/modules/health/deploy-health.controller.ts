import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("api")
export class DeployHealthController {
  @Get()
  getApiHealth() {
    return {
      status: "ok",
      service: "locus-backend",
      db: "connected",
    };
  }
}
