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
const express_1 = require("express");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./shared/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.use((0, express_1.json)({ limit: "50mb" }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: "50mb" }));
    app.use((0, cookie_parser_1.default)());
    const allowedOrigins = [
        "https://locus-i4o2.vercel.app",
        "https://locus-4o2.vercel.app",
        "https://www.locus.ru",
        "http://localhost:3000",
        "http://localhost:3001",
    ];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    app.use((req, _res, next) => {
        const path = req.path || req.url;
        const origin = req.get?.("origin") ?? req.headers?.origin ?? "-";
        const hasAuth = !!req.headers?.authorization;
        console.log(`[API] ${req.method} ${path} | origin: ${origin} | auth: ${hasAuth ? "yes" : "no"}`);
        next();
    });
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("LOCUS API")
        .setDescription("AI-first rental marketplace")
        .setVersion("v1")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("docs", app, document);
    if (process.env.NODE_ENV !== "production") {
        app.useStaticAssets((0, path_1.join)(__dirname, "..", "uploads"), { prefix: "/uploads" });
    }
    const port = Number(process.env.PORT) || 8080;
    await app.listen(port);
    console.log(`🚀 Backend running on port ${port}`);
    console.log(`🌍 Frontend: ${process.env.FRONTEND_URL ?? "(not set)"}`);
    console.log(`📡 Telegram: ${process.env.TELEGRAM_ENABLED === "true" ? "enabled" : "disabled"}`);
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
//# sourceMappingURL=main.js.map