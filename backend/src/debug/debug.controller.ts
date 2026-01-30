import { Controller, Get } from "@nestjs/common";

@Controller("debug")
export class DebugController {
  @Get("integrations")
  getIntegrations() {
    return {
      telegram: process.env.TELEGRAM_ENABLED === "true",
      ai: process.env.AI_ENABLED === "true",
      auth: process.env.REAL_AUTH_ENABLED === "true",
    };
  }
}
