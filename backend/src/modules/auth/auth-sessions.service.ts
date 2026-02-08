import { Injectable, Logger } from "@nestjs/common";
import type { Request } from "express";
import { createHash } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthSessionsService {
  private readonly logger = new Logger(AuthSessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getIp(req: Request): string | null {
    const xf = req.headers["x-forwarded-for"];
    if (typeof xf === "string" && xf.length > 0) {
      return xf.split(",")[0]?.trim() ?? null;
    }
    return (req as any).ip ?? null;
  }

  private getDeviceId(req: Request): string {
    const explicit = req.headers["x-locus-device"];
    if (typeof explicit === "string" && explicit.trim().length > 0) {
      return explicit.trim().slice(0, 64);
    }
    const ua = (req.headers["user-agent"] ?? "") as string;
    const hash = createHash("sha256").update(ua).digest("hex");
    return hash.slice(0, 24);
  }

  async storeRefreshSession(userId: string, refreshToken: string, req: Request) {
    if (!refreshToken) return;
    const device = this.getDeviceId(req);
    const userAgent = (req.headers["user-agent"] as string | undefined) ?? null;
    const ip = this.getIp(req);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    try {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          token: refreshToken,
          expiresAt,
          device,
          userAgent,
          ip,
        },
      });
    } catch (e: any) {
      // Unique token => already stored
      if (e?.code === "P2002") return;
      this.logger.warn(`Failed to store refresh session: ${e?.message ?? e}`);
    }
  }

  async rotateRefreshSession(userId: string, oldToken: string, newToken: string, req: Request) {
    if (!newToken) return;
    const now = new Date();
    // Revoke old token for current device/session only (do not touch other devices)
    if (oldToken) {
      await this.prisma.refreshToken
        .updateMany({
          where: { userId, token: oldToken, revokedAt: null },
          data: { revokedAt: now },
        })
        .catch(() => undefined);
    }
    await this.storeRefreshSession(userId, newToken, req);
  }

  async revokeByToken(token: string, userId?: string) {
    if (!token) return;
    const now = new Date();
    await this.prisma.refreshToken
      .updateMany({
        where: {
          token,
          ...(userId ? { userId } : {}),
          revokedAt: null,
        },
        data: { revokedAt: now },
      })
      .catch(() => undefined);
  }
}

