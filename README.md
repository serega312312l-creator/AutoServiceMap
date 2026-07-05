# AVTOGID

Мобільний застосунок для пошуку **СТО**, **автомагазинів** та **шиномонтажів** поруч з вами в реальному часі.

## Можливості

- Карта з маркерами поруч (радіус 5 км)
- Список місць з відстанню та сортуванням
- Фільтри: усі / СТО / автомагазин / шини
- Детальна інформація: адреса, телефон, сайт, години роботи
- Маршрут до місця через Google Maps / Apple Maps
- Оновлення при русі (геолокація в реальному часі)

## Джерела даних

| Джерело | Що дає | API ключ |
|---------|--------|----------|
| **OpenStreetMap** (Overpass API) | СТО, автомагазини, шини | Не потрібен |
| **Google Places API** | Точніші дані, рейтинг, статус «відкрито» | Потрібен |

Без Google API ключ застосунок працює лише з OSM.

## Вимоги

1. [Node.js 20+](https://nodejs.org/)
2. [Expo Go](https://expo.dev/go) на телефоні (для швидкого тесту)
3. Google Cloud API ключ (опційно, для Google Places + карти)

## Швидкий старт

```bash
cd "C:\Users\Laptoper USA\Projects\AutoServiceMap"
npm install
npx expo start
```

Відскануйте QR-код у Expo Go на телефоні.

## Налаштування Google API

1. Створіть проєкт у [Google Cloud Console](https://console.cloud.google.com/)
2. Увімкніть API:
   - **Places API (New)**
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
3. Створіть API ключ і обмежте його за API
4. Вставте ключ у `app.json`:

```json
"ios": {
  "config": {
    "googleMapsApiKey": "ВАШ_КЛЮЧ"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "ВАШ_КЛЮЧ"
    }
  }
},
"extra": {
  "googlePlacesApiKey": "ВАШ_КЛЮЧ"
}
```

## Структура проєкту

```
app/                  # Екрани (Expo Router)
src/
  components/         # UI-компоненти
  hooks/              # Геолокація та завантаження місць
  services/           # Google Places, OSM, агрегатор
  types/              # TypeScript типи
  utils/              # Навігація, дзвінки
```

## Наступні кроки

- [ ] Додати авторизацію та збережені місця
- [ ] Push-сповіщення про нові СТО поруч
- [ ] Офлайн-кеш для OSM даних
- [ ] Збірка через EAS Build для App Store / Google Play

## Ліцензія

MIT
