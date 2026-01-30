const requiredCommon = ["APP_ENV"];
const requiredFrontend = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_TELEGRAM_BOT_NAME",
  "NEXT_PUBLIC_ENV",
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
  for (const key of requiredFrontend) {
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
