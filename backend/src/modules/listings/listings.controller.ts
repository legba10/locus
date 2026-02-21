import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Res } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { Response } from "express";
import { randomUUID } from "crypto";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ModerationGuard } from "../auth/guards/moderation.guard";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { UpdateListingStatusDto } from "./dto/update-listing-status.dto";
import { ListingsService } from "./listings.service";
import { ListingsPhotosService } from "./listings-photos.service";
import { ReviewsService } from "../reviews/reviews.service";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(
    private readonly listings: ListingsService,
    private readonly photosService: ListingsPhotosService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all published listings" })
  @ApiQuery({ name: "city", required: false })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getAll(
    @Query("city") city?: string,
    @Query("limit") limit?: string,
  ) {
    const limitNum = limit ? Number(limit) : 12;
    const { items, total } = await this.listings.getAll({
      city,
      limit: limitNum,
    });
    return {
      ok: true,
      data: items,
      items, // backward compatibility
      total,
    };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Get("my")
  @ApiOperation({ summary: "Get listings for current landlord" })
  async getMine(@Req() req: any) {
    return this.listings.getMine(req.user.id);
  }

  @Get(":id/review-analytics")
  @ApiOperation({ summary: "ТЗ-10: Review analytics for AI (rating, metrics, review_count, positive_ratio)" })
  async getReviewAnalytics(@Param("id") id: string) {
    return this.reviewsService.getReviewAnalytics(id);
  }

  @Get(":id")
  async getOne(@Req() req: any, @Res({ passthrough: true }) res: Response, @Param("id") id: string) {
    let sessionId = req.cookies?.locus_view_session as string | undefined;
    if (!sessionId) {
      sessionId = randomUUID();
      res.cookie("locus_view_session", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }
    const listing = await this.listings.getById(id, { sessionId, userId: req.user?.id });
    return { listing };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() dto: CreateListingDto) {
    // Any authenticated user can create 1 FREE listing (limit enforced by listing_used/listing_limit).
    const listing = await this.listings.create(req.user.id, dto, {
      email: req.user.email,
      profile: req.user.profile,
    });
    return { listing };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Patch(":id")
  async update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateListingDto) {
    return { item: await this.listings.update(req.user.id, id, dto) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, ModerationGuard)
  @Patch(":id/status")
  async updateStatusByAdmin(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateListingStatusDto
  ) {
    return {
      item: await this.listings.updateStatusByAdmin(
        req.user.id,
        id,
        dto.status,
        dto.moderation_note ?? null
      ),
    };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    return await this.listings.delete(req.user.id, id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Post(":id/publish")
  async publish(@Req() req: any, @Param("id") id: string) {
    return { item: await this.listings.publish(req.user.id, id) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Post(":id/unpublish")
  async unpublish(@Req() req: any, @Param("id") id: string) {
    return { item: await this.listings.unpublish(req.user.id, id) };
  }

  // ===========================================
  // PHOTOS ENDPOINTS
  // ===========================================

  @Get(":id/photos")
  @ApiOperation({ summary: "Get all photos for a listing" })
  async getPhotos(@Param("id") id: string) {
    return { photos: await this.photosService.getPhotos(id) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Post(":id/photos")
  @ApiOperation({ summary: "Upload a photo for a listing" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        sortOrder: {
          type: "number",
          default: 0,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadPhoto(
    @Req() req: any,
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      })
    )
    file: any,
    @Body("sortOrder") sortOrder?: string,
  ) {
    const photo = await this.photosService.uploadPhoto(
      id,
      req.user.id,
      file,
      sortOrder ? parseInt(sortOrder, 10) : 0,
    );
    return { photo };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Delete(":id/photos/:photoId")
  @ApiOperation({ summary: "Delete a photo from a listing" })
  async deletePhoto(@Req() req: any, @Param("photoId") photoId: string) {
    return await this.photosService.deletePhoto(photoId, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Patch(":id/photos/:photoId/order")
  @ApiOperation({ summary: "Update photo sort order" })
  async updatePhotoOrder(
    @Req() req: any,
    @Param("photoId") photoId: string,
    @Body("sortOrder") sortOrder: number,
  ) {
    return { photo: await this.photosService.updatePhotoOrder(photoId, req.user.id, sortOrder) };
  }
}

