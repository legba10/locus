import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RequireLandlord } from "../auth/decorators/require-landlord.decorator";
import { RequireTariff } from "../auth/decorators/require-tariff.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TariffGuard } from "../auth/guards/tariff.guard";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingsService } from "./bookings.service";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles("user")
  @Post()
  async create(@Req() req: any, @Body() dto: CreateBookingDto) {
    const result = await this.bookings.create(req.user.id, dto);
    const item = 'booking' in result ? result.booking : result;
    const conversationId = 'conversationId' in result ? result.conversationId : null;
    return { item, conversationId };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Get(":id")
  async getOne(@Req() req: any, @Param("id") id: string) {
    return { item: await this.bookings.getByIdForUser(id, req.user.id) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, RolesGuard, TariffGuard)
  @RequireLandlord()
  @RequireTariff("landlord_basic", "landlord_pro")
  @Post(":id/confirm")
  async confirm(@Req() req: any, @Param("id") id: string) {
    return { item: await this.bookings.confirm(id, req.user.id) };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Post(":id/cancel")
  async cancel(@Req() req: any, @Param("id") id: string) {
    return { item: await this.bookings.cancel(id, req.user.id) };
  }
}

