/**
 * Додає lint + виправляє помилки у FotoProUA (після finish-fotoproua.mjs).
 *
 *   node scripts/finish-fotoproua-lint.mjs "C:\Users\Laptoper USA\Projects\FotoProUA"
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const target = process.argv[2];
if (!target) {
  console.error("Вкажіть шлях до FotoProUA");
  process.exit(1);
}

const pkgPath = join(target, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.scripts = pkg.scripts ?? {};
pkg.scripts.lint = "expo lint";
pkg.devDependencies = pkg.devDependencies ?? {};
pkg.devDependencies.eslint = "^9.0.0";
pkg.devDependencies["eslint-config-expo"] = "~10.0.0";
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("~ package.json (lint script)");

const eslintConfig = `// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/*", "dist-test/*"] },
]);
`;
writeFileSync(join(target, "eslint.config.js"), eslintConfig);
console.log("+ eslint.config.js");

function patch(file, replacers) {
  const p = join(target, file);
  if (!existsSync(p)) return;
  let s = readFileSync(p, "utf8");
  for (const [from, to] of replacers) {
    s = s.replace(from, to);
  }
  writeFileSync(p, s);
  console.log("~", file);
}

patch("components/EditScreenInfo.tsx", [
  ["from '@/constants/Colors'", "from '../constants/Colors'"],
  [
    "doesn't automatically",
    "does not automatically",
  ],
]);
patch("components/Themed.tsx", [["from '@/constants/Colors'", "from '../constants/Colors'"]]);
patch("src/components/PaywallSheet.tsx", [
  ["StyleSheet.absoluteFillObject", "StyleSheet.absoluteFill"],
]);
patch("app.config.js", [
  [
    'envFirst("EAS_PROJECT_ID") ?? "c6260047',
    'envFirst("EAS_PROJECT_ID") || "c6260047',
  ],
]);

console.log("\nВстановлення залежностей...");
execSync("npm install", { cwd: target, stdio: "inherit" });
console.log("\nЗапуск lint...");
execSync("npm run lint", { cwd: target, stdio: "inherit" });
console.log("\nГотово. Далі: git add . && git commit && git push");
