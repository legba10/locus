import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { join } from "path";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (raw) {
    const list = raw.split(",").map((o) => o.trim()).filter(Boolean);
    if (list.length) return list;
  }
  return ["http://localhost:3000", "https://locus.vercel.app", "https://locus-i402.vercel.app"];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS: Railway → Vercel. Только locus.vercel.app и localhost.
  const corsOrigins = getCorsOrigins();
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  // Cookie parser for refresh tokens
  app.use(cookieParser());

  // Timeout protection: 10s for incoming requests
  const REQUEST_TIMEOUT_MS = 10000;
  app.use((req: any, res: any, next: () => void) => {
    res.setTimeout(REQUEST_TIMEOUT_MS, () => {
      if (!res.headersSent) {
        res.status(408).json({ statusCode: 408, error: "Request Timeout", message: "Request timeout after 10s" });
      }
    });
    next();
  });

  // Request logging (URL, origin, auth presence)
  app.use((req: any, _res: any, next: () => void) => {
    const path = req.path || req.url;
    const origin = req.get?.("origin") ?? req.headers?.origin ?? "-";
    const hasAuth = !!req.headers?.authorization;
    // eslint-disable-next-line no-console
    console.log("API", req.method, path, "origin:", origin, "auth:", hasAuth ? "yes" : "no");
    next();
  });

  // Контракт: GET/POST /api/listings. Единый префикс api.
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("LOCUS New API")
    .setDescription("AI-first rental marketplace API (MVP)")
    .setVersion("v1")
    .addBearerAuth()
    .addTag("health")
    .addTag("auth")
    .addTag("ai")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // With global prefix "api" docs are at: /docs
  SwaggerModule.setup("docs", app, document);

  // Production: только Supabase Storage. uploads/ только для dev/legacy.
  if (process.env.NODE_ENV !== "production") {
    app.useStaticAssets(join(__dirname, "..", "uploads"), { prefix: "/uploads" });
  }

  const port = Number(process.env.PORT) || 8080;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log("🚀 Backend started on port", port);
  // eslint-disable-next-line no-console
  console.log("🌍 Frontend URL:", process.env.FRONTEND_URL ?? "(not set)");
  // eslint-disable-next-line no-console
  console.log("🧩 Supabase URL:", !!process.env.SUPABASE_URL);
  // eslint-disable-next-line no-console
  console.log("🤖 AI enabled:", process.env.AI_ENABLED === "true");
  // eslint-disable-next-line no-console
  console.log("📡 Telegram enabled:", process.env.TELEGRAM_ENABLED === "true");

  const required = ["PORT", "DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((k) => {
    const v = process.env[k];
    return !v || (typeof v === "string" && v.trim() === "");
  });
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error("❌ Backend ENV missing (required for Railway):", missing.join(", "));
    // eslint-disable-next-line no-console
    console.error("   Set in Railway: Variables → PORT, DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  }
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

