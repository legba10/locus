"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",");
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    app.use((0, cookie_parser_1.default)());
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("LOCUS New API")
        .setDescription("AI-first rental marketplace API (MVP)")
        .setVersion("v1")
        .addBearerAuth()
        .addTag("health")
        .addTag("auth")
        .addTag("ai")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("docs", app, document);
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}`);
    console.log("Backend env:", {
        DATABASE_URL: Boolean(process.env.DATABASE_URL),
        SUPABASE_URL: process.env.SUPABASE_URL ?? "",
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        CORS_ORIGINS: allowedOrigins,
    });
}
bootstrap().catch((e) => {
    console.error(e);
    process.exit(1);
});
