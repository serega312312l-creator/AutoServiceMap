# AVTOGID — чеклист Google Play Console

Усе локально вже підготовлено в `docs/play-assets/` і `docs/play-store-listing.md`.
Нижче — лише кроки, які потребують твого акаунта Play.

## 1. Створити додаток

1. Відкрий [Play Console](https://play.google.com/console)
2. **Create app** → назва `AVTOGID`
3. Default language: **Ukrainian**
4. App or game: **App**
5. Free / Paid: **Free**
6. Прийми декларації

## 2. Main store listing

Скопіюй тексти з `docs/play-store-listing.md`.

Завантаж з `docs/play-assets/`:

- `icon-512.png` → App icon
- `feature-graphic-1024x500.png` → Feature graphic
- `screen-1-map.png`, `screen-2-markers.png`, `screen-4-detail.png`, `screen-5-nearby.png`, `screen-6-google-map.png` → Phone screenshots (мін. 2)

**Privacy policy URL:**

```
https://raw.githubusercontent.com/serega312312l-creator/AutoServiceMap/main/docs/privacy-policy.html
```

Категорія: **Maps & Navigation**  
Email підтримки: `serega312312l@gmail.com`

## 3. Data safety

| Питання | Відповідь |
|---------|-----------|
| Location | Yes — Approximate + Precise; app functionality; optional/required як у додатку |
| Photos | Yes — optional (користувач сам робить фото) |
| App info / Account | Optional (email при реєстрації) |
| Sold | No |
| Shared | Yes з Google Maps/Places (service providers) |
| Security practices | Data encrypted in transit (HTTPS) |

## 4. App content / політики

- Target audience: **18+** (або 13+ якщо оберете ширше; без контенту для дітей)
- Ads: **No**
- News app: No
- COVID: No
- Data safety — заповнити як вище

## 5. Internal testing

1. Testing → Internal testing → Create release
2. Завантаж AAB з EAS production (або `eas submit`)
3. Додай себе як тестера (email Google)
4. Відкрий opt-in link на телефоні Android

## 6. Після першої збірки (карта)

1. [expo.dev](https://expo.dev) → проєкт avtogid → Credentials → Android → SHA-1
2. Google Cloud → API key → Application restrictions → Android apps:
   - package: `com.avtogid.app`
   - SHA-1 з Expo
3. Увімкнути API: Maps SDK for Android, Places API (New)

## Команди збірки (CMD)

```cmd
cd /d "C:\Users\Laptoper USA\Projects\AutoServiceMap"
```

```cmd
set EAS_NO_VCS=1
```

```cmd
npx eas-cli@latest build --platform android --profile preview
```

```cmd
npx eas-cli@latest build --platform android --profile production
```

```cmd
npx eas-cli@latest submit --platform android --profile production
```
