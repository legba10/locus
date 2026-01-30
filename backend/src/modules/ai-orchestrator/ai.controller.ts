import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AiOrchestratorService } from "./ai-orchestrator.service";
import { AiAssistantRequestDto } from "./dto/ai-assistant.dto";
import { AiPropertyRequestDto } from "./dto/ai-property.dto";
import { AiSearchRequestDto } from "./dto/ai-search.dto";

@ApiTags("ai")
@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiOrchestratorService) {}

  @Post("search")
  async search(@Body() dto: AiSearchRequestDto) {
    return this.ai.search(dto);
  }

  @Post("quality")
  async quality(@Body() dto: AiPropertyRequestDto) {
    return this.ai.quality(dto);
  }

  @Post("pricing")
  async pricing(@Body() dto: AiPropertyRequestDto) {
    return this.ai.pricing(dto);
  }

  @Post("risk")
  async risk(@Body() dto: AiPropertyRequestDto) {
    return this.ai.risk(dto);
  }

  @Post("recommendations")
  async recommendations(@Body() dto: AiPropertyRequestDto) {
    return this.ai.recommendations(dto);
  }

  @Post("assistant")
  async assistant(@Body() dto: AiAssistantRequestDto) {
    return this.ai.assistant(dto);
  }
}

