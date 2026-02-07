/* eslint-disable no-console */
/**
 * LOCUS Load Test Harness (autocannon)
 *
 * Usage:
 *   node scripts/loadtest.js --target http://localhost:8080 --preset 100
 *   node scripts/loadtest.js --target https://locus-backend.up.railway.app --preset 1000
 *
 * Presets emulate concurrent connections (best-effort on your machine):
 * - 100
 * - 1000
 * - 5000
 *
 * NOTE:
 * - Run against read-heavy endpoints by default (safe).
 * - For write endpoints add separate scenarios carefully.
 */

const autocannon = require("autocannon");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    args[k] = v;
  }
  return args;
}

function presetConfig(preset) {
  if (preset === "5000") {
    return { connections: 5000, duration: 30, pipelining: 1 };
  }
  if (preset === "1000") {
    return { connections: 1000, duration: 30, pipelining: 1 };
  }
  return { connections: 100, duration: 30, pipelining: 1 };
}

async function runScenario({ title, url, method = "GET", headers }) {
  console.log(`\n=== ${title} ===`);
  console.log(`${method} ${url}`);

  const res = await autocannon({
    url,
    method,
    headers,
    ...globalThis.__LT_CONFIG,
  });

  console.log(autocannon.printResult(res));
  return res;
}

async function main() {
  const args = parseArgs(process.argv);
  const target = (args.target || process.env.LOADTEST_TARGET || "http://localhost:8080").replace(/\/$/, "");
  const preset = String(args.preset || "100");

  const base = presetConfig(preset);
  const overrideConnections = args.connections ? Number(args.connections) : undefined;
  const overrideDuration = args.duration ? Number(args.duration) : undefined;
  const overridePipelining = args.pipelining ? Number(args.pipelining) : undefined;

  globalThis.__LT_CONFIG = {
    ...base,
    ...(overrideConnections ? { connections: overrideConnections } : {}),
    ...(overrideDuration ? { duration: overrideDuration } : {}),
    ...(overridePipelining ? { pipelining: overridePipelining } : {}),
  };

  console.log("LOCUS load test");
  console.log(`target: ${target}`);
  console.log(`preset: ${preset}`);
  console.log(`connections: ${globalThis.__LT_CONFIG.connections}, duration: ${globalThis.__LT_CONFIG.duration}s`);

  // Read-heavy safe endpoints
  await runScenario({
    title: "Health",
    url: `${target}/api/health`,
  });

  await runScenario({
    title: "Listings (home feed)",
    url: `${target}/api/listings?limit=12`,
  });

  await runScenario({
    title: "Search (basic)",
    url: `${target}/api/search?sort=newest&city=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0`,
  });

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Loadtest failed:", e);
  process.exit(1);
});

