import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../notifications/notifications.service";

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Найти или создать чат по объявлению: гость (текущий пользователь) + хост (владелец). */
  async findOrCreateByListing(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { ownerId: true, status: true },
    });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.ownerId === userId) throw new ForbiddenException("Cannot chat with yourself");

    const existing = await this.prisma.conversation.findUnique({
      where: {
        listingId_guestId: { listingId, guestId: userId },
      },
      include: {
        listing: { select: { id: true, title: true, photos: { take: 1, orderBy: { sortOrder: "asc" } } },
        host: { include: { profile: true } },
        guest: { include: { profile: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (existing) return this.enrichConversation(existing);

    const created = await this.prisma.conversation.create({
      data: {
        listingId,
        hostId: listing.ownerId,
        guestId: userId,
      },
      include: {
        listing: { select: { id: true, title: true, photos: { take: 1, orderBy: { sortOrder: "asc" } } },
        host: { include: { profile: true } },
        guest: { include: { profile: true } },
        messages: true,
      },
    });
    return this.enrichConversation(created);
  }

  /** Список чатов пользователя (как хост или гость). */
  async listForUser(userId: string, limit = 50) {
    const list = await this.prisma.conversation.findMany({
      where: { OR: [{ hostId: userId }, { guestId: userId }] },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        listing: { select: { id: true, title: true, photos: { take: 1, orderBy: { sortOrder: "asc" } } },
        host: { include: { profile: true } },
        guest: { include: { profile: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    const unreadCounts = await Promise.all(
      list.map((c) =>
        this.prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: userId },
            readAt: null,
          },
        }),
      ),
    );
    return list.map((c, i) => ({
      ...this.enrichConversation(c),
      unreadCount: unreadCounts[i] ?? 0,
    }));
  }

  /** Метаданные одного чата (для шапки). */
  async getOne(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        listing: { select: { id: true, title: true, photos: { take: 1, orderBy: { sortOrder: "asc" } } } },
        host: { include: { profile: true } },
        guest: { include: { profile: true } },
      },
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (conv.hostId !== userId && conv.guestId !== userId) throw new ForbiddenException("Access denied");
    return this.enrichConversation(conv);
  }

  /** Сообщения чата с пагинацией. */
  async getMessages(conversationId: string, userId: string, before?: string, limit = 50) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, hostId: true, guestId: true },
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (conv.hostId !== userId && conv.guestId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    const cursor = before ? { id: before } : undefined;
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor, skip: 1 } : {}),
      include: { sender: { include: { profile: true } } },
    });
    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    return { messages: page.reverse(), hasMore };
  }

  /** Отправить сообщение и обновить updatedAt чата. */
  async sendMessage(conversationId: string, userId: string, text: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { listing: true, host: true, guest: true },
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (conv.hostId !== userId && conv.guestId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    const trimmed = text.trim();
    if (!trimmed) throw new ForbiddenException("Message text is required");

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          text: trimmed,
        },
        include: { sender: { include: { profile: true } } },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    const recipientId = conv.hostId === userId ? conv.guestId : conv.hostId;
    this.notifications
      .create(
        recipientId,
        NotificationType.NEW_MESSAGE,
        "Новое сообщение",
        `${(message.sender as any).profile?.name ?? "Кто-то"}: ${trimmed.slice(0, 80)}${trimmed.length > 80 ? "…" : ""}`,
      )
      .catch(() => {});

    return message;
  }

  /** Отметить сообщения чата как прочитанные (со стороны userId). */
  async markRead(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { hostId: true, guestId: true },
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (conv.hostId !== userId && conv.guestId !== userId) throw new ForbiddenException("Access denied");

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  private enrichConversation(c: any) {
    const listing = c.listing;
    const photo = listing?.photos?.[0];
    return {
      ...c,
      listingTitle: listing?.title,
      listingPhotoUrl: photo?.url,
    };
  }
}
