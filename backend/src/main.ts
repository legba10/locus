import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { join } from "path";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  // Increase body size limits for file uploads (50MB)
  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  // Cookie parser — BEFORE CORS so cookies work
  app.use(cookieParser());

  // CORS Configuration
  // IMPORTANT: Auth & Profiles live in Supabase.
  // Business data lives in Neon.
  // Frontend NEVER talks to Neon directly.
  // All API calls go through Next.js API layer to avoid CORS.
  const allowedOrigins = [
    "https://locus-i4o2.vercel.app",   // Production Vercel
    "https://locus-4o2.vercel.app",    // Alternate domain
    "https://www.locus.ru",            // Production domain
    "http://localhost:3000",           // Local dev
    "http://localhost:3001",           // Local dev alt
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Request logging
  app.use((req: any, _res: any, next: () => void) => {
    const path = req.path || req.url;
    const origin = req.get?.("origin") ?? req.headers?.origin ?? "-";
    const hasAuth = !!req.headers?.authorization;
    console.log(`[API] ${req.method} ${path} | origin: ${origin} | auth: ${hasAuth ? "yes" : "no"}`);
    next();
  });

  // Global prefix: all routes under /api
  app.setGlobalPrefix("api");

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger docs at /docs (outside /api prefix)
  const config = new DocumentBuilder()
    .setTitle("LOCUS API")
    .setDescription("AI-first rental marketplace")
    .setVersion("v1")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  // Static assets for dev only
  if (process.env.NODE_ENV !== "production") {
    app.useStaticAssets(join(__dirname, "..", "uploads"), { prefix: "/uploads" });
  }

  const port = Number(process.env.PORT) || 8080;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`🌍 Frontend: ${process.env.FRONTEND_URL ?? "(not set)"}`);
  console.log(`📡 Telegram: ${process.env.TELEGRAM_ENABLED === "true" ? "enabled" : "disabled"}`);

  // Verify required env vars
  const required = ["PORT", "DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("❌ Missing env vars:", missing.join(", "));
  }
}

bootstrap().catch((e) => {
  console.error("Bootstrap failed:", e);
  process.exit(1);
});
