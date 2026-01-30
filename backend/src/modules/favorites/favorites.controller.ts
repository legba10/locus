import { Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { FavoritesService } from "./favorites.service";

@ApiTags("favorites")
@Controller("favorites")
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: "Get user's favorite listings" })
  async getFavorites(@Req() req: any) {
    const userId = req.user.id;
    return this.favorites.getFavorites(userId);
  }

  @Post(":listingId")
  @ApiOperation({ summary: "Add listing to favorites" })
  async addFavorite(@Req() req: any, @Param("listingId") listingId: string) {
    const userId = req.user.id;
    return this.favorites.addFavorite(userId, listingId);
  }

  @Delete(":listingId")
  @ApiOperation({ summary: "Remove listing from favorites" })
  async removeFavorite(@Req() req: any, @Param("listingId") listingId: string) {
    const userId = req.user.id;
    return this.favorites.removeFavorite(userId, listingId);
  }

  @Post(":listingId/toggle")
  @ApiOperation({ summary: "Toggle favorite status" })
  async toggleFavorite(@Req() req: any, @Param("listingId") listingId: string) {
    const userId = req.user.id;
    return this.favorites.toggleFavorite(userId, listingId);
  }

  @Get(":listingId/check")
  @ApiOperation({ summary: "Check if listing is favorited" })
  async checkFavorite(@Req() req: any, @Param("listingId") listingId: string) {
    const userId = req.user.id;
    const isFavorite = await this.favorites.isFavorite(userId, listingId);
    return { isFavorite };
  }
}
