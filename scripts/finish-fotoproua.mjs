/**
 * Завершення налаштування FotoProUA: envFirst + EAS projectId.
 *
 *   node scripts/finish-fotoproua.mjs "C:\Users\Laptoper USA\Projects\FotoProUA"
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EAS_PROJECT_ID = "c6260047-167d-410f-806c-35e7fb6be75b";

const targetDir = process.argv[2];
if (!targetDir) {
  console.error('Вкажіть шлях: node scripts/finish-fotoproua.mjs "C:\\...\\FotoProUA"');
  process.exit(1);
}

const appConfigPath = join(targetDir, "app.config.js");
if (!existsSync(appConfigPath)) {
  console.error(`Немає app.config.js: ${appConfigPath}`);
  process.exit(1);
}

// config/env.js
const configDir = join(targetDir, "config");
mkdirSync(configDir, { recursive: true });
copyFileSync(join(ROOT, "templates/foto-pro-ua/config/env.js"), join(configDir, "env.js"));
console.log("+ config/env.js");

// integrate script
const scriptsDir = join(targetDir, "scripts");
mkdirSync(scriptsDir, { recursive: true });
copyFileSync(
  join(ROOT, "templates/foto-pro-ua/integrate-cursor-env.mjs"),
  join(scriptsDir, "integrate-cursor-env.mjs")
);

let src = readFileSync(appConfigPath, "utf8");

if (!src.includes('require("./config/env")') && !src.includes("envFirst")) {
  src = `const { envFirst } = require("./config/env");\n\n` + src;
}

if (!src.includes("extra.eas") && !src.match(/eas:\s*\{[^}]*projectId/)) {
  const projectIdLine = `projectId: envFirst("EAS_PROJECT_ID") || "${EAS_PROJECT_ID}"`;

  if (/extra:\s*\{/.test(src)) {
    if (/eas:\s*\{/.test(src)) {
      if (!/projectId/.test(src)) {
        src = src.replace(/(eas:\s*\{)/, `$1\n        ${projectIdLine},`);
      }
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
console.log("~ app.config.js (envFirst + EAS projectId)");

// .env.example
const envExample = join(targetDir, ".env.example");
if (!existsSync(envExample)) {
  writeFileSync(
    envExample,
    `EAS_PROJECT_ID=${EAS_PROJECT_ID}\n`,
    "utf8"
  );
  console.log("+ .env.example");
}

console.log(`
Готово. Далі в CMD:

  cd /d "${targetDir.replace(/\//g, "\\")}"
  git add .
  git commit -m "chore: finish FotoProUA EAS + Cursor Cloud setup"
  git push -u origin main
`);
