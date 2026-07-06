/**
 * Запуск Cloud Agent через Cursor API (перевірка середовища + env з .env).
 *
 * Один раз: Dashboard → API Keys → Create → скопіюй ключ.
 *
 *   set CURSOR_API_KEY=crsr_...
 *   node scripts/setup-cursor-cloud.mjs
 *
 * Або: scripts\setup-cursor-cloud.cmd
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ENV_PATH = join(ROOT, ".env");
const REPO = "https://github.com/serega312312l-creator/AutoServiceMap";
const BRANCH = "main";

const ENV_KEYS = [
  "GOOGLE_MAPS_API_KEY",
  "GOOGLE_PLACES_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "DATABASE_MANIFEST_URL",
  "DATABASE_BASE_URL",
];

function loadDotEnv() {
  const out = {};
  if (!existsSync(ENV_PATH)) return out;
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const apiKey = process.env.CURSOR_API_KEY?.trim();
if (!apiKey) {
  console.error(`
Потрібен API ключ Cursor:
  1. https://cursor.com/dashboard → API Keys → Create
  2. set CURSOR_API_KEY=ваш_ключ
  3. node scripts/setup-cursor-cloud.mjs
`);
  process.exit(1);
}

const dotenv = loadDotEnv();
const envVars = {};
for (const key of ENV_KEYS) {
  const v = dotenv[key]?.trim();
  if (v) envVars[key] = v;
}

if (!envVars.GOOGLE_MAPS_API_KEY) {
  console.error("У .env немає GOOGLE_MAPS_API_KEY — додай ключі перед запуском.");
  process.exit(1);
}

const prompt = `Перевірка Cloud Agent для AVTOGID (Expo 54).

1. npm ci
2. npm run lint — має бути 0 errors
3. Короткий звіт українською: що встановилось, чи lint OK
4. PR не створюй`;

const body = {
  name: "AVTOGID cloud setup check",
  prompt: { text: prompt },
  repos: [{ url: REPO, startingRef: BRANCH }],
  envVars,
};

console.log("Запускаю Cloud Agent…");
console.log(`Репо: ${REPO} @ ${BRANCH}`);
console.log(`Secrets у запиті: ${Object.keys(envVars).join(", ")}`);

const res = await fetch("https://api.cursor.com/v1/agents", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  console.error("Відповідь API:", text.slice(0, 500));
  process.exit(1);
}

if (!res.ok) {
  console.error(`Помилка API (${res.status}):`, JSON.stringify(data, null, 2));
  if (res.status === 401) {
    console.error("\nПеревір CURSOR_API_KEY або підключи GitHub у Dashboard → Integrations.");
  }
  process.exit(1);
}

const agentId = data.agent?.id ?? data.id;
const url = data.agent?.url ?? data.url ?? (agentId ? `https://cursor.com/agents?id=${agentId}` : null);

console.log(`
✓ Cloud Agent запущено.

Моніторинг з телефону:
  https://cursor.com/agents
${url ? `  ${url}` : ""}

Dashboard (Secrets для постійного збереження):
  https://cursor.com/dashboard/cloud-agents
`);
