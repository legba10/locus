import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

function patchDatabaseUrlForPooling(rawUrl: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const poolSize = process.env.PRISMA_POOL_SIZE ?? (isProd ? "20" : undefined);
  const poolTimeout = process.env.PRISMA_POOL_TIMEOUT ?? (isProd ? "20" : undefined);

  if (!poolSize && !poolTimeout) return rawUrl;

  try {
    const url = new URL(rawUrl);
    if (poolSize && !url.searchParams.get("connection_limit")) {
      url.searchParams.set("connection_limit", poolSize);
    }
    if (poolTimeout && !url.searchParams.get("pool_timeout")) {
      url.searchParams.set("pool_timeout", poolTimeout);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const rawUrl = process.env.DATABASE_URL;
    const url = rawUrl ? patchDatabaseUrlForPooling(rawUrl) : rawUrl;
    const slowMs = Number(process.env.PRISMA_SLOW_QUERY_MS ?? 1000);

    super({
      ...(url
        ? {
            datasources: {
              db: { url },
            },
          }
        : {}),
      log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
    });

    // Slow query logging
    this.$on("query" as never, (e: Prisma.QueryEvent) => {
      if (e.duration >= slowMs) {
        this.logger.warn(
          `Slow query (${e.duration}ms): ${e.query} | params: ${e.params}`
        );
      }
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.error("DATABASE_URL is not defined");
      throw new Error("DATABASE_URL is not defined");
    }

    try {
      await this.$connect();
      this.logger.log("Connected to database");
    } catch (error) {
      this.logger.error("Failed to connect to database", error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from database");
  }
}
