import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { join } from "path";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  // Cookie parser — BEFORE CORS so cookies work
  app.use(cookieParser());

  // ЕДИНСТВЕННЫЙ CORS config — NestJS built-in, no manual OPTIONS handler
  // This handles preflight (OPTIONS) automatically
  app.enableCors({
    origin: (origin, callback) => {
      // No origin = same-origin or non-browser (curl, mobile) → allow
      if (!origin) {
        return callback(null, true);
      }

      // Allowed origins — EXACT domain from Vercel
      const allowed = [
        "https://locus-i4o2.vercel.app",  // Production (letter O, not zero)
        "http://localhost:3000",
        "http://localhost:3001",
      ];

      // Check exact match OR any Vercel preview deployment
      if (allowed.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Log blocked origin for debugging
      console.warn("[CORS] Blocked origin:", origin);
      // Return false (not error) to reject without crashing
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // Preflight cache for 24h
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
