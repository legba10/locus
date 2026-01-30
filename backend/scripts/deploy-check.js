#!/usr/bin/env node
/**
 * Deploy check — проверка готовности backend к запуску на Railway.
 * Проверяет: dist/main.js, Prisma client, env variables.
 * Запуск: node scripts/deploy-check.js (из папки backend)
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const errors = [];
const warnings = [];

function check(name, fn) {
  try {
    const result = fn();
    if (result === false) return false;
    if (typeof result === "string") {
      errors.push(`${name}: ${result}`);
      return false;
    }
    return true;
  } catch (e) {
    errors.push(`${name}: ${e.message}`);
    return false;
  }
}

// 1. dist/main.js
check("dist/main.js", () => {
  const mainPath = path.join(root, "dist", "main.js");
  if (!fs.existsSync(mainPath)) {
    return "файл не найден. Выполните: npm run build";
  }
  return true;
});

// 2. Prisma client
check("Prisma Client", () => {
  const clientPath = path.join(root, "node_modules", ".prisma", "client", "index.js");
  const generatedPath = path.join(root, "node_modules", "@prisma", "client", "index.js");
  if (!fs.existsSync(clientPath) && !fs.existsSync(generatedPath)) {
    return "Prisma client не сгенерирован. Выполните: npm run prisma:generate";
  }
  return true;
});

// 3. ENV variables (минимальный набор для Railway)
const requiredEnv = ["PORT", "DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
requiredEnv.forEach((key) => {
  check(`ENV ${key}`, () => {
    const v = process.env[key];
    if (!v || (typeof v === "string" && v.trim() === "")) {
      return `не задана. Установите в Railway Variables`;
    }
    if (key === "DATABASE_URL" && !v.includes("postgres")) {
      warnings.push(`${key} не похож на PostgreSQL URL`);
    }
    return true;
  });
});

// Log
if (warnings.length) {
  console.warn("⚠️  Warnings:");
  warnings.forEach((w) => console.warn("   ", w));
}
if (errors.length) {
  console.error("❌ Deploy check failed:");
  errors.forEach((e) => console.error("   ", e));
  process.exit(1);
}

console.log("✅ Deploy check passed: dist/main.js, Prisma client, ENV (PORT, DATABASE_URL, SUPABASE_*)");
process.exit(0);
