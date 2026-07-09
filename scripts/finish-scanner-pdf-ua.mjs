/**
 * Завершення СКАНЕР PDF UA: envFirst, EAS projectId, lint (як FotoProUA).
 *
 *   node scripts/finish-scanner-pdf-ua.mjs "C:\Users\Laptoper USA\Projects\skanerpdfua" [EAS_PROJECT_ID]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const target = process.argv[2];
const easProjectId = process.argv[3] ?? "";

if (!target) {
  console.error(`
Використання:
  node scripts/finish-scanner-pdf-ua.mjs "C:\\Users\\...\\skanerpdfua" [EAS_PROJECT_ID]
`);
  process.exit(1);
}

if (!existsSync(join(target, "package.json"))) {
  console.error(`Немає package.json у ${target}`);
  process.exit(1);
}

// config/env.js
const configDir = join(target, "config");
mkdirSync(configDir, { recursive: true });
copyFileSync(join(ROOT, "templates/scanner-pdf-ua/config/env.js"), join(configDir, "env.js"));
console.log("+ config/env.js");

// app.config.js
const appConfigPath = join(target, "app.config.js");
if (!existsSync(appConfigPath)) {
  console.error("Немає app.config.js");
  process.exit(1);
}

let src = readFileSync(appConfigPath, "utf8");

if (!src.includes('require("./config/env")') && !src.includes("envFirst")) {
  src = `const { envFirst } = require("./config/env");\n\n` + src;
}

const pid = easProjectId || "PASTE_EAS_PROJECT_ID_AFTER_eas_init";
const projectIdLine = `projectId: envFirst("EAS_PROJECT_ID") || "${pid}"`;

if (!/projectId/.test(src)) {
  if (/extra:\s*\{/.test(src)) {
    if (/eas:\s*\{/.test(src)) {
      src = src.replace(/(eas:\s*\{)/, `$1\n      ${projectIdLine},`);
    } else {
      src = src.replace(/(extra:\s*\{)/, `$1\n    eas: {\n      ${projectIdLine},\n    },`);
    }
  } else if (/module\.exports\s*=\s*\{/.test(src)) {
    src = src.replace(
      /(module\.exports\s*=\s*\{)/,
      `$1\n  extra: {\n    eas: {\n      ${projectIdLine},\n    },\n  },`
    );
  }
}

writeFileSync(appConfigPath, src, "utf8");
console.log("~ app.config.js (envFirst + eas.projectId)");

// package.json lint
const pkgPath = join(target, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.scripts = pkg.scripts ?? {};
pkg.scripts.lint = "expo lint";
pkg.devDependencies = pkg.devDependencies ?? {};
pkg.devDependencies.eslint = pkg.devDependencies.eslint ?? "^9.0.0";
pkg.devDependencies["eslint-config-expo"] = pkg.devDependencies["eslint-config-expo"] ?? "~10.0.0";
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("~ package.json (lint)");

writeFileSync(
  join(target, "eslint.config.js"),
  `const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/*", "dist-test/*"] },
]);
`
);
console.log("+ eslint.config.js");

// .gitignore dist-test
const gitignorePath = join(target, ".gitignore");
let gi = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
if (!gi.includes("dist-test")) {
  writeFileSync(gitignorePath, gi.trimEnd() + "\ndist-test/\n");
  console.log("~ .gitignore (dist-test/)");
}

// optional legacy template fixes (if files exist)
function patch(file, pairs) {
  const p = join(target, file);
  if (!existsSync(p)) return;
  let s = readFileSync(p, "utf8");
  for (const [a, b] of pairs) s = s.replace(a, b);
  writeFileSync(p, s);
  console.log("~", file);
}

patch("components/EditScreenInfo.tsx", [
  ["from '@/constants/Colors'", "from '../constants/Colors'"],
  ["doesn't automatically", "does not automatically"],
]);
patch("components/Themed.tsx", [["from '@/constants/Colors'", "from '../constants/Colors'"]]);
patch("src/components/PaywallSheet.tsx", [
  ["StyleSheet.absoluteFillObject", "StyleSheet.absoluteFill"],
]);

console.log("\nnpm install...");
execSync("npm install", { cwd: target, stdio: "inherit" });

console.log("\nnpm run lint...");
try {
  execSync("npm run lint", { cwd: target, stdio: "inherit" });
} catch {
  console.log("\n⚠ lint має warnings — виправте errors і повторіть.");
}

console.log(`
---
Готово для СКАНЕР PDF UA.

1) Якщо ще немає EAS ID:
   cd /d "${target.replace(/\//g, "\\")}"
   npx eas-cli@latest init
   (скопіюйте projectId і знову:)
   node scripts\\finish-scanner-pdf-ua.mjs "${target}" ВАШ_PROJECT_ID

2) GitHub (якщо repo ще не створений):
   https://github.com/new → ScannerPdfUA

3) Push:
   git add .
   git commit -m "chore: finish Scanner PDF UA setup"
   git push -u origin main
`);
