import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: "Create review + metrics and update aggregates" })
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async create(@Req() req: any, @Body() dto: CreateReviewDto) {
    const out = await this.reviews.createReview(req.user.id, req.user.email, dto);
    return { ok: true, ...out };
  }

  @Get("listing/:listingId/metrics")
  @ApiOperation({ summary: "Get cached metric aggregates for listing" })
  async metrics(@Param("listingId") listingId: string) {
    const items = await this.reviews.getListingMetrics(listingId);
    return { ok: true, items };
  }

  @Get("listing/:listingId")
  @ApiOperation({ summary: "Get latest reviews for listing" })
  async list(
    @Param("listingId") listingId: string,
    @Query("limit") limit?: string
  ) {
    const items = await this.reviews.getListingReviews(listingId, limit ? Number(limit) : 10);
    return { ok: true, items };
  }
}

