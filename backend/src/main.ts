import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { join } from "path";
import { AppModule } from "./app.module";

function getCorsOrigins(): (string | RegExp)[] {
  const raw = process.env.CORS_ORIGINS;
  if (raw) {
    const list = raw.split(",").map((o) => o.trim()).filter(Boolean);
    if (list.length) return list;
  }
  return ["http://localhost:3000", "https://locus-i4o2.vercel.app", /\.vercel\.app$/];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS: dynamic from CORS_ORIGINS; allow preflight and credentials
  const corsOrigins = getCorsOrigins();
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  // Cookie parser for refresh tokens
  app.use(cookieParser());

  // Request logging (URL, origin, auth presence)
  app.use((req: any, _res: any, next: () => void) => {
    const path = req.path || req.url;
    const origin = req.get?.("origin") ?? req.headers?.origin ?? "-";
    const hasAuth = !!req.headers?.authorization;
    // eslint-disable-next-line no-console
    console.log("API", req.method, path, "origin:", origin, "auth:", hasAuth ? "yes" : "no");
    next();
  });

  app.setGlobalPrefix("api/v1", { exclude: ["health", "api"] });
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
  // With global prefix "api/v1" this will be served at: /api/v1/docs
  SwaggerModule.setup("docs", app, document);

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads",
  });

  // Env validation: log missing/optional on startup
  const required = ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn("Backend env missing (may fail at runtime):", missing.join(", "));
  }
  // eslint-disable-next-line no-console
  console.log("Backend env:", {
    PORT: process.env.PORT ?? 10000,
    CORS_ORIGINS: process.env.CORS_ORIGINS ?? "(default)",
    REAL_AUTH_ENABLED: process.env.REAL_AUTH_ENABLED === "true",
    TELEGRAM_ENABLED: process.env.TELEGRAM_ENABLED === "true",
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 10000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

