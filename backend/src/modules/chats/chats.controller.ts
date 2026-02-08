import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { ChatsService } from "./chats.service";

@ApiTags("chats")
@Controller("chats")
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Post("by-listing/:listingId")
  @ApiOperation({ summary: "Find or create chat for listing (guest = current user)" })
  async findOrCreate(@Req() req: any, @Param("listingId") listingId: string) {
    return this.chats.findOrCreateByListing(req.user.id, listingId);
  }

  @Get()
  @ApiOperation({ summary: "List my conversations" })
  async list(@Req() req: any, @Query("limit") limit?: string) {
    return this.chats.listForUser(req.user.id, limit ? parseInt(limit, 10) : 50);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one conversation (meta)" })
  async getOne(@Req() req: any, @Param("id") id: string) {
    return this.chats.getOne(id, req.user.id);
  }

  @Get(":id/messages")
  @ApiOperation({ summary: "Get messages (paginated)" })
  async getMessages(
    @Req() req: any,
    @Param("id") id: string,
    @Query("before") before?: string,
    @Query("limit") limit?: string,
  ) {
    return this.chats.getMessages(id, req.user.id, before, limit ? parseInt(limit, 10) : 50);
  }

  @Post(":id/messages")
  @ApiOperation({ summary: "Send message" })
  async sendMessage(@Req() req: any, @Param("id") id: string, @Body("text") text: string) {
    return this.chats.sendMessage(id, req.user.id, text ?? "");
  }

  @Post(":id/read")
  @ApiOperation({ summary: "Mark conversation as read" })
  async markRead(@Req() req: any, @Param("id") id: string) {
    return this.chats.markRead(id, req.user.id);
  }
}
