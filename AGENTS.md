# AVTOGID — інструкції для агентів

Мобільний додаток (Expo SDK 54, TypeScript, expo-router) для пошуку СТО, автомагазинів і шиномонтажів поруч.

## Стек

- `com.avtogid.app`, slug `avtogid`, EAS `@serega312312/avtogid`
- Карта: `react-native-maps` + Google Maps SDK (Android)
- Дані: OpenStreetMap + Google Places API (New), Supabase
- Конфіг: `app.config.js` (не `app.json`)

## Конвенції

- UI-тексти для користувача — **українською**
- Не комітити `.env`, API-ключі, keystore, `google-services.json` з секретами
- Не додавати зайві markdown-файли без запиту
- Малі PR: одна фіча або один фікс на гілку

## Після змін у коді

```bash
npm run lint
```

Виправ помилки lint перед PR. Попередження (`warning`) допустимі, якщо не стосуються змінених файлів.

## Cursor Cloud specific instructions

Cloud Agent працює без локального ПК. Секрети — лише з **Cursor Dashboard → Cloud Agents → Secrets**, не з `.env` на машині.

### Змінні середовища (Secrets)

| Змінна | Призначення |
|--------|-------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps SDK |
| `GOOGLE_PLACES_API_KEY` | Places API (New) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `DATABASE_MANIFEST_URL` | опційно; є дефолт у `.env.example` |
| `DATABASE_BASE_URL` | опційно; є дефолт у `.env.example` |
| `EXPO_TOKEN` | лише якщо явно просять EAS build у cloud |

Чутливі ключі (`GOOGLE_*`, `SUPABASE_ANON_KEY`, `EXPO_TOKEN`) — тип **Runtime Secret** у dashboard.

### Що можна робити в cloud

- Рефакторинг, нові екрани, сервіси, хуки
- `npm ci`, `npm run lint`
- Створення PR з описом змін українською

### Що не робити без явного запиту

- `eas build` / `eas submit` (потрібен `EXPO_TOKEN` і окреме схвалення)
- Коміт `.env`, ключів, токенів
- Масові рефакторинги поза scope задачі
- Зміни в `database/supabase-schema.sql` без узгодження

### Перевірка змін

1. `npm ci` (або покладайся на `install` у `.cursor/environment.json`)
2. `npm run lint` — обов'язково; типи — `npx tsc --noEmit`
3. Запуск у cloud: `npx expo start` (Metro dev server, порт 8081). GUI не рендериться без Android-емулятора/пристрою — перевіряй збірку застосунку через Metro-бандл:
   `curl -s "http://localhost:8081/index.bundle?platform=android&dev=true&minify=false" -o /tmp/a.bundle -w "%{http_code}\n"` (200 + `grep -c "Unable to resolve module" /tmp/a.bundle` = 0 означає, що весь код застосунку компілюється).
4. `npx expo export --platform web` **не працює** — web-залежності (`react-dom`, `react-native-web`) не входять у проєкт; не встановлюй їх для перевірки.

> Примітка (Google): застосунок за дизайном працює без Google — джерело за замовчуванням OSM Overpass. Для Google-даних потрібні: секрет `GOOGLE_MAPS_API_KEY` (саме з `Y`) та увімкнені в GCP-проєкті **Places API (New)** і **Maps SDK for Android**. Без цього виклики Google повертають 403/дефолт, а застосунок тихо падає на OSM.

### Структура проєкту

- `app/` — expo-router екрани
- `src/components/`, `src/hooks/`, `src/services/` — логіка
- `src/constants/categories.ts` — категорії місць
- `scripts/` — збірка БД, Supabase setup (не запускати setup без запиту)

### Правила Windows / EAS

Див. `.cursor/rules/windows-eas-build.mdc` та `.cursor/rules/avtogid-project.mdc`.
