---
name: avtogid-play-release
description: >-
  Публікація AVTOGID у Google Play — Google API, EAS збірка APK/AAB, submit,
  скріншоти, privacy policy. Використовуй коли користувач питає про Play Market,
  реліз Android, eas build/submit, SHA-1, або тестовий APK.
---

# AVTOGID — реліз у Google Play

## Передумови

- [ ] Google Cloud: Maps SDK for Android + Places API (New)
- [ ] API key у `.env` і в EAS env (`preview` + `production`)
- [ ] Expo: `@serega312312/avtogid`, `eas login`
- [ ] Play Developer account ($25)

## Алгоритм

### 1. Google API key

1. [Google Cloud Console](https://console.cloud.google.com/) → проєкт AVTOGID
2. Увімкнути: Maps SDK for Android, Places API (New)
3. Credentials → API key → обмежити API
4. Після першої EAS-збірки: Android restriction `com.avtogid.app` + SHA-1 з expo.dev → Credentials

### 2. Локально + EAS env

```cmd
cd /d "C:\Users\Laptoper USA\Projects\AutoServiceMap"
set EAS_NO_VCS=1
npx eas-cli@latest env:create --name GOOGLE_MAPS_API_KEY --value "KEY" --environment preview --visibility secret
npx eas-cli@latest env:create --name GOOGLE_PLACES_API_KEY --value "KEY" --environment preview --visibility secret
```

Повторити для `--environment production` перед AAB.

### 3. Тестовий APK

```cmd
npx eas-cli@latest build --platform android --profile preview
```

Keystore: перший раз Yes, далі No. Встановити APK на Android, перевірити карту, список, фільтри, геолокацію.

### 4. Play Console — listing

| Поле | Джерело |
|------|---------|
| Короткий/повний опис | `docs/play-store-listing.md` |
| Privacy policy URL | опублікувати `docs/privacy-policy.html` (GitHub Pages / Google Sites) |
| Іконка 512×512 | `assets/icon.png` |
| Скріншоти | мін. 2 з телефона після APK |
| Категорія | Maps & Navigation |
| Email підтримки | у privacy policy і Console |

### 5. Production AAB + submit

```cmd
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android --profile production
```

`eas.json` → submit track: `internal` (для початку).

### 6. Після submit

- Internal testing → додати тестерів
- Модерація 1–7 днів
- iPhone: окремо App Store ($99/рік), Google Play лише Android

## Чеклист тесту APK

- [ ] Геолокація дозволена
- [ ] Карта з маркерами (не сіра)
- [ ] Список + фільтри
- [ ] Деталі місця, маршрут у Google Maps

## Типові помилки

| Помилка | Рішення |
|---------|---------|
| Run inside project directory | `cd /d` у AutoServiceMap |
| npm ERESOLVE на EAS | `.npmrc` legacy-peer-deps |
| babel-preset-expo missing | devDependency у package.json |
| Сіра карта | SHA-1 + Maps SDK restriction |
| PowerShell npx blocked | CMD або npx.cmd |
