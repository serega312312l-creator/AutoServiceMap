/**
 * Додає Cursor Cloud / EAS структуру до мобільного Expo-проєкту (як AVTOGID).
 *
 *   node scripts/bootstrap-sibling-app.mjs <шлях> <slug> <package> "<назва>" [easProjectId]
 *
 * Приклад (на Windows, з кореня AutoServiceMap):
 *   node scripts/bootstrap-sibling-app.mjs "C:\Users\Laptoper USA\Projects\FotoProUA" foto-pro-ua com.fotoproua.app "ФОТО PRO UA"
 *   node scripts/bootstrap-sibling-app.mjs "C:\Users\Laptoper USA\Projects\ScannerPdfUA" scanner-pdf-ua com.scannerpdfua.app "СКАНЕР PDF UA"
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const [targetDir, slug, packageId, displayName, easProjectId = ""] = process.argv.slice(2);

if (!targetDir || !slug || !packageId || !displayName) {
  console.error(`
Використання:
  node scripts/bootstrap-sibling-app.mjs <шлях> <slug> <package> "<назва>" [easProjectId]

Приклад:
  node scripts/bootstrap-sibling-app.mjs "C:\\Users\\...\\FotoProUA" foto-pro-ua com.fotoproua.app "ФОТО PRO UA"
`);
  process.exit(1);
}

const root = resolve(targetDir);
if (!existsSync(root)) {
  console.error(`Папка не існує: ${root}`);
  process.exit(1);
}

const hasPackageJson = existsSync(join(root, "package.json"));
if (!hasPackageJson) {
  console.warn(`⚠ У ${root} немає package.json — переконайтесь, що це корінь Expo-проєкту.`);
}

const easAccount = "serega312312";
const upperSlug = slug.toUpperCase().replace(/-/g, "_");

function write(rel, content) {
  const full = join(root, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  if (existsSync(full)) {
    console.log(`  пропуск (вже є): ${rel}`);
    return;
  }
  writeFileSync(full, content, "utf8");
  console.log(`  + ${rel}`);
}

console.log(`\nНалаштування «${displayName}» у ${root}\n`);

// .cursor/environment.json
write(
  ".cursor/environment.json",
  JSON.stringify({ install: "npm ci" }, null, 2) + "\n"
);

// .cursor/rules
write(
  `.cursor/rules/${slug}-project.mdc`,
  `---
description: ${displayName} — стек, конвенції
alwaysApply: true
---

# ${displayName}

Мобільний додаток (Expo, TypeScript). UI — **українською**.

## Стек

- Expo, TypeScript, expo-router (якщо є)
- \`${packageId}\`, slug \`${slug}\`
- EAS: \`@${easAccount}/${slug}\`
- Збірки: \`preview\` = APK, \`production\` = AAB (Play Market)

## Конвенції

- Не комітити \`.env\`, API-ключі, keystore
- Конфіг: \`app.config.js\` (динамічний), не \`app.json\`
- Не плутати з AVTOGID та ігровими проєктами (Unity/Godot)

## Не робити без запиту

- \`eas build\` / \`eas submit\` без явного запиту
- Зайві markdown-файли
`
);

// Copy windows-eas rule from template repo if running from AutoServiceMap
const windowsRule = join(__dirname, "..", ".cursor", "rules", "windows-eas-build.mdc");
if (existsSync(windowsRule)) {
  const dest = join(root, ".cursor", "rules", "windows-eas-build.mdc");
  if (!existsSync(dest)) {
    writeFileSync(dest, readFileSync(windowsRule, "utf8"));
    console.log("  + .cursor/rules/windows-eas-build.mdc (копія з AVTOGID)");
  }
}

// AGENTS.md
write(
  "AGENTS.md",
  `# ${displayName} — інструкції для агентів

Мобільний застосунок (Expo, TypeScript).

## Стек

- \`${packageId}\`, slug \`${slug}\`, EAS \`@${easAccount}/${slug}\`
- Конфіг: \`app.config.js\`

## Конвенції

- UI-тексти — **українською**
- Не комітити \`.env\`, ключі, keystore
- Після змін: \`npm run lint\`

## Cursor Cloud specific instructions

Секрети — **Cursor Dashboard → Cloud Agents → Secrets** (не \`.env\` у git).

| Змінна | Призначення |
|--------|-------------|
| \`EXPO_TOKEN\` | EAS build у cloud (за запитом) |
| \`GOOGLE_*_API_KEY\` | якщо використовує Google API |

Тип: **Секрет виконання** (Runtime Secret).

### Перевірка

1. \`npm ci\`
2. \`npm run lint\`

### Не робити без запиту

- \`eas build\` / \`eas submit\`
- Коміт секретів
`
);

// .env.example
write(
  ".env.example",
  `# ${displayName}
EAS_PROJECT_ID=${easProjectId || "встав_uuid_з_expo.dev"}

# Cursor Cloud Agents — ті самі імена в Dashboard → Secrets
# EXPO_TOKEN=...

# Локально на Windows — скопіюй у .env (не комітити):
# cp .env.example .env
`
);

// eas.json
write(
  "eas.json",
  JSON.stringify(
    {
      cli: { version: ">= 16.0.0", appVersionSource: "remote" },
      build: {
        preview: { distribution: "internal", android: { buildType: "apk" } },
        production: { android: { buildType: "app-bundle" } },
      },
      submit: { production: { android: { track: "internal" } } },
    },
    null,
    2
  ) + "\n"
);

// .gitignore additions hint
const gitignorePath = join(root, ".gitignore");
const gitignoreLines = [".env", ".env.local", "*.keystore", "google-services.json"];
if (existsSync(gitignorePath)) {
  const current = readFileSync(gitignorePath, "utf8");
  const missing = gitignoreLines.filter((l) => !current.includes(l));
  if (missing.length) {
    writeFileSync(gitignorePath, current.trimEnd() + "\n\n# secrets\n" + missing.join("\n") + "\n");
    console.log("  ~ .gitignore (додано рядки для секретів)");
  }
} else {
  write(".gitignore", "node_modules/\n.expo/\n.env\n.env.local\n*.keystore\n");
}

// app.config.js env helper snippet - only if app.config.js exists
const appConfigPath = join(root, "app.config.js");
if (existsSync(appConfigPath) && !readFileSync(appConfigPath, "utf8").includes("envFirst")) {
  console.log("\n  ℹ Додайте у app.config.js читання process.env (див. AVTOGID app.config.js, функція envFirst).");
}

console.log(`
Готово для «${displayName}».

Далі на Windows (CMD), у папці проєкту:

  cd /d "${root.replace(/\//g, "\\")}"

  git init
  git add .
  git commit -m "Initial commit + Cursor Cloud setup"

Створіть репо на GitHub (порожнє), потім:

  git remote add origin https://github.com/serega312312l-creator/<ІМ'Я_РЕПО>.git
  git branch -M main
  git push -u origin main

Cursor Dashboard:
  1. Integrations → GitHub → додати репо
  2. Cloud Agents → Create environment → підключити репо
  3. Secrets: EXPO_TOKEN (спільний з AVTOGID)

EAS (один раз на проєкт):
  npx eas-cli@latest init
  npx eas-cli@latest env:create --name EAS_PROJECT_ID --environment preview --visibility plaintext
`);