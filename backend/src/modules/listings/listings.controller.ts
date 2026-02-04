import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Res } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { Response } from "express";
import { randomUUID } from "crypto";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TariffGuard } from "../auth/guards/tariff.guard";
import { RequireLandlord } from "../auth/decorators/require-landlord.decorator";
import { RequireTariff } from "../auth/decorators/require-tariff.decorator";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { ListingsService } from "./listings.service";
import { ListingsPhotosService } from "./listings-photos.service";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(
    private readonly listings: ListingsService,
    private readonly photosService: ListingsPhotosService,
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
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
  @Get("my")
  @ApiOperation({ summary: "Get listings for current landlord" })
  async getMine(@Req() req: any) {
    return this.listings.getMine(req.user.id);
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
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() dto: CreateListingDto) {
    // Pass user ID (Supabase) and email for Neon FK relationship
    const listing = await this.listings.create(req.user.id, dto, req.user.email);
    return { listing };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
  @Patch(":id")
  async update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateListingDto) {
    return { item: await this.listings.update(req.user.id, id, dto) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    return await this.listings.delete(req.user.id, id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
  @Post(":id/publish")
  async publish(@Req() req: any, @Param("id") id: string) {
    return { item: await this.listings.publish(req.user.id, id) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
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
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
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
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
  @Delete(":id/photos/:photoId")
  @ApiOperation({ summary: "Delete a photo from a listing" })
  async deletePhoto(@Req() req: any, @Param("photoId") photoId: string) {
    return await this.photosService.deletePhoto(photoId, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
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

