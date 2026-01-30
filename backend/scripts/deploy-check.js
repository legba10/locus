const requiredCommon = ["APP_ENV"];
const requiredBackend = [
  "PORT",
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "TELEGRAM_BOT_TOKEN",
];

function getEnv() {
  return (process.env.APP_ENV || "LOCAL").toUpperCase();
}

function validate() {
  const env = getEnv();
  const missing = [];
  for (const key of requiredCommon) {
    if (!process.env[key]) missing.push(key);
  }
  for (const key of requiredBackend) {
    if (!process.env[key]) missing.push(key);
  }
  if (env === "PROD" && missing.length) {
    throw new Error(`[DEPLOY CHECK] Missing env vars: ${missing.join(", ")}`);
  }
  return { env, missing };
}

try {
  const result = validate();
  console.log("[DEPLOY CHECK] OK", result);
} catch (err) {
  console.error("[DEPLOY CHECK] FAIL", err.message || err);
  process.exit(1);
}
