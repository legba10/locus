import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS with credentials for httpOnly cookies
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",");
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Cookie parser for refresh tokens
  app.use(cookieParser());

  app.setGlobalPrefix("api/v1");
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

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log("Backend env:", {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    SUPABASE_URL: process.env.SUPABASE_URL ?? "",
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    CORS_ORIGINS: allowedOrigins,
  });
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

