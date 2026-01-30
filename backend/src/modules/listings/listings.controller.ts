import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
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
    const items = await this.listings.getAll({
      city,
      limit: limit ? Number(limit) : undefined,
    });
    return { items };
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return { item: await this.listings.getById(id) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateListingDto) {
    return { item: await this.listings.create(req.user.id, dto) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Patch(":id")
  async update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateListingDto) {
    return { item: await this.listings.update(req.user.id, id, dto) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Post(":id/publish")
  async publish(@Req() req: any, @Param("id") id: string) {
    return { item: await this.listings.publish(req.user.id, id) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
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
  @UseGuards(SupabaseAuthGuard)
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
  @UseGuards(SupabaseAuthGuard)
  @Delete(":id/photos/:photoId")
  @ApiOperation({ summary: "Delete a photo from a listing" })
  async deletePhoto(@Req() req: any, @Param("photoId") photoId: string) {
    return await this.photosService.deletePhoto(photoId, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
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

