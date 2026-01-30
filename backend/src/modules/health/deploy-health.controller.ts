import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("api")
export class DeployHealthController {
  @Get("health")
  getDeployHealth() {
    const envRaw = (process.env.APP_ENV || "LOCAL").toUpperCase();
    const env = envRaw === "PROD" || envRaw === "STAGING" ? envRaw : "LOCAL";
    return {
      status: "ok",
      env,
      flags: {
        TELEGRAM_ENABLED: process.env.TELEGRAM_ENABLED === "true",
        AI_ENABLED: process.env.AI_ENABLED === "true",
        REAL_AUTH_ENABLED: process.env.REAL_AUTH_ENABLED === "true",
        REAL_PIPELINE_ENABLED: process.env.REAL_PIPELINE_ENABLED === "true",
      },
      integrations: {
        telegram: process.env.TELEGRAM_ENABLED === "true",
        ai: process.env.AI_ENABLED === "true",
        auth: process.env.REAL_AUTH_ENABLED === "true",
      },
    };
  }
}
