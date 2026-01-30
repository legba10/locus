import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";
import { SearchQueryDto, SearchBodyDto } from "./dto/search-query.dto";
import { SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Search listings with filters" })
  async getSearch(@Query() query: SearchQueryDto) {
    return this.search.search(query);
  }

  @Post()
  @ApiOperation({ summary: "Advanced search with AI scoring" })
  @ApiBody({ type: SearchBodyDto })
  async postSearch(@Body() body: SearchBodyDto) {
    return this.search.searchAdvanced(body);
  }
}

