import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

// AST-based inbound-import analysis for backend/*.ts.
// Reports TS files with zero incoming *relative* imports/exports/requires.
// NOTE: Does NOT consider Nest/Next runtime reflection, filesystem routing, env wiring, etc.

const repoRoot = process.cwd();
const backendDir = path.join(repoRoot, "backend");
const backendDirNorm = path.resolve(backendDir).toLowerCase() + path.sep;
const require = createRequire(import.meta.url);
const ts = require(path.join(backendDir, "node_modules", "typescript"));

const tsconfigPath = path.join(backendDir, "tsconfig.json");

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function norm(p) {
  return path.resolve(p).toLowerCase();
}

function resolveRelative(fromFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  for (const c of candidates) {
    if (isFile(c)) return norm(c);
  }
  return null;
}

const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
if (configFile.error) {
  console.error(JSON.stringify({ ok: false, error: "read_tsconfig_failed", details: configFile.error }, null, 2));
  process.exit(1);
}

const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, backendDir);
const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });

const sourceFiles = program.getSourceFiles().filter((sf) => {
  if (sf.isDeclarationFile) return false;
  const fn = norm(sf.fileName);
  return fn.startsWith(backendDirNorm);
});

const idToFile = new Map();
const inbound = new Map();
for (const sf of sourceFiles) {
  const id = norm(sf.fileName);
  idToFile.set(id, sf.fileName);
  inbound.set(id, 0);
}

for (const sf of sourceFiles) {
  const fromId = norm(sf.fileName);
  for (const st of sf.statements) {
    // import ... from "x"
    if (ts.isImportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
      const target = resolveRelative(sf.fileName, st.moduleSpecifier.text);
      if (target && inbound.has(target)) inbound.set(target, (inbound.get(target) ?? 0) + 1);
    }
    // export ... from "x"
    if (ts.isExportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
      const target = resolveRelative(sf.fileName, st.moduleSpecifier.text);
      if (target && inbound.has(target)) inbound.set(target, (inbound.get(target) ?? 0) + 1);
    }
    // const x = require("y")
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const init = d.initializer;
        if (
          init &&
          ts.isCallExpression(init) &&
          init.arguments.length === 1 &&
          init.expression.getText(sf) === "require" &&
          ts.isStringLiteral(init.arguments[0])
        ) {
          const target = resolveRelative(sf.fileName, init.arguments[0].text);
          if (target && inbound.has(target)) inbound.set(target, (inbound.get(target) ?? 0) + 1);
        }
      }
    }
  }
}

const alwaysUsed = new Set([
  norm(path.join(backendDir, "src", "main.ts")),
  norm(path.join(backendDir, "src", "app.module.ts")),
]);

const zeroInbound = [];
for (const [id, count] of inbound.entries()) {
  if (alwaysUsed.has(id)) continue;
  if (count === 0) zeroInbound.push(id);
}

zeroInbound.sort();
const rel = zeroInbound.map((id) => path.relative(repoRoot, idToFile.get(id) ?? id));

console.log(
  JSON.stringify(
    {
      ok: true,
      project: "backend",
      totalSourceFiles: sourceFiles.length,
      zeroInboundCount: rel.length,
      zeroInboundFiles: rel,
    },
    null,
    2
  )
);

