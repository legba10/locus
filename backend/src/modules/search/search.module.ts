import { Module } from "@nestjs/common";
import { AiOrchestratorModule } from "../ai-orchestrator/ai-orchestrator.module";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  imports: [AiOrchestratorModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

