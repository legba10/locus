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
const path_1 = require("path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./shared/filters/http-exception.filter");
function getCorsOrigins() {
    const raw = process.env.CORS_ORIGINS;
    if (raw) {
        const list = raw.split(",").map((o) => o.trim()).filter(Boolean);
        if (list.length)
            return list;
    }
    return ["http://localhost:3000", "https://locus.vercel.app"];
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const corsOrigins = getCorsOrigins();
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    });
    app.use((0, cookie_parser_1.default)());
    const REQUEST_TIMEOUT_MS = 10000;
    app.use((req, res, next) => {
        res.setTimeout(REQUEST_TIMEOUT_MS, () => {
            if (!res.headersSent) {
                res.status(408).json({ statusCode: 408, error: "Request Timeout", message: "Request timeout after 10s" });
            }
        });
        next();
    });
    app.use((req, _res, next) => {
        const path = req.path || req.url;
        const origin = req.get?.("origin") ?? req.headers?.origin ?? "-";
        const hasAuth = !!req.headers?.authorization;
        console.log("API", req.method, path, "origin:", origin, "auth:", hasAuth ? "yes" : "no");
        next();
    });
    app.setGlobalPrefix("api/v1", { exclude: ["api"] });
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
    if (process.env.NODE_ENV !== "production") {
        app.useStaticAssets((0, path_1.join)(__dirname, "..", "uploads"), { prefix: "/uploads" });
    }
    const port = Number(process.env.PORT) || 8080;
    await app.listen(port);
    console.log("🚀 Backend started on port", port);
    console.log("🌍 Frontend URL:", process.env.FRONTEND_URL ?? "(not set)");
    console.log("🧩 Supabase URL:", !!process.env.SUPABASE_URL);
    console.log("🤖 AI enabled:", process.env.AI_ENABLED === "true");
    console.log("📡 Telegram enabled:", process.env.TELEGRAM_ENABLED === "true");
    const required = ["PORT", "DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
    const missing = required.filter((k) => {
        const v = process.env[k];
        return !v || (typeof v === "string" && v.trim() === "");
    });
    if (missing.length) {
        console.error("❌ Backend ENV missing (required for Railway):", missing.join(", "));
        console.error("   Set in Railway: Variables → PORT, DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    }
}
bootstrap().catch((e) => {
    console.error(e);
    process.exit(1);
});
