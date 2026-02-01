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

  // CORS: Railway → Vercel. Callback-based, NO regex from env.
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      const allowed = [
        "https://locus-i402.vercel.app",
        "http://localhost:3000",
      ];

      if (allowed.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        console.error("CORS BLOCKED:", origin);
        callback(new Error("CORS BLOCKED: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Explicit preflight handler — CRITICAL for browsers
  app.use((req: any, res: any, next: () => void) => {
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
      return res.sendStatus(204);
    }
    next();
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
  }
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
