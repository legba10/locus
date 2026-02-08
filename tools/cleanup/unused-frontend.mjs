import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

// AST-based inbound-import analysis for frontend/**/*.{ts,tsx}.
// Reports TS/TSX files with zero incoming *relative* imports/exports/requires,
// excluding Next.js app-router entrypoints (page/layout/route/etc).

const repoRoot = process.cwd();
const frontendDir = path.join(repoRoot, "frontend");
const require = createRequire(import.meta.url);
const ts = require(path.join(frontendDir, "node_modules", "typescript"));

function norm(p) {
  return path.resolve(p).toLowerCase();
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function shouldSkipDir(absDir) {
  const bn = path.basename(absDir);
  return bn === "node_modules" || bn === ".next" || bn === "dist" || bn === "build" || bn === "coverage" || bn === ".cache";
}

function listTsFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let ents;
    try {
      ents = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (!shouldSkipDir(p)) stack.push(p);
        continue;
      }
      if (!e.isFile()) continue;
      if (p.endsWith(".d.ts")) continue;
      if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
    }
  }
  return out;
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

function isNextEntrypoint(absFile) {
  const rel = path.relative(frontendDir, absFile);
  const parts = rel.split(path.sep);
  if (parts[0] !== "app") return false;
  const bn = path.basename(absFile).toLowerCase();
  return (
    bn === "page.tsx" ||
    bn === "page.ts" ||
    bn === "layout.tsx" ||
    bn === "layout.ts" ||
    bn === "route.ts" ||
    bn === "route.tsx" ||
    bn === "loading.tsx" ||
    bn === "loading.ts" ||
    bn === "error.tsx" ||
    bn === "error.ts" ||
    bn === "not-found.tsx" ||
    bn === "not-found.ts" ||
    bn === "template.tsx" ||
    bn === "template.ts"
  );
}

const files = listTsFiles(frontendDir);
const ids = files.map((f) => norm(f));

const idToFile = new Map(ids.map((id, i) => [id, files[i]]));
const inbound = new Map(ids.map((id) => [id, 0]));

for (const absFile of files) {
  let text;
  try {
    text = fs.readFileSync(absFile, "utf8");
  } catch {
    continue;
  }
  const sf = ts.createSourceFile(absFile, text, ts.ScriptTarget.Latest, true);
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
      const target = resolveRelative(absFile, st.moduleSpecifier.text);
      if (target && inbound.has(target)) inbound.set(target, (inbound.get(target) ?? 0) + 1);
    }
    if (ts.isExportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
      const target = resolveRelative(absFile, st.moduleSpecifier.text);
      if (target && inbound.has(target)) inbound.set(target, (inbound.get(target) ?? 0) + 1);
    }
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
          const target = resolveRelative(absFile, init.arguments[0].text);
          if (target && inbound.has(target)) inbound.set(target, (inbound.get(target) ?? 0) + 1);
        }
      }
    }
  }
}

const zeroInbound = [];
for (const [id, count] of inbound.entries()) {
  const file = idToFile.get(id) ?? id;
  if (isNextEntrypoint(file)) continue;
  if (count === 0) zeroInbound.push(id);
}

zeroInbound.sort();
const rel = zeroInbound.map((id) => path.relative(repoRoot, idToFile.get(id) ?? id));

console.log(
  JSON.stringify(
    {
      ok: true,
      project: "frontend",
      totalSourceFiles: files.length,
      zeroInboundCount: rel.length,
      zeroInboundFiles: rel,
      notes: [
        "Next.js app router entrypoints (app/**/page|layout|route|loading|error|not-found|template) are excluded from unused list.",
        "This checks only relative import/export/require edges; dynamic imports and runtime reflection are not captured.",
      ],
    },
    null,
    2
  )
);

