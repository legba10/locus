import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class TelegramAuthController {
  @Post("telegram")
  async telegram(@Body() body: any) {
    // eslint-disable-next-line no-console
    console.log("TELEGRAM BODY:", body);
    return { ok: true, body };
  }
}
