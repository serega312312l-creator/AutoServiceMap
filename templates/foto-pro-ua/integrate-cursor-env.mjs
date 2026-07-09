/**
 * Додає config/env.js у app.config.js (якщо ще немає).
 * Запуск з кореня FotoProUA:
 *   node scripts/integrate-cursor-env.mjs
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const appConfig = join(root, "app.config.js");

if (!existsSync(appConfig)) {
  console.error("Немає app.config.js у корені проєкту.");
  process.exit(1);
}

let src = readFileSync(appConfig, "utf8");

if (src.includes("config/env") || src.includes("envFirst")) {
  console.log("app.config.js вже підключено до config/env.js");
  process.exit(0);
}

const header = `const { envFirst } = require("./config/env");\n\n`;

if (!src.includes("envFirst(")) {
  src = src.replace(
    /^(const\s+GOOGLE_MAPS_API_KEY\s*=\s*)process\.env\.GOOGLE_MAPS_API_KEY/,
    "$1envFirst(\"GOOGLE_MAPS_API_KEY\", \"КЛЮЧ_API_КАРТ_GOOGLE\", \"GOOGLE_MAPS_API_KE\")"
  );
  src = src.replace(
    /process\.env\.GOOGLE_PLACES_API_KEY/g,
    'envFirst("GOOGLE_PLACES_API_KEY")'
  );
  src = src.replace(
    /process\.env\.SUPABASE_URL/g,
    'envFirst("SUPABASE_URL", "URL-адреса_SUPABASE")'
  );
  src = src.replace(
    /process\.env\.SUPABASE_ANON_KEY/g,
    'envFirst("SUPABASE_ANON_KEY")'
  );
  src = src.replace(
    /process\.env\.EAS_PROJECT_ID/g,
    'envFirst("EAS_PROJECT_ID")'
  );
}

writeFileSync(appConfig, header + src, "utf8");
console.log("OK: додано require('./config/env') і envFirst у app.config.js");
